import type { SemanticClassNamesType, SemanticStylesType } from '../_util/hooks'
import type { Breakpoint } from '../_util/responsiveObserver.ts'
import type { ComponentBaseProps } from '../config-provider/context.ts'
import type { RowProps } from '../grid'
import type { MasonryItemType } from './MasonryItem.tsx'
import { defineComponent } from 'vue'

export type Gap = number | undefined
export type Key = string | number

export type SemanticName = 'root' | 'item'

export type MasonryClassNamesType = SemanticClassNamesType<MasonryProps, SemanticName>
export type MasonryStylesType = SemanticStylesType<MasonryProps, SemanticName>

export interface MasonryProps extends ComponentBaseProps {
  classes?: MasonryClassNamesType
  styles?: MasonryStylesType
  /** Spacing between items */
  gutter?: RowProps['gutter']

  // Data
  items?: MasonryItemType[]

  itemRender?: (itemInfo: MasonryItemType & { index: number }) => any

  /** Number of columns in the masonry grid layout */
  columns?: number | Partial<Record<Breakpoint, number>>

  /** Trigger when item layout order changed */
  // onLayoutChange?: (sortInfo: { key: React.Key; column: number }[]) => void;

  fresh?: boolean

}

export interface MasonryEmits {
  layoutChange: (sortInfo: { key: Key, column: number }[]) => void
}

export interface MasonryRef {
  nativeElement: HTMLDivElement
}

type ItemColumnsType = [item: MasonryItemType, column: number]

const Masonry = defineComponent(() => {
  return () => {
    return null
  }
}, {
  name: 'AMasonry',
  inheritAttrs: false,
})

export default Masonry
