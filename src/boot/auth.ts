import { boot } from 'quasar/wrappers';
import { useAuthStore } from 'src/stores/auth';
import { Notify } from 'quasar';

export default boot(({ router }) => {
  const authStore = useAuthStore();

  router.beforeEach(async (to) => {
    if (to.path !== '/') {
      localStorage.setItem('lastRoute', to.path);
    }
    try {
      const route = localStorage.getItem('lastRoute') as string;
      const ok = await authStore.refreshSession();
      if (!ok) {
        if (to.path === '/') return;
        Notify.create({
          type: 'negative',
          message: 'Sua sessão expirou ou token inválido. Redirecionando...',
        });
        await router.replace('/');
        return false;
      }

      if (route !== to.path) {
        await router.replace(route);
        return true;
      }
    } catch {
      Notify.create({
        type: 'negative',
        message: 'Erro ao verificar sessão. Redirecionando...',
      });
      await router.replace('/');
      return false;
    }
  });
});
