import type { TabPaneProps as VcTabPaneProps } from '@v-c/tabs'
import type { CSSProperties, SlotsType } from 'vue'
import type { EmptyEmit } from '../_util/type.ts'
import { defineComponent } from 'vue'

export interface TabPaneProps extends VcTabPaneProps {
  /** @deprecated Please use `destroyOnHidden` instead */
  destroyInactiveTabPane?: boolean
  class?: string
  style?: CSSProperties
}

export interface TabPaneSlots {
  default?: () => any
  tab?: () => any
  closeIcon?: () => any
  icon?: () => any
}

const TabPane = defineComponent<TabPaneProps, EmptyEmit, string, SlotsType<TabPaneSlots>>(
  () => {
    return () => null
  },
  {
    name: 'ATabPane',
    inheritAttrs: false,
  },
)

export default TabPane
