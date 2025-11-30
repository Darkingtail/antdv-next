<script setup lang="ts">
import type { TabsProps } from 'antdv-next'
import { ref } from 'vue'

const items: TabsProps['items'] = Array.from({ length: 3 }).map((_, i) => {
  const id = String(i + 1)
  return {
    key: id,
    label: `Tab ${id}`,
    content: `Content of Tab Pane ${id}`,
  }
})
const activeKey = ref('1')
</script>

<template>
  <a-tabs v-model:active-key="activeKey" centered :items="items" />
</template>
