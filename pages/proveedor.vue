<template>
  <div>
    <!-- Modal de proveedor -->
    <ProveedorModal
      :mostrar="mostrarModal"
      :proveedor="proveedorSeleccionado"
      :editando="editando"
      @cerrar="mostrarModal = false"
      @guardado="cerrarModal"
    />

    <!-- Botón para agregar -->
    <v-row justify="end" class="mb-4">
      <v-btn color="primary" @click="nuevoProveedor">Agregar Proveedor</v-btn>
    </v-row>

    <!-- Tabla -->
    <ProveedorTabla
      :proveedores="proveedores"
      @editar="editarProveedor"
    />
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
const editando = ref(false)
const proveedorSeleccionado = ref(null)

const authStore = useAuthStore()
const config = useRuntimeConfig()

// Nueva función: abrir modal vacío
const nuevoProveedor = () => {
  proveedorSeleccionado.value = null
  editando.value = false
  mostrarModal.value = true
}

// Nueva función: abrir modal con proveedor cargado
const editarProveedor = (proveedor) => {
  proveedorSeleccionado.value = proveedor
  editando.value = true
  mostrarModal.value = true
}

// Cerrar y recargar
const cerrarModal = () => {
  mostrarModal.value = false
  cargarProveedores()
}

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
