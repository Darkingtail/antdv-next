<script setup lang="ts">
import { computed, ref } from 'vue'

interface TabItem {
  key: string
  label: string
  content: string
}

type PositionType = 'left' | 'right'

const options = ['left', 'right']

const items: TabItem[] = Array.from({ length: 3 }).map((_, i) => {
  const id = String(i + 1)
  return {
    key: id,
    label: `Tab ${id}`,
    content: `Content of tab ${id}`,
  }
})

const position = ref<PositionType[]>(['left', 'right'])

const slot = computed(() => {
  if (position.value.length === 0) {
    return null
  }
  const result: Record<string, boolean> = {}
  position.value.forEach((dir) => {
    result[dir] = true
  })
  return result
})
</script>

<template>
  <div>
    <a-tabs :items="items">
      <template #tabBarExtraContent>
        <a-button>Extra Action</a-button>
      </template>
    </a-tabs>
    <br>
    <br>
    <br>
    <div>You can also specify its direction or both side</div>
    <a-divider />
    <a-checkbox-group v-model:value="position" :options="options" />
    <br>
    <br>
    <a-tabs :items="items">
      <template v-if="slot?.left" #leftExtra>
        <a-button class="tabs-extra-demo-button">
          Left Extra Action
        </a-button>
      </template>
      <template v-if="slot?.right" #rightExtra>
        <a-button>Right Extra Action</a-button>
      </template>
    </a-tabs>
  </div>
</template>
