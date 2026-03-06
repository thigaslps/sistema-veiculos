<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> Sistema de carros</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <SidebarLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
          :active-link="activeLink"
          @select="changeRoute"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import SidebarLink, { type SidebarLinkProps } from 'components/SidebarLink.vue';
const useStore = useAuthStore();
import { Notify } from 'quasar';
const router = useRouter();
const linksList: Omit<SidebarLinkProps, 'activeLink'>[] = [
  {
    title: 'Página inicial',
    caption: 'Página inicial do sistema',
    icon: 'home',
    link: '/admin/dashboard',
  },
  {
    title: 'Catálogo',
    caption: 'Página de catálogo de carros',
    icon: 'directions_car',
    link: '/admin/vehicles',
  },
  {
    title: 'Sair',
    caption: 'Encerrar sessão do sistema',
    icon: 'logout',
    link: '/',
  },
];
const activeLink = ref('/home');

async function changeRoute(route: string) {
  if (route === '/') {
    await useStore.logout();
    Notify.create({
      type: 'negative',
      message: 'Sessão encerrada. Redirecionando...',
    });
  }
  activeLink.value = route;
  await router.push(route);
}

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
