<template>
  <q-page padding>
    <VehiclesHeader v-model:search="search" @add="openForm" />
    <VehiclesTable
      :vehicles="filteredVehicles"
      :loading="loading"
      @edit="openForm"
      @delete="confirmDelete"
      @open-gallery="openGallery"
    />
    <VehicleGalleryDialog
      v-model="galleryOpen"
      :vehicle-id="galleryVehicleId"
      :images="galleryImages"
      :image-ids="galleryIds"
      @delete-image="deleteImage"
    />
    <VehicleFormDialog v-model="formOpen" :vehicle="selectedVehicle" @save="saveVehicle" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useVehiclesStore, type Vehicle } from 'src/stores/vehicles';
import { Notify } from 'quasar';
import VehiclesHeader from './VehiclesHeader.vue';
import VehiclesTable from './VehiclesTable.vue';
import VehicleGalleryDialog from './VehicleGalleryDialog.vue';
import VehicleFormDialog from './VehicleFormDialog.vue';

const store = useVehiclesStore();
const { vehicles, loading, search, filteredVehicles } = storeToRefs(store);

const formOpen = ref(false);
const galleryOpen = ref(false);
const selectedVehicle = ref<Vehicle | null>(null);
const galleryVehicleId = ref<number | null>(null);
const galleryImages = ref<string[]>([]);
const galleryIds = ref<number[]>([]);

onMounted(async () => {
  await store.fetchItems();
});

function openForm(vehicle?: Vehicle) {
  selectedVehicle.value = vehicle ? { ...vehicle } : null;
  formOpen.value = true;
}

async function saveVehicle(formData: FormData, isEdit: boolean, id?: number | null) {
  const success = await store.saveVehicle(formData, isEdit, id);
  if (success) {
    formOpen.value = false;
  }
}

function openGallery(vehicle: Vehicle) {
  if (!vehicle.photos.length) {
    Notify.create({
      type: 'warning',
      message: 'Este veículo não possui imagens',
    });
    return;
  }
  galleryVehicleId.value = vehicle.id;
  galleryImages.value = [...vehicle.photos];
  galleryIds.value = vehicle.idPhotos ? [...vehicle.idPhotos] : [];
  galleryOpen.value = true;
}

async function deleteImage(index: number, imageId?: number) {
  const success = await store.deleteImage(galleryVehicleId.value, imageId);
  if (success) {
    // Atualiza as imagens locais após exclusão
    const vehicle = vehicles.value.find((v) => v.id === galleryVehicleId.value);
    if (vehicle) {
      galleryImages.value = [...vehicle.photos];
      galleryIds.value = [...(vehicle.idPhotos || [])];
      if (galleryImages.value.length === 0) {
        galleryOpen.value = false;
      }
    }
  }
}

function confirmDelete(vehicle: Vehicle) {
  Notify.create({
    message: 'Tem certeza que deseja deletar?',
    type: 'warning',
    actions: [
      { label: 'Cancelar', color: 'white' },
      {
        label: 'Confirmar',
        color: 'red',
        handler: () => {
          store
            .deleteVehicle(vehicle.id)
            .then(() => {
              Notify.create({
                type: 'positive',
                message: 'Veículo deletado com sucesso!',
              });
            })
            .catch(() => {
              Notify.create({
                type: 'negative',
                message: 'Erro ao deletar veículo.',
              });
            });
        },
      },
    ],
    timeout: 0,
  });
}
</script>
