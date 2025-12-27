import type { SlotsType } from 'vue'
import type { AnyObject, EmptyEmit } from '../_util/type.ts'
import type { ColumnProps } from './Column.tsx'
import type { ColumnType } from './interface.ts'
import { defineComponent } from 'vue'

export interface ColumnGroupProps<RecordType = AnyObject>
  extends Omit<ColumnType<RecordType>, 'children'> {
  children: ColumnProps<RecordType> | ColumnProps<RecordType>[]
}

export interface ColumnGroupSlots {
  default?: () => any
}

/**
 * Syntactic sugar for `columns` prop. HOC will not work on this.
 */
const ColumnGroup = defineComponent<ColumnGroupProps, EmptyEmit, string, SlotsType<ColumnGroupSlots>>(
  () => {
    return () => null
  },
  {
    name: 'ATableColumnGroup',
    inheritAttrs: false,
  },
)

export default ColumnGroup
