<script lang="ts" setup>
import { HeartOutlined } from '@antdv-next/icons'
import { h, ref } from 'vue'

const value = ref()
</script>

<template>
  <a-flex vertical gap="middle">
    <a-rate v-model:value="value" :character="h(HeartOutlined)" allow-half />
    <a-rate v-model:value="value" character="A" allow-half style="font-size: 36px" />
    <a-rate v-model:value="value" character="好" allow-half />
  </a-flex>
</template>
