import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Notify } from 'quasar';
import { useAuthStore } from './auth';

export interface Vehicle {
  id: number | null;
  mark: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  value: number;
  type: string;
  status: string;
  photos: string[];
  idPhotos?: number[];
}

export const useVehiclesStore = defineStore('vehicles', () => {
  const vehicles = ref<Vehicle[]>([]);
  const loading = ref(false);
  const search = ref('');
  const filteredVehicles = computed(() =>
    vehicles.value.filter(
      (v) =>
        v.mark.toLowerCase().includes(search.value.toLowerCase()) ||
        v.model.toLowerCase().includes(search.value.toLowerCase()),
    ),
  );

  async function fetchItems() {
    try {
      loading.value = true;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vehicles`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        Notify.create({
          type: 'negative',
          message: data.message || 'Erro ao buscar veículos',
        });
        if (data?.status === 'token error') {
          window.location.reload();
        }
        return;
      }
      vehicles.value = data.res || [];
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      Notify.create({
        type: 'negative',
        message: 'Erro interno ao buscar veículos',
      });
    } finally {
      loading.value = false;
    }
  }

  async function saveVehicle(formData: FormData, isEdit: boolean, id?: number | null) {
    try {
      const { userID } = useAuthStore();
      formData.append('user_id', String(userID));

      const url = isEdit
        ? `${import.meta.env.VITE_API_URL}/vehicles/edit/${id}`
        : `${import.meta.env.VITE_API_URL}/vehicles/add`;

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        Notify.create({
          type: 'negative',
          message:
            data.message || (isEdit ? 'Erro ao atualizar veículo' : 'Erro ao adicionar veículo'),
        });
        if (data?.status === 'token error') {
          window.location.reload();
        }
        return false;
      }

      if (isEdit && id) {
        const index = vehicles.value.findIndex((v) => v.id === id);
        if (index !== -1) {
          const existingVehicle = vehicles.value[index];
          const sameImages =
            existingVehicle?.photos.length === data.res.photos.length &&
            existingVehicle?.photos.every((item, index) => item === data.res.photos[index]);
          let newPhotos: string[] = [];
          if (!sameImages) {
            newPhotos = [...(existingVehicle?.photos || []), ...(data.res.photos || [])];
          } else {
            newPhotos = [...(existingVehicle?.photos || [])];
          }

          vehicles.value[index] = {
            ...existingVehicle,
            ...data.res,
            photos: newPhotos,
          };
        }
      } else {
        // Adiciona o novo veículo
        vehicles.value.push(data.res);
      }

      Notify.create({
        type: 'positive',
        message: isEdit ? 'Veículo atualizado' : 'Veículo criado',
      });

      return true;
    } catch (error) {
      console.error(isEdit ? 'Erro ao atualizar veículo:' : 'Erro ao adicionar veículo:', error);
      Notify.create({
        type: 'negative',
        message: isEdit ? 'Erro interno ao atualizar veículo' : 'Erro interno ao adicionar veículo',
      });
      return false;
    }
  }

  async function deleteVehicle(id: number | null) {
    if (!id) return false;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vehicles/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        Notify.create({
          type: 'negative',
          message: data.message || 'Erro ao excluir veículo',
        });
        if (data?.status === 'token error') {
          window.location.reload();
        }
        return false;
      }

      vehicles.value = vehicles.value.filter((v) => v.id !== id);
      return true;
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      Notify.create({
        type: 'negative',
        message: 'Erro interno ao excluir veículo',
      });
      return false;
    }
  }

  async function deleteImage(vehicleId: number | null, imageId?: number) {
    if (!vehicleId || !imageId) {
      Notify.create({
        type: 'warning',
        message: 'ID da imagem não encontrado',
      });
      return false;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/vehicles/delete-image/${imageId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        },
      );
      const data = await response.json();
      if (!response.ok) {
        Notify.create({
          type: 'negative',
          message: data.message || 'Erro ao remover imagem',
        });
        if (data?.status === 'token error') {
          window.location.reload();
        }
        return false;
      }

      // Atualiza o veículo correspondente
      const vehicle = vehicles.value.find((v) => v.id === vehicleId);
      if (vehicle) {
        const removeIndex = vehicle.idPhotos?.findIndex((id) => id === imageId);
        if (removeIndex !== undefined && removeIndex > -1) {
          vehicle.photos.splice(removeIndex, 1);
          vehicle.idPhotos?.splice(removeIndex, 1);
        }
      }

      Notify.create({
        type: 'positive',
        message: 'Imagem removida',
      });
      return true;
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      Notify.create({
        type: 'negative',
        message: 'Erro interno ao remover imagem',
      });
      return false;
    }
  }

  return {
    vehicles,
    loading,
    search,
    filteredVehicles,
    fetchItems,
    saveVehicle,
    deleteVehicle,
    deleteImage,
  };
});
