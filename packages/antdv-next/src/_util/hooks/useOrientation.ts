import type { Ref } from 'vue'
import { computed } from 'vue'

export type Orientation = 'horizontal' | 'vertical'

function isValidOrientation(orientation?: Orientation) {
  return orientation === 'horizontal' || orientation === 'vertical'
}

export function useOrientation(orientation?: Ref<Orientation | undefined>, vertical?: Ref<boolean | undefined>, legacyDirection?: Ref<Orientation | undefined>) {
  const _orientation = computed(() => {
    const validOrientation = isValidOrientation(orientation?.value)
    let mergedOrientation: Orientation
    if (validOrientation) {
      mergedOrientation = orientation!.value!
    }
    else if (typeof vertical?.value === 'boolean') {
      mergedOrientation = vertical?.value ? 'vertical' : 'horizontal'
    }
    else {
      const validLegacyDirection = isValidOrientation(legacyDirection?.value)
      mergedOrientation = validLegacyDirection ? legacyDirection!.value! : 'horizontal'
    }
    return [mergedOrientation, mergedOrientation === 'vertical'] as [Orientation, boolean]
  })
  const mergedOrientation = computed(() => _orientation.value[0])
  const isVertical = computed(() => _orientation.value[1])
  return [mergedOrientation, isVertical] as [Ref<Orientation>, Ref<boolean>]
}
