import type { TooltipRef } from '..'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import Tooltip from '..'
import ConfigProvider from '../../config-provider'
import { mount, waitFakeTimer } from '/@tests/utils'

describe('tooltip.Unique', () => {
  let originOffsetParentDescriptor: PropertyDescriptor | undefined

  beforeAll(() => {
    originOffsetParentDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
      configurable: true,
      get: () => document.body,
    })
  })

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  afterAll(() => {
    if (originOffsetParentDescriptor) {
      Object.defineProperty(HTMLElement.prototype, 'offsetParent', originOffsetParentDescriptor)
    }
  })

  it('render MotionContent', async () => {
    const tooltipRef = ref<TooltipRef>()

    mount(
      {
        render() {
          return (
            <ConfigProvider tooltip={{ unique: true }}>
              <Tooltip title="text" open ref={tooltipRef}>
                <span>xxxx</span>
              </Tooltip>
            </ConfigProvider>
          )
        },
      },
      {
        attachTo: document.body,
      },
    )

    await waitFakeTimer()

    expect(document.querySelector('.ant-tooltip-unique-container')).toBeTruthy()
    expect(() => {
      tooltipRef.value?.forceAlign()
    }).not.toThrow()
  })
})
