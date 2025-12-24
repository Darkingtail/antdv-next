<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMobile } from '@/composables/mobile.ts'
import { useAppStore } from '@/stores/app.ts'

const { isMobile } = useMobile()
const appStore = useAppStore()
const { siderMenus, siderKey, siderOpenKeys } = storeToRefs(appStore)
</script>

<template>
  <main class="ant-doc-main mt-xl flex">
    <a-col v-if="!isMobile" class="ant-doc-main-sider" :xxl="4" :xl="5" :lg="6" :md="6" :sm="24" :xs="24">
      <a-menu class="ant-doc-main-sider-menu" :items="siderMenus" :selected-keys="siderKey" :open-keys="siderOpenKeys" />
    </a-col>
    <a-col :xxl="20" :xl="19" :lg="18" :md="18" :sm="24" :xs="24">
      <slot />
    </a-col>
  </main>
</template>

<style lang="less">
.ant-doc-main {
  &-sider {
    z-index: 1;
    position: sticky;
    top: var(--ant-doc-header-height);
    width: 100%;
    max-height: calc(100vh - var(--ant-doc-header-height));
    overflow: hidden;
    scrollbar-width: thin;
    scrollbar-gutter: stable;

    &-menu {
      min-height: 100%;
      padding-top: 0;
      padding-bottom: var(--ant-margin-xxl) !important;
      padding-inline: var(--ant-margin-xxs);
    }
  }
}
</style>
