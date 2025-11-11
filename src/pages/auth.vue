<template>
  <div class="min-h-screen flex items-center justify-center">
    <Card>
      <template #content>
        <div class="w-auto sm:w-96">
          <h1 class="text-2xl font-bold text-center mb-6">
            {{ action === 'sign-in' ? 'Вход в аккаунт' : 'Регистрация' }}
          </h1>

          <form v-if="action === 'sign-in'" @submit.prevent="handleSignIn" class="space-y-6">
            <div>
              <label for="signInEmail" class="block mb-1 font-medium">Email</label>
              <InputText
                id="signInEmail"
                v-model="signInForm.email"
                autocomplete="email"
                :disabled="signInForm.loading"
                type="email"
                fluid
              />
            </div>

            <div>
              <label for="signInPassword" class="block mb-1 font-medium">Пароль</label>
              <Password
                id="signInPassword"
                v-model="signInForm.password"
                autocomplete="current-password"
                :disabled="signInForm.loading"
                :feedback="false"
                toggleMask
                fluid
              />
            </div>

            <Button label="Войти" type="submit" :loading="signInForm.loading" fluid />
          </form>

          <form v-else @submit.prevent="handleSignUp" class="space-y-6">
            <div>
              <label for="signUpEmail" class="block mb-1 font-medium">Email</label>
              <InputText
                id="signUpEmail"
                v-model="signUpForm.email"
                autocomplete="email"
                :disabled="signUpForm.loading"
                type="email"
                fluid
              />
            </div>

            <div>
              <label for="signUpPassword" class="block mb-1 font-medium">Пароль</label>
              <Password
                id="signUpPassword"
                v-model="signUpForm.password"
                autocomplete="new-password"
                :disabled="signUpForm.loading"
                :feedback="false"
                toggleMask
                fluid
              />
            </div>

            <Button label="Зарегистрироваться" type="submit" :loading="signUpForm.loading" fluid />
          </form>

          <div class="mt-6">
            <Button
              type="button"
              text
              fluid
              @click="toggleForm"
              :label="action === 'sign-in' ? 'Создать аккаунт' : 'Уже есть аккаунт? Войти'"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { signIn, signUp } from '../assets/scripts/api/auth'

const router = useRouter()

const action = ref<'sign-in' | 'sign-up'>('sign-in')

const signInForm = reactive({
  loading: false,
  email: '',
  password: '',
})

const signUpForm = reactive({
  loading: false,
  email: '',
  password: '',
})

function toggleForm() {
  if (action.value === 'sign-in') {
    action.value = 'sign-up'
  } else if (action.value === 'sign-up') {
    action.value = 'sign-in'
  }
}

async function handleSignIn() {
  signInForm.loading = true
  try {
    await signIn(signInForm.email, signInForm.password)
    await router.push('/')
  } catch {
    alert('Неверная почта или пароль')
  } finally {
    signInForm.loading = false
  }
}

async function handleSignUp() {
  signUpForm.loading = true
  try {
    await signUp(signUpForm.email, signUpForm.password)
    await router.push('/')
  } catch {
    alert('Ошибка регистрации')
  } finally {
    signUpForm.loading = false
  }
}
</script>
