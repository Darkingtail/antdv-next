<script setup lang="ts">
import { CheckOutlined, CloseOutlined } from '@antdv-next/icons'
import { shallowRef } from 'vue'

const checked = shallowRef()
const checked1 = shallowRef()
const checked2 = shallowRef()
</script>

<template>
  <a-switch v-model:checked="checked" checked-children="开启" un-checked-children="关闭" default-checked />
  <a-switch v-model:checked="checked1" checked-children="1" un-checked-children="0" />
  <a-switch v-model:checked="checked2" default-checked>
    <template #checkedChildren>
      <CheckOutlined />
    </template>
    <template #unCheckedChildren>
      <CloseOutlined />
    </template>
  </a-switch>
</template>
