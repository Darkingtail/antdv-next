<script setup lang="ts">
import { ref } from 'vue'

const value = ref()
</script>

<template>
  <a-flex vertical :gap="12">
    <a-rate v-model:value="value" size="large" />
    <a-rate v-model:value="value" />
    <a-rate v-model:value="value" size="small" />
  </a-flex>
</template>
