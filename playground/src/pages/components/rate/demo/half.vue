<script lang="ts" setup>
import { ref } from 'vue'

const val = ref(2.5)
</script>

<template>
  <a-rate v-model:value="val" allow-half />
</template>
