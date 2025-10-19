import type { InjectionKey, Ref } from 'vue'
import type { AntAnchor } from './Anchor'
import { inject, provide } from 'vue'

export type AnchorContextType = Pick<AntAnchor, 'onClick' | 'unregisterLink' | 'registerLink' | 'scrollTo'> & {
  activeLink: Ref<string>
  direction: Ref<AntAnchor['direction']>
}

const AnchorContextKey: InjectionKey<AnchorContextType> = Symbol('AnchorContext')

export function useAnchorProvider(ctx: AnchorContextType) {
  provide(AnchorContextKey, ctx)
}

export function useAnchorContext() {
  return inject(AnchorContextKey, undefined)
}
