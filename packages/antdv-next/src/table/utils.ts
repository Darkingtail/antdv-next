import type { ColumnsType } from './interface.ts'
import { flattenChildren } from '@v-c/util/dist/props-util'
import { isVNode } from 'vue'

export function convertColumnsToColumnProps<RecordType>(children: any): ColumnsType<RecordType> {
  return flattenChildren(children)
    .filter(node => isVNode(node))
    .map((node: any) => {
      const { key, props, children: nodeChildren } = node
      const column: any = {
        key,
        ...(props || {}),
      }

      if (nodeChildren?.default) {
        column.children = convertColumnsToColumnProps(nodeChildren.default())
      }

      return column
    })
    .filter(Boolean)
}
