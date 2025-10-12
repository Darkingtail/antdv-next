import type { CSSInterpolation, CSSObject } from '../../hooks/useStyleRegister'
import type { TokenType } from '../../theme'
import type { UseCSP } from '../hooks/useCSP'
import type { UsePrefix } from '../hooks/usePrefix'
import type { UseToken } from '../hooks/useToken'
import type {
  ComponentTokenKey,
  GlobalTokenWithComponent,
  TokenMap,
  TokenMapKey,
  UseComponentStyleResult,
} from '../interface'

export interface StyleInfo {
  hashId: string
  prefixCls: string
  rootPrefixCls: string
  iconPrefixCls: string
}

export interface CSSUtil {
  calc: (value: any) => any
  max: (...values: (number | string)[]) => number | string
  min: (...values: (number | string)[]) => number | string
}

export type TokenWithCommonCls<T> = T & {
  componentCls: string
  prefixCls: string
  iconCls: string
  antCls: string
} & CSSUtil

export type FullToken<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
> = TokenWithCommonCls<GlobalTokenWithComponent<CompTokenMap, AliasToken, C>>

export type GenStyleFn<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
> = (token: FullToken<CompTokenMap, AliasToken, C>, info: StyleInfo) => CSSInterpolation

export type GetDefaultTokenFn<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
> = (token: AliasToken & Partial<CompTokenMap[C]>) => CompTokenMap[C]

export type GetDefaultToken<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  C extends TokenMapKey<CompTokenMap>,
> = null | CompTokenMap[C] | GetDefaultTokenFn<CompTokenMap, AliasToken, C>

export interface SubStyleComponentProps {
  prefixCls: string
  rootCls?: string
}

export interface CSSVarRegisterProps {
  rootCls: string
  component: string
  cssVar: {
    prefix?: string
    key?: string
  }
}

export interface GetResetStylesConfig {
  prefix: ReturnType<UsePrefix>
  csp: ReturnType<UseCSP>
}

export type GetResetStyles<AliasToken extends TokenType> = (
  token: AliasToken,
  config?: GetResetStylesConfig,
) => CSSInterpolation

export type GetCompUnitless<CompTokenMap extends TokenMap, AliasToken extends TokenType> = <
  C extends TokenMapKey<CompTokenMap>,
>(component: C | [C, string]
) => Partial<Record<ComponentTokenKey<CompTokenMap, AliasToken, C>, boolean>>

export interface GenStyleUtilsConfig<
  CompTokenMap extends TokenMap,
  AliasToken extends TokenType,
  DesignToken extends TokenType,
> {
  usePrefix: UsePrefix
  useToken: UseToken<CompTokenMap, AliasToken, DesignToken>
  useCSP?: UseCSP
  getResetStyles?: GetResetStyles<AliasToken>
  getCommonStyle?: (
    token: AliasToken,
    componentPrefixCls: string,
    rootCls?: string,
    resetFont?: boolean,
  ) => CSSObject
  getCompUnitless?: GetCompUnitless<CompTokenMap, AliasToken>
  layer?: any
}

export interface GenStyleUtilsResult {
  genStyleHooks: (...args: any[]) => (...args: any[]) => UseComponentStyleResult
  genSubStyleComponent: (...args: any[]) => any
  genComponentStyleHook: (...args: any[]) => (...args: any[]) => UseComponentStyleResult
}
