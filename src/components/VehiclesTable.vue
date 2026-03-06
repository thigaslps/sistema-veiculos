<template>
  <q-table
    :rows="vehicles"
    :columns="columns"
    row-key="id"
    bordered
    :loading="loading"
    no-data-label="Nenhum veículo encontrado"
  >
    <template v-slot:loading>
      <q-inner-loading showing color="primary" />
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td align="center">
        <q-btn
          flat
          dense
          icon="photo_library"
          color="secondary"
          @click="$emit('open-gallery', props.row)"
        />
        <q-btn flat dense icon="edit" color="primary" @click="$emit('edit', props.row)" />
        <q-btn flat dense icon="delete" color="negative" @click="$emit('delete', props.row)" />
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import type { Vehicle } from 'src/stores/vehicles';

defineProps<{
  vehicles: Vehicle[];
  loading: boolean;
}>();

defineEmits<{
  (e: 'edit', vehicle: Vehicle): void;
  (e: 'delete', vehicle: Vehicle): void;
  (e: 'open-gallery', vehicle: Vehicle): void;
}>();

const columns = [
  { name: 'mark', label: 'Marca', field: 'mark', sortable: true },
  { name: 'model', label: 'Modelo', field: 'model', sortable: true },
  { name: 'year', label: 'Ano', field: 'year', sortable: true },
  { name: 'plate', label: 'Placa', field: 'plate', sortable: true },
  { name: 'color', label: 'Cor', field: 'color', sortable: true },
  { name: 'value', label: 'Valor', field: 'value', sortable: true },
  { name: 'type', label: 'Tipo', field: 'type', sortable: true },
  { name: 'status', label: 'Status', field: 'status', sortable: true },
  { name: 'actions', label: 'Ações', field: 'actions' },
];
</script>
