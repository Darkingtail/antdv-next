import type { Ref } from 'vue'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { toRef } from 'vue'

export function getSlotPropFn(slots: any, props: any, key: string) {
  // TODO: 需要考虑 function slot
  const fn = slots[key] || props[key]
  if (typeof fn === 'function') {
    return fn
  }
  return () => [fn]
}

export function getSlotPropsFnRun(slots: any, props: any, key: string, isNull = true) {
  const fn = getSlotPropFn(slots, props, key)
  if (typeof fn === 'function') {
    let node = fn?.()
    if (!Array.isArray(node)) {
      node = [node]
    }
    const nodes = filterEmpty(node).filter(v => v != null)
    if (nodes.length) {
      if (nodes.length === 1) {
        return nodes[0]
      }
      return nodes
    }
    return isNull ? null : undefined
  }
  return fn
}

export function toPropsRefs<T extends Record<string, any>, K extends keyof T>(obj: T, ...args: K[]) {
  const _res: Record<any, any> = {}
  args.forEach((key) => {
    _res[key] = toRef(obj, key)
  })
  return _res as { [key in K]-?: Ref<T[key]> }
}
