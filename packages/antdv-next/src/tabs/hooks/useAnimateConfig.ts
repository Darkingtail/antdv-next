import type { AnimatedConfig } from '@v-c/tabs'
import type { TabsProps } from '..'
import { getTransitionName, getTransitionProps } from '@v-c/util/dist/utils/transition'

export default function useAnimateConfig(
  prefixCls: string,
  animated: TabsProps['animated'] = {
    inkBar: true,
    tabPane: false,
  },
): AnimatedConfig {
  let mergedAnimated: AnimatedConfig

  if (animated === false) {
    mergedAnimated = {
      inkBar: false,
      tabPane: false,
    }
  }
  else if (animated === true) {
    mergedAnimated = {
      inkBar: true,
      tabPane: true,
    }
  }
  else {
    mergedAnimated = {
      inkBar: true,
      ...(typeof animated === 'object' ? animated : {}),
    }
  }

  if (mergedAnimated.tabPane) {
    mergedAnimated.tabPaneMotion = getTransitionProps(
      getTransitionName(prefixCls, 'switch'),
      { appear: false },
    )
  }

  return mergedAnimated
}
