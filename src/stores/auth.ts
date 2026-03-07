import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const userID = ref<number | null>(null);
  async function login(credentials: { email: string; password: string }) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error('Erro inesperado');
    }
  }

  async function register(credentials: { email: string; password: string }) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao registrar');
      }
      Notify.create({
        type: 'positive',
        message: data.message || 'Registro realizado com sucesso!',
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error('Erro inesperado');
    }
  }

  async function logout() {
    userID.value = null;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Erro ao fazer logout');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error('Erro inesperado');
    }
  }

  async function refreshSession() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/refreshToken/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        userID.value = null;
        return false;
      }

      const data = await response.json();
      userID.value = data.res.id;
      isAuthenticated.value = true;
      return true;
    } catch {
      userID.value = null;
      return false;
    }
  }

  return {
    userID,
    login,
    register,
    logout,
    refreshSession,
  };
});
