<script setup lang="ts">
import type { FormInstance } from 'antdv-next'
import { reactive, shallowRef } from 'vue'

const model = reactive({
  username: '',
  password: '',
  remember: false,
})
function handleFinished(values: any) {
  console.log('Success:', values)
}
function handleFinishFailed(errorInfo: any) {
  console.log('Failed:', errorInfo)
}
const formRef = shallowRef<FormInstance>()
</script>

<template>
  <a-button @click="formRef?.resetFields?.()">
    重置表单
  </a-button>
  <a-button @click="formRef?.clearValidate?.()">
    清空校验
  </a-button>
  <a-form
    ref="formRef"
    :model="model"
    :label-col="{ span: 8 }"
    :wrapper-col="{ span: 16 }"
    style="max-width: 600px"
    @finish="handleFinished"
    @finish-failed="handleFinishFailed"
  >
    <a-form-item name="username" label="Username" :rules="[{ required: true, message: 'Please input your username!' }]">
      <input v-model="model.username">
    </a-form-item>
    <a-form-item name="password" label="Password" :rules="[{ required: true, message: 'Please input your password!' }]">
      <input v-model="model.password" type="password">
    </a-form-item>
    <a-form-item name="remember" :label="null">
      <input v-model="model.remember" type="checkbox"> Remember me!
    </a-form-item>
    <a-form-item :label="null">
      <a-button type="primary" html-type="submit">
        Submit
      </a-button>
    </a-form-item>
  </a-form>
</template>
