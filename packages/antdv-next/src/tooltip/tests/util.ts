export function isTooltipOpen() {
  const tooltipEle = document.querySelector('.ant-tooltip')
  if (!tooltipEle) {
    return false
  }

  const ele = tooltipEle as HTMLElement
  if (ele.classList.contains('ant-tooltip-hidden')) {
    return false
  }

  return getComputedStyle(ele).display !== 'none'
}
