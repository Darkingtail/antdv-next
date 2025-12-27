import type { SlotsType } from 'vue'
import type { AnyObject, EmptyEmit } from '../_util/type.ts'
import type { ColumnType } from './interface.ts'
import { defineComponent } from 'vue'

export interface ColumnProps<RecordType = AnyObject> extends ColumnType<RecordType> {
  children?: null
}

export interface ColumnSlots {
  default?: () => any
}

/**
 * Syntactic sugar for `columns` prop. HOC will not work on this.
 */
const Column = defineComponent<ColumnProps, EmptyEmit, string, SlotsType<ColumnSlots>>(
  () => {
    return () => null
  },
  {
    name: 'ATableColumn',
    inheritAttrs: false,
  },
)

export default Column
