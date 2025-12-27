import type { SlotsType } from 'vue'
import KeyCode from '@v-c/util/dist/KeyCode'
import { defineComponent } from 'vue'

export interface FilterDropdownMenuWrapperProps {
  class?: string
  className?: string
}

const FilterDropdownMenuWrapper = defineComponent<
  FilterDropdownMenuWrapperProps,
  {
    [key: string]: (...args: any[]) => void
  },
  string,
  SlotsType<{ default?: () => any }>
>(
  (props, { slots }) => {
    const onKeydown = (event: KeyboardEvent) => {
      if ((event as any).keyCode === KeyCode.ENTER) {
        event.stopPropagation()
      }
    }

    return () => (
      <div
        class={props.className || props.class}
        onClick={e => e.stopPropagation()}
        onKeydown={onKeydown}
      >
        {slots.default?.()}
      </div>
    )
  },
  {
    name: 'FilterDropdownMenuWrapper',
  },
)

export default FilterDropdownMenuWrapper
