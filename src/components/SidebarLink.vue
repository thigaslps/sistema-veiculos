<template>
  <q-item
    :class="[{ 'sidebar-item-sair': title === 'Sair' }, { 'sidebar-item-selected': isActive }]"
    clickable
    @click="handleClick"
  >
    <q-item-section side>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface SidebarLinkProps {
  title: string;
  caption?: string;
  icon?: string;
  link: string;
  activeLink: string; // nova prop
}

const props = withDefaults(defineProps<SidebarLinkProps>(), {
  caption: '',
  icon: '',
});

const emit = defineEmits<{
  (e: 'select', link: string): void;
}>();

const isActive = computed(() => props.link === props.activeLink);

function handleClick() {
  emit('select', props.link);
}
</script>

<style scoped>
.sidebar-item-selected {
  background-color: #e0e0e0;
}
.sidebar-item-sair {
  position: absolute;
  bottom: 0;
  width: 100%;
}
</style>
