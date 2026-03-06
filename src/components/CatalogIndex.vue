<template>
  <q-page padding>
    <CardsVehicles @edit="editVehicle" :vehicles="vehicles" />
    <VehicleFormDialog v-model="formOpen" :vehicle="selectedVehicle" @save="saveVehicle" />
  </q-page>
</template>

<script setup lang="ts">
import CardsVehicles from 'components/CardsVehicles.vue';
import { storeToRefs } from 'pinia';
import { useVehiclesStore, type Vehicle } from 'src/stores/vehicles';
import { onMounted } from 'vue';
import VehicleFormDialog from './VehicleFormDialog.vue';
import { ref } from 'vue';
const store = useVehiclesStore();
const formOpen = ref(false);
const selectedVehicle = ref<Vehicle | null>(null);

const { vehicles } = storeToRefs(store);

onMounted(async () => {
  await store.fetchItems();
});

const editVehicle = (vehicle: Vehicle | null) => {
  selectedVehicle.value = vehicle ? { ...vehicle } : null;
  formOpen.value = true;
};

async function saveVehicle(formData: FormData, isEdit: boolean, id?: number | null) {
  const success = await store.saveVehicle(formData, isEdit, id);
  if (success) {
    formOpen.value = false;
  }
}
</script>
