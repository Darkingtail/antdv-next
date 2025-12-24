import { componentLocales, components } from './components'

export const menusMap: Record<string, {
  locales: Record<string, Record<string, string>>
  menus: any[]
}> = {
  '/components': {
    locales: componentLocales,
    menus: components,
  },
}
