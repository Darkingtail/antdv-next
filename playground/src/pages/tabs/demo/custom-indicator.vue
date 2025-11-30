<script setup lang="ts">
import { ref } from 'vue'

interface TabItem {
  key: string
  label: string
  content: string
}

function onChange(key: string) {
  console.log(key)
}

const items: TabItem[] = [
  { key: '1', label: 'Tab 1', content: 'Content of Tab Pane 1' },
  { key: '2', label: 'Tab 2', content: 'Content of Tab Pane 2' },
  { key: '3', label: 'Tab 3', content: 'Content of Tab Pane 3' },
]

type Align = 'start' | 'center' | 'end'

const alignValue = ref<Align>('center')

const activeKey = ref('1')
</script>

<template>
  <div>
    <a-segmented
      v-model:value="alignValue"
      style="margin-bottom: 8px;"
      :options="['start', 'center', 'end']"
    />
    <a-tabs
      v-model:active-key="activeKey"
      :items="items"
      :indicator="{ size: (origin: number) => origin - 20, align: alignValue }"
      @change="onChange"
    />
  </div>
</template>
