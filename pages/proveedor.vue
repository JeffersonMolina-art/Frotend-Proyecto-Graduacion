<template>
  <div>
    <ProveedorModal
      :mostrar="mostrarModal"
      @cerrar="mostrarModal = false"
      @guardado="cargarProveedores"
    />

    <v-row justify="end" class="mb-4">
      <v-btn color="primary" @click="mostrarModal = true">Agregar Proveedor</v-btn>
    </v-row>

    <ProveedorTabla :proveedores="proveedores" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEsperar } from '@/composables/useEsperar'
import ProveedorTabla from '@/components/proveedor/ProveedorTabla.vue'
import ProveedorModal from '@/components/proveedor/ProveedorModal.vue'

const proveedores = ref([])
const mostrarModal = ref(false)

const authStore = useAuthStore()
const config = useRuntimeConfig()

const cargarProveedores = async () => {
  try {
    const { data } = await useFetch('/proveedores', {
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (data.value) proveedores.value = data.value
  } catch (e) {
    console.error('Error al cargar proveedores', e)
  } finally {
    mostrarModal.value = false
  }
}

onMounted(cargarProveedores)
</script>

