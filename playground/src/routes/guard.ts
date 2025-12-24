import type { Router } from 'vue-router'

export function setupRouterGuard(router: Router) {
  router.beforeEach(
    () => {
      return true
    },
  )
}
