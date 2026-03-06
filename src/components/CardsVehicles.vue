<template>
  <q-page padding>
    {{
      vehicles.length === 0
        ? 'Nenhum veículo encontrado'
        : `${vehicles.length} veículos encontrados`
    }}
    <!-- Grid de cards -->
    <div class="" style="display: flex; flex-wrap: wrap; gap: 2rem">
      <q-card
        v-for="vehicle in vehicles"
        :key="vehicle.id as number"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
        style="cursor: pointer; display: flex; min-height: 300px; height: fit-content; width: 100%"
        @click="openVehicleModal(vehicle.id as number)"
      >
        <div
          class=""
          style="color: #666; font-size: 11px; position: absolute; bottom: -1rem; right: 0rem"
        >
          Clique em qualquer lugar deste card para ver mais detalhes
        </div>
        <!-- Foto principal -->
        <q-img :src="vehicle.photos[0]" ratio="16/9" style="max-width: 50%">
          <template v-slot:default>
            <q-badge color="primary" class="absolute-top-left q-ma-sm">
              <span style="font-size: 14px; font-weight: 400; word-break: break-word"
                ><span style="font-weight: 700; font-style: bold">Marca:</span> {{ vehicle.mark }} -
                <span style="font-weight: 700; font-style: bold">Modelo:</span>
                {{ vehicle.model }}</span
              >
            </q-badge>
          </template>
        </q-img>
        <!-- Miniaturas -->
        <div style="display: flex; flex-direction: column">
          <q-card-section style="display: flex; width: 100%; flex-wrap: wrap; gap: 1rem">
            <q-img
              v-for="(photo, idx) in vehicle.photos"
              :key="idx"
              :src="photo"
              style="width: 70px; height: 70px; object-fit: cover"
              @click.stop="openVehicleModal(vehicle.id as number, idx)"
            />
          </q-card-section>
          <!-- Informações básicas -->
          <q-card-section>
            <div class="text-subtitle2" style="">
              <span style="font-size: 14px; font-weight: 400; word-break: break-word"
                >Marca: <span style="color: #666">{{ vehicle.mark }}</span></span
              >
              <span style="color: #666"> - </span>
              <span style="font-size: 14px; font-weight: 400; word-break: break-word"
                >Modelo: <span style="color: #666">{{ vehicle.model }}</span></span
              >
            </div>
            <div class="" style="font-size: 11px">
              Ano: <span style="color: #666">{{ vehicle.year }}</span>
            </div>
            <div class="" style="font-size: 11px">
              Valor: <span style="color: #666">{{ vehicle.value }}</span>
            </div>
          </q-card-section>
        </div>
      </q-card>
    </div>

    <!-- Modal com detalhes e carrossel -->
    <q-dialog v-model="modalVisible" persistent maximized>
      <q-card style="width: 90%; height: 90%">
        <!-- Cabeçalho do modal -->
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ currentVehicle?.mark }} {{ currentVehicle?.model }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="modalVisible = false" />
        </q-card-section>

        <!-- Carrossel de fotos -->
        <q-card-section
          class="col q-pa-none"
          style="height: 50%; display: flex; justify-content: center; align-items: center"
        >
          <q-carousel
            v-model="currentSlide"
            arrows
            navigation
            infinite
            control-color="black"
            style="width: 100%; height: 100%"
          >
            <q-carousel-slide
              v-for="(img, index) in currentVehicle?.photos || []"
              :key="index"
              :name="String(index)"
              class="flex flex-center"
            >
              <img :src="img" style="max-width: 80%; max-height: 80%; object-fit: contain" />
            </q-carousel-slide>
          </q-carousel>
        </q-card-section>

        <!-- Detalhes -->
        <q-card-section>
          <div><strong style="font-weight: 400">Ano:</strong> {{ currentVehicle?.year }}</div>
          <div><strong style="font-weight: 400">Placa:</strong> {{ currentVehicle?.plate }}</div>
          <div><strong style="font-weight: 400">Cor:</strong> {{ currentVehicle?.color }}</div>
          <div><strong style="font-weight: 400">Valor:</strong> {{ currentVehicle?.value }}</div>
          <div><strong style="font-weight: 400">Tipo:</strong> {{ currentVehicle?.type }}</div>
          <div><strong style="font-weight: 400">Status:</strong> {{ currentVehicle?.status }}</div>
        </q-card-section>

        <!-- Ações -->
        <q-card-actions align="right">
          <q-btn color="secondary" label="Editar" @click="editVehicle(currentVehicle)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Vehicle } from 'src/stores/vehicles';
import { Notify } from 'quasar';

defineProps<{
  vehicles: Vehicle[];
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'edit', vehicle: Vehicle | null): void;
}>();

// Modal
const modalVisible = ref(false);
const currentVehicle = ref<Vehicle | null>(null);
const currentSlide = ref('0');

// Abre modal e faz fetch dos detalhes
async function openVehicleModal(id: number, slideIndex = 0) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/vehicles/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Erro ao buscar veículo');

    const data = await res.json();
    currentVehicle.value = data.res;
    currentSlide.value = String(slideIndex);
    modalVisible.value = true;
  } catch (err) {
    console.error(err);
    Notify.create({ type: 'negative', message: 'Não foi possível carregar o veículo.' });
  }
}

// Chama modal de edição
function editVehicle(vehicle: Vehicle | null) {
  emit('edit', vehicle);
  modalVisible.value = false;
}
</script>

<style scoped>
.q-card {
  transition: transform 0.2s;
}
.q-card:hover {
  transform: scale(1.02);
}
</style>
