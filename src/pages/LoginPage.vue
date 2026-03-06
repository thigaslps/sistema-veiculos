<template>
  <div class="flex flex-center" style="height: 100vh">
    <q-card class="column" style="width: 80%; height: 70%">
      <q-card-section class="col scroll">
        <div class="flex column q-gutter-xl flex-center">
          <div class="flex q-gutter-md flex-center">
            <div
              class="flex q-gutter-sm flex-center cursor-pointer"
              :class="{ 'text-primary': actualTab === 'login' }"
              @click="setActualTab('login')"
            >
              <i class="fas fa-sign-in-alt"></i><span>Acesse</span>
            </div>
            <div
              class="flex q-gutter-sm flex-center cursor-pointer"
              :class="{ 'text-primary': actualTab === 'register' }"
              @click="setActualTab('register')"
            >
              <i class="fas fa-user-plus"></i><span>Registrar</span>
            </div>
          </div>

          <div class="flex column q-gutter-md flex-center" style="width: 60%">
            <q-input
              class="full-width"
              v-model="email"
              label="Email"
              name="email"
              type="email"
              :rules="[
                (val: string) => !!val || 'Email é obrigatório',
                (val: string) => val.includes('@') || 'Email inválido',
              ]"
            />

            <q-input
              v-model="password"
              class="full-width"
              label="Senha"
              name="password"
              type="password"
              :rules="[validatePassword]"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" :loading="loading" @click="handleSubmit">
          {{ actualTab === 'login' ? 'Acessar' : 'Registrar' }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { useRouter } from 'vue-router';
const router = useRouter();
const authStore = useAuthStore();

const actualTab = ref('login');

function setActualTab(tab: string) {
  actualTab.value = tab;
}

const email = ref('');
const password = ref('');

const loading = ref(false);

function validatePassword(val: string): string | true {
  if (!val) return 'Senha é obrigatória';
  if (val.length < 8) return 'Senha deve ter pelo menos 8 caracteres';
  if (!/[A-Z]/.test(val)) return 'Senha deve conter pelo menos uma letra maiúscula';
  if (!/[a-z]/.test(val)) return 'Senha deve conter pelo menos uma letra minúscula';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(val))
    return 'Senha deve conter pelo menos um caractere especial';

  return true;
}

const handleSubmit = async () => {
  loading.value = true;
  if (!email.value) {
    Notify.create({
      message: 'Email é obrigatório',
      type: 'negative',
    });
    loading.value = false;
    return;
  }

  const passwordValidation = validatePassword(password.value);

  if (passwordValidation !== true) {
    Notify.create({
      type: 'negative',
      message: passwordValidation,
    });
    loading.value = false;
    return;
  }

  try {
    if (actualTab.value === 'login') {
      await authStore.login({ email: email.value, password: password.value });
    } else {
      await authStore.register({ email: email.value, password: password.value });
    }

    await router.push('/admin/dashboard');
  } catch (error: unknown) {
    console.error('Erro ao fazer login/registro:', error);
    if (error instanceof Error) {
      Notify.create({
        message: error.message || 'Erro ao fazer login/registro',
        type: 'negative',
      });
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped></style>
