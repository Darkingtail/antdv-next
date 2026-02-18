import type { TooltipProps } from '..'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import Tooltip from '..'
import { mount, waitFakeTimer } from '/@tests/utils'

async function flushTooltipTimer() {
  await waitFakeTimer(100, 10)
}

describe('tooltip.Semantic', () => {
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

  it('should support static classes and styles', async () => {
    const classes: TooltipProps['classes'] = {
      root: 'custom-root',
      container: 'custom-container',
    }

    const styles: TooltipProps['styles'] = {
      root: { backgroundColor: 'red' },
      container: { color: 'blue' },
    }

    mount(Tooltip, {
      attachTo: document.body,
      props: {
        title: 'Test tooltip',
        classes,
        styles,
        open: true,
      },
      slots: {
        default: () => <span>Test</span>,
      },
    })

    await flushTooltipTimer()

    const tooltipElement = document.querySelector<HTMLElement>('.ant-tooltip')
    const tooltipContainer = document.querySelector<HTMLElement>('.ant-tooltip-container')

    expect(tooltipElement).not.toBeNull()
    expect(tooltipContainer).not.toBeNull()
    expect(tooltipElement).toHaveClass(classes.root!)
    expect(tooltipContainer).toHaveClass(classes.container!)
    expect(tooltipElement).toHaveStyle('background-color: rgb(255, 0, 0)')
    expect(tooltipContainer).toHaveStyle('color: rgb(0, 0, 255)')
  })

  it('should support function-based classes and styles', async () => {
    const classes: TooltipProps['classes'] = (info) => {
      if (info.props.color === 'blue') {
        return { root: 'blue-tooltip' }
      }
      return { root: 'default-tooltip' }
    }

    const styles: TooltipProps['styles'] = (info) => {
      if (info.props.placement === 'top') {
        return { container: { fontSize: '16px' } }
      }
      return { container: { fontSize: '14px' } }
    }

    mount(Tooltip, {
      attachTo: document.body,
      props: {
        title: 'Test tooltip',
        color: 'blue',
        placement: 'top',
        classes,
        styles,
        open: true,
      },
      slots: {
        default: () => <span>Test</span>,
      },
    })

    await flushTooltipTimer()

    const tooltipElement = document.querySelector<HTMLElement>('.ant-tooltip')
    const tooltipContainer = document.querySelector<HTMLElement>('.ant-tooltip-container')

    expect(tooltipElement).not.toBeNull()
    expect(tooltipContainer).not.toBeNull()
    expect(tooltipElement).toHaveClass('blue-tooltip')
    expect(tooltipContainer).toHaveStyle('font-size: 16px')
  })
})
