<script setup lang="ts">
import { AndroidOutlined, AppleOutlined } from '@antdv-next/icons'
import { h, ref } from 'vue'

const icons = [AppleOutlined, AndroidOutlined]

const items = icons.map((Icon, i) => {
  const id = String(i + 1)
  return {
    key: id,
    label: `Tab ${id}`,
    content: `Tab ${id}`,
    icon: () => h(Icon),
  }
})
const activeKey = ref('2')
</script>

<template>
  <a-tabs v-model:active-key="activeKey" :items="items" />
</template>
