<template>
  <q-dialog v-model="innerValue" maximized>
    <q-card style="width: 90%; height: 90%">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Imagens do veículo</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section
        class="col q-pa-none"
        style="display: flex; justify-content: center; align-items: center; height: 80%"
      >
        <q-carousel
          v-model="currentSlide"
          animated
          arrows
          navigation
          infinite
          control-color="black"
          style="width: 100%; height: 100%"
        >
          <q-carousel-slide
            v-for="(img, index) in images"
            :key="index"
            :name="String(index)"
            class="flex flex-center"
          >
            <q-btn
              icon="delete"
              color="negative"
              round
              dense
              class="absolute-top-right q-ma-md"
              @click.stop="$emit('delete-image', index, imageIds?.[index])"
              style="margin-right: 2rem"
            />
            <img
              :src="img"
              style="width: 80%; max-width: 80%; height: 80%; max-height: 80%; object-fit: contain"
            />
          </q-carousel-slide>
        </q-carousel>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  vehicleId: number | null;
  images: string[];
  imageIds?: number[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'delete-image', index: number, imageId?: number): void;
}>();

const innerValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const currentSlide = ref('0');

watch(
  () => props.images,
  (newImages) => {
    if (newImages.length === 0) {
      innerValue.value = false;
    } else if (Number(currentSlide.value) >= newImages.length) {
      currentSlide.value = String(newImages.length - 1);
    }
  },
);
</script>
