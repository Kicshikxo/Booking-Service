<template>
  <div class="min-h-screen flex items-center justify-center">
    <Button label="Выйти" :loading="signOutLoading" @click="handleSignOut" />
  </div>
</template>

<script lang="ts" setup>
import Button from 'primevue/button'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from '../assets/scripts/api/auth'

const router = useRouter()

const signOutLoading = ref(false)

async function handleSignOut() {
  signOutLoading.value = true
  try {
    await signOut()
    await router.push('/auth')
  } catch (error: any) {
    alert('Ошибка выхода')
  } finally {
    signOutLoading.value = false
  }
}
</script>

<style lang="scss" scoped></style>
