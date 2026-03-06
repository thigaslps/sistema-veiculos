<template>
  <q-dialog v-model="innerValue" persistent>
    <q-card style="min-width: 70%; height: 80%">
      <q-card-section>
        <div class="text-h6">
          {{ isEdit ? 'Editar Veículo' : 'Adicionar Veículo' }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="form.mark"
          label="Marca"
          :rules="[(val) => !!val || 'Marca obrigatória']"
        />

        <q-input
          v-model="form.model"
          label="Modelo"
          :rules="[(val) => !!val || 'Modelo obrigatório']"
          class="q-mt-sm"
        />

        <q-input v-model="form.year" label="Ano" type="number" class="q-mt-sm" />

        <q-input v-model="form.plate" label="Placa" class="q-mt-sm" />

        <q-input v-model="form.color" label="Cor" class="q-mt-sm" />

        <q-input
          v-model="valorInput"
          label="Valor"
          prefix="R$"
          inputmode="numeric"
          class="q-mt-sm"
        />

        <q-select
          v-model="form.type"
          label="Tipo"
          :options="['Carro', 'Moto', 'Caminhão']"
          class="q-mt-sm"
        />

        <q-select
          v-model="form.status"
          label="Status"
          :options="['Disponível', 'Vendido', 'Reservado']"
          class="q-mt-sm"
        />

        <!-- Upload -->
        <q-uploader
          label="Fotos do veículo"
          multiple
          accept="image/jpeg,image/png,image/webp"
          :max-file-size="5242880"
          hide-upload-btn
          @added="onFilesAdded"
          @removed="onFileRemoved"
          style="margin-top: 1rem; width: 100%"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" @click="innerValue = false" />
        <q-btn flat label="Salvar" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Notify } from 'quasar';
import type { Vehicle } from 'src/stores/vehicles';

const props = defineProps<{
  modelValue: boolean;
  vehicle?: Vehicle | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', formData: FormData, isEdit: boolean, id?: number | null): void;
}>();

const innerValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.vehicle?.id);

// Estado local do formulário
const form = ref<Vehicle>({
  id: null,
  mark: '',
  model: '',
  year: new Date().getFullYear(),
  plate: '',
  color: '',
  value: 0,
  type: '',
  status: 'Disponível',
  photos: [],
  idPhotos: [],
});

// Fotos novas adicionadas durante a edição
const newsPhotosEdit = ref<string[]>([]);

function parseBrazilianCurrency(value: string | number) {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  // Remove tudo que não é número ou vírgula
  const onlyNumbers = value.replace(/[^\d,]/g, '');

  // Substitui vírgula por ponto para Number
  const normalized = onlyNumbers.replace(',', '.');

  return Number(normalized) || 0;
}

// Atualiza o formulário quando o vehicle prop muda
watch(
  () => props.vehicle,
  (newVehicle) => {
    if (newVehicle) {
      form.value = {
        ...newVehicle,
        photos: [...newVehicle.photos],
        idPhotos: newVehicle.idPhotos ? [...newVehicle.idPhotos] : [],
        value: parseBrazilianCurrency(newVehicle.value),
      };
    } else {
      form.value = {
        id: null,
        mark: '',
        model: '',
        year: new Date().getFullYear(),
        plate: '',
        color: '',
        value: 0,
        type: '',
        status: 'Disponível',
        photos: [],
        idPhotos: [],
      };
    }
    newsPhotosEdit.value = [];
  },
  { immediate: true },
);

// Formatação de valor monetário
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const valorInput = computed({
  get() {
    if (!form.value.value) return '';
    return currencyFormatter.format(form.value.value);
  },
  set(val: string) {
    const onlyNumbers = val.replace(/\D/g, '');
    form.value.value = Number(onlyNumbers) / 100;
  },
});

// Upload de arquivos
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
  });
};

async function onFilesAdded(files: readonly File[]) {
  const base64Files = await Promise.all(files.map(convertToBase64));
  form.value.photos.push(...base64Files);
  if (isEdit.value) {
    newsPhotosEdit.value.push(...base64Files);
  }
}

async function onFileRemoved(files: readonly File[]) {
  const base64Files = await Promise.all(files.map(convertToBase64));
  form.value.photos = form.value.photos.filter((f) => !base64Files.find((r) => r === f));
  // Também remover de newsPhotosEdit se estiver lá
  newsPhotosEdit.value = newsPhotosEdit.value.filter((f) => !base64Files.find((r) => r === f));
}

// Validação e envio
function save() {
  // Validação dos campos obrigatórios
  const requiredFields = ['mark', 'model', 'year', 'plate', 'color', 'value', 'type', 'status'];
  const hasEmpty = requiredFields.some((field) => {
    const value = form.value[field as keyof Vehicle];
    return value === '' || value === null || value === undefined;
  });

  if (hasEmpty) {
    Notify.create({
      type: 'negative',
      message: 'Preencha os campos obrigatórios!',
    });
    return;
  }

  const formData = new FormData();

  // Adiciona campos (excluindo id, photos, idPhotos)
  Object.entries(form.value).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'photos' && key !== 'idPhotos') {
      formData.append(key, String(value));
    }
  });

  // Adiciona fotos
  if (isEdit.value && newsPhotosEdit.value.length > 0) {
    // Na edição, envia apenas as novas fotos
    newsPhotosEdit.value.forEach((file) => {
      formData.append('photos[]', file);
    });
  } else {
    // Na criação, envia todas as fotos
    form.value.photos.forEach((file) => {
      formData.append('photos[]', file);
    });
  }

  emit('save', formData, isEdit.value, form.value.id);
}
</script>
