<script setup lang="ts">
import { ref } from 'vue'

interface TabItem {
  key: string
  label: string
  content: string
  disabled?: boolean
}

const items: TabItem[] = [
  {
    key: '1',
    label: 'Tab 1',
    content: 'Tab 1',
  },
  {
    key: '2',
    label: 'Tab 2',
    content: 'Tab 2',
    disabled: true,
  },
  {
    key: '3',
    label: 'Tab 3',
    content: 'Tab 3',
  },
]
const activeKey = ref('1')
</script>

<template>
  <a-tabs v-model:active-key="activeKey" :items="items" />
</template>
