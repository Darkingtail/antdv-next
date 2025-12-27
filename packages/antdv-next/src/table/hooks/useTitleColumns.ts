import type { Ref } from 'vue'
import type { AnyObject } from '../../_util/type.ts'
import type { ColumnGroupType, ColumnsType, ColumnTitleProps, ColumnType, TransformColumns } from '../interface.ts'
import { unref } from 'vue'
import { renderColumnTitle } from '../util.ts'

function fillTitle<RecordType extends AnyObject = AnyObject>(columns: ColumnsType<RecordType>, columnTitleProps: ColumnTitleProps<RecordType>) {
  const finalColumns = columns.map((column) => {
    const cloneColumn: ColumnGroupType<RecordType> | ColumnType<RecordType> = { ...column }
    cloneColumn.title = renderColumnTitle(column.title, columnTitleProps) as any
    if ('children' in cloneColumn) {
      cloneColumn.children = fillTitle<RecordType>(cloneColumn.children, columnTitleProps)
    }
    return cloneColumn
  })
  return finalColumns
}

type MaybeRef<T> = T | Ref<T>

export default function useTitleColumns<RecordType extends AnyObject = AnyObject>(
  columnTitleProps: MaybeRef<ColumnTitleProps<RecordType>>,
) {
  const filledColumns: TransformColumns<RecordType> = columns =>
    fillTitle<RecordType>(columns, unref(columnTitleProps))
  return [filledColumns] as const
}
