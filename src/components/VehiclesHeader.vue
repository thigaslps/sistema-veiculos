<template>
  <div class="row q-col-gutter-md q-mb-md">
    <div class="col-12 col-md-6">
      <q-btn
        class="full-width"
        style="padding: 0.47rem"
        color="primary"
        label="Adicionar Veículo"
        @click="$emit('add')"
      />
    </div>
    <div class="col-12 col-md-6">
      <q-input
        outlined
        dense
        debounce="300"
        :model-value="search"
        @update:model-value="$emit('update:search', $event as string)"
        placeholder="Buscar por marca ou modelo"
        class="full-width"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  search: string;
}>();

defineEmits<{
  (e: 'update:search', value: string): void;
  (e: 'add'): void;
}>();
</script>
