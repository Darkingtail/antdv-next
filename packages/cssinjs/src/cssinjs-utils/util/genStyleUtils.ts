import type { TokenType } from '../../theme'
import type { UseTokenReturn } from '../hooks/useToken'
import type { TokenMap, TokenMapKey, UseComponentStyleResult } from '../interface'
import type {
  GenStyleFn,
  GenStyleUtilsConfig,
  GenStyleUtilsResult,
  GetCompUnitless,
  GetDefaultToken,
  StyleInfo,
} from './genStyleUtils.types'
import { computed, defineComponent } from 'vue'
import useCSSVarRegister from '../../hooks/useCSSVarRegister'
import useStyleRegister from '../../hooks/useStyleRegister'
import genCalc from '../../theme/calc'
import { token2CSSVar } from '../../util'
import useUniqueMemo from '../_util/hooks/useUniqueMemo'
import useDefaultCSP from '../hooks/useCSP'
import getComponentToken from './getComponentToken'
import getCompVarPrefix from './getCompVarPrefix'

import getDefaultComponentToken from './getDefaultComponentToken'
import genMaxMin from './maxmin'
// eslint-disable-next-line import/no-named-default
import { merge as mergeToken, default as statisticToken } from './statistic'

function genStyleUtils<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  DesignToken extends TokenType,
>(config: GenStyleUtilsConfig<CompTokenMap, AliasToken, DesignToken>): GenStyleUtilsResult {
  const {
    usePrefix,
    useToken,
    getResetStyles,
    getCommonStyle,
    getCompUnitless,
    useCSP = useDefaultCSP,
    layer,
  } = config

  function genCSSVarRegister<C extends TokenMapKey<CompTokenMap>>(
    component: C,
    getDefaultToken: GetDefaultToken<CompTokenMap, AliasToken, C> | undefined,
    options: {
      unitless?: ReturnType<Exclude<GetCompUnitless<CompTokenMap, AliasToken>, undefined>>
      ignore?: Record<string, boolean>
      deprecatedTokens?: [string, string][]
      injectStyle?: boolean
      prefixToken: (key: string) => string
    },
  ) {
    return (rootCls: string) => {
      const tokenData = useToken() as UseTokenReturn<CompTokenMap, AliasToken, DesignToken>
      const cssVar = tokenData.cssVar
      const realToken = tokenData.realToken ?? tokenData.token

      if (options.injectStyle !== false && cssVar?.key) {
        const registerConfig = computed(() => ({
          path: [component as string],
          prefix: cssVar.prefix,
          key: cssVar.key!,
          unitless: options.unitless,
          ignore: options.ignore,
          token: realToken,
          scope: rootCls,
        }))

        useCSSVarRegister(registerConfig as any, () => {
          const defaultToken = getDefaultComponentToken(
            component as any,
            realToken as any,
            getDefaultToken as any,
          ) as Record<string, any>

          const componentToken = getComponentToken(
            component as any,
            realToken as any,
            defaultToken,
            { deprecatedTokens: options.deprecatedTokens as any },
          )

          Object.keys(defaultToken || {}).forEach((key) => {
            componentToken[options.prefixToken(key)] = componentToken[key]
            delete componentToken[key]
          })

          return componentToken
        })
      }

      return [(node: any) => node, cssVar?.key] as const
    }
  }

  function genComponentStyleHook<C extends TokenMapKey<CompTokenMap>>(
    componentName: C | [C, string],
    styleFn: GenStyleFn<CompTokenMap, AliasToken, C>,
    getDefaultToken?: GetDefaultToken<CompTokenMap, AliasToken, C>,
    options: any = {},
  ) {
    const cells = (Array.isArray(componentName) ? componentName : [componentName, componentName]) as [C, string]
    const [component, componentAlias] = cells

    const mergedLayer = layer || { name: 'antd' }

    return (prefixCls: string, rootCls: string = prefixCls): UseComponentStyleResult => {
      const tokenData = useToken() as any
      const {
        theme,
        token,
        realToken = token,
        hashId = '',
        cssVar,
      } = tokenData

      const { rootPrefixCls, iconPrefixCls } = usePrefix()
      const csp = useCSP()

      const type: 'css' | 'js' = cssVar ? 'css' : 'js'

      const calc = useUniqueMemo(() => {
        const unitlessCssVar = new Set<string>()
        if (cssVar) {
          const unitlessMap = (getCompUnitless && getCompUnitless(componentName as any)) || {}
          Object.keys(unitlessMap).forEach((key) => {
            unitlessCssVar.add(token2CSSVar(key, cssVar.prefix))
            unitlessCssVar.add(token2CSSVar(key, getCompVarPrefix(componentAlias as any, cssVar.prefix)))
          })
        }

        return genCalc(type, unitlessCssVar)
      }, [type, componentAlias, cssVar?.prefix])

      const { max, min } = genMaxMin(type)

      if (typeof getResetStyles === 'function') {
        useStyleRegister(
          computed(() => ({
            theme,
            token,
            hashId,
            nonce: csp?.nonce,
            clientOnly: false,
            layer: mergedLayer,
            order: options.order ?? -999,
            path: ['Shared', rootPrefixCls],
          })),
          () => getResetStyles(token, { prefix: { rootPrefixCls, iconPrefixCls }, csp }),
        )
      }

      const wrapSSR = useStyleRegister(
        computed(() => ({
          theme,
          token,
          hashId,
          nonce: csp?.nonce,
          clientOnly: options.clientOnly,
          layer: mergedLayer,
          order: options.order ?? -999,
          path: [cells.join('-'), prefixCls, iconPrefixCls],
        })),
        () => {
          if (options.injectStyle === false) {
            return []
          }

          const { token: proxyToken, flush } = statisticToken(token as any)

          const defaultComponentToken = getDefaultComponentToken(
            component as any,
            realToken as any,
            getDefaultToken as any,
          ) as Record<string, any>

          const componentToken = getComponentToken(
            component as any,
            realToken as any,
            defaultComponentToken,
            { deprecatedTokens: options.deprecatedTokens as any },
          )

          if (cssVar && defaultComponentToken && typeof defaultComponentToken === 'object') {
            Object.keys(defaultComponentToken).forEach((key) => {
              defaultComponentToken[key] = `var(${token2CSSVar(
                key,
                getCompVarPrefix(componentAlias as any, cssVar.prefix),
              )})`
            })
          }

          const mergedToken = mergeToken<any>(
            proxyToken,
            {
              componentCls: `.${prefixCls}`,
              prefixCls,
              iconCls: `.${iconPrefixCls}`,
              antCls: `.${rootPrefixCls}`,
              calc,
              max,
              min,
            },
            cssVar ? defaultComponentToken : componentToken,
          )

          const styleInterpolation = styleFn(mergedToken as any, {
            hashId,
            prefixCls,
            rootPrefixCls,
            iconPrefixCls,
          } as StyleInfo)

          flush(componentAlias as any, componentToken)

          const commonStyle
            = typeof getCommonStyle === 'function'
              ? getCommonStyle(mergedToken, prefixCls, rootCls, options.resetFont)
              : null

          return [options.resetStyle === false ? null : commonStyle, styleInterpolation].filter(Boolean)
        },
      )

      const cssVarHook = genCSSVarRegister(
        component,
        getDefaultToken,
        {
          unitless: getCompUnitless?.(componentName as any),
          ignore: options.ignore,
          deprecatedTokens: options.deprecatedTokens,
          injectStyle: options.injectStyle,
          prefixToken: (key: string) => `${String(component)}${key.slice(0, 1).toUpperCase()}${key.slice(1)}`,
        },
      )

      const [wrapCSSVar, cssVarCls] = cssVarHook(rootCls)

      const wrapAll = (node: any) => wrapCSSVar(wrapSSR(node))

      return [wrapAll, hashId, cssVarCls] as UseComponentStyleResult
    }
  }

  function genStyleHooks<C extends TokenMapKey<CompTokenMap>>(
    component: C | [C, string],
    styleFn: GenStyleFn<CompTokenMap, AliasToken, C> | GenStyleFn<CompTokenMap, AliasToken, C>[],
    getDefaultToken?: GetDefaultToken<CompTokenMap, AliasToken, C>,
    options?: Parameters<typeof genComponentStyleHook<C>>[3],
  ) {
    const styleFns = Array.isArray(styleFn) ? styleFn : [styleFn]

    const useStyle = genComponentStyleHook<C>(
      component,
      (token, info) => styleFns.map(fn => fn(token, info)),
      getDefaultToken,
      options,
    )

    const cssVarHook = genCSSVarRegister(
      Array.isArray(component) ? component[0] : component,
      getDefaultToken,
      {
        unitless: options?.unitless,
        ignore: options?.ignore,
        deprecatedTokens: options?.deprecatedTokens,
        injectStyle: options?.injectStyle,
        prefixToken: (key: string) => `${String(Array.isArray(component) ? component[0] : component)}${key.slice(0, 1).toUpperCase()}${key.slice(1)}`,
      },
    )

    return (prefixCls: string, rootCls: string = prefixCls) => {
      const [wrapSSR, hashId, cssVarCls] = useStyle(prefixCls, rootCls)
      const [wrapCSSVar] = cssVarHook(rootCls)

      const wrapAll = (node: any) => wrapCSSVar(wrapSSR(node))

      return [wrapAll, hashId, cssVarCls] as UseComponentStyleResult
    }
  }

  function genSubStyleComponent<C extends TokenMapKey<CompTokenMap>>(
    componentName: C | [C, string],
    styleFn: GenStyleFn<CompTokenMap, AliasToken, C>,
    getDefaultToken?: GetDefaultToken<CompTokenMap, AliasToken, C>,
    options?: Parameters<typeof genComponentStyleHook<C>>[3],
  ) {
    const useStyle = genComponentStyleHook(componentName, styleFn, getDefaultToken, {
      resetStyle: false,
      order: -998,
      ...options,
    })

    return defineComponent({
      name: `SubStyle_${String(Array.isArray(componentName) ? componentName.join('.') : componentName)}`,
      props: {
        prefixCls: {
          type: String,
          required: true,
        },
        rootCls: {
          type: String,
          default: undefined,
        },
      },
      setup(props) {
        useStyle(props.prefixCls, props.rootCls ?? props.prefixCls)
        return () => null
      },
    }) as any
  }

  return {
    genStyleHooks,
    genSubStyleComponent,
    genComponentStyleHook,
  }
}

export default genStyleUtils
export * from './genStyleUtils.types'
