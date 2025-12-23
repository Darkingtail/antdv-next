<script setup lang="ts">
import { ref } from 'vue'
import { headerItems } from '@/config/menu/header'

const selectedKeys = ref<string[]>([])
</script>

<template>
  <div
    class="ant-doc-header a-bg-container sticky top-0 z-1000 w-full a-shadow-ter"
  >
    <a-row>
      <a-col :xxl="4" :xl="5" :lg="6" :md="6" :sm="24" :xs="24">
        <h1 class="m-0 p-0">
          <a class="inline-flex items-center pl-40px h-[var(--ant-doc-header-height)] line-height-[var(--ant-doc-header-height)] text-18px font-bold a-color-text hover:a-color-text of-hidden" href="/">
            <img src="../../assets/antdv-next.svg" class="w-36px h-36px inline-block align-middle" draggable="false" alt="logo">
            <span class="ml-2">
              Antdv Next
            </span>
          </a>
        </h1>
      </a-col>
      <a-col :xxl="20" :xl="19" :lg="18" :md="18" :sm="0" :xs="0">
        <div class="ant-doc-header-right flex items-center pr-[var(--ant-padding)] gap-sm h-full">
          <div class="b-l-1 b-l-solid b-l-black/6 flex items-center m-0" style="flex: auto">
            sss
          </div>
          <a-menu
            v-model:selected-keys="selectedKeys"
            class="h-full border-b-none ant-doc-header-menu"
            mode="horizontal"
            :items="headerItems"
          />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<style lang="less">
.ant-doc-header {
  height: var(--ant-doc-header-height);
}
.ant-doc-header a {
  white-space: nowrap;
  text-decoration: none;
}

.ant-doc-header-right {
  > * {
    flex: none;
    margin: 0;
  }
}
.ant-doc-header-menu {
  .ant-menu-item {
    height: var(--ant-doc-header-height);
    line-height: var(--ant-doc-header-height);
  }
}
</style>
