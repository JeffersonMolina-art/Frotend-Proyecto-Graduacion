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

    <!-- Diálogo Confirmar Eliminación -->
    <VDialog v-model="dialogEliminar" persistent max-width="400">
      <VCard class="pa-8 d-flex flex-column align-center justify-center">
        <VIcon size="48" color="error" class="mb-4">tabler-x</VIcon>
        <span class="text-error text-h6 text-center text-no-wrap mb-6">
          ¿Estás seguro de eliminar al proveedor
          <strong v-if="proveedorAEliminar">{{ proveedorAEliminar.nombre }}</strong>?
        </span>
        <VCardActions class="justify-end w-100">
          <VBtn color="secondary" variant="outlined" @click="dialogEliminar = false">
            Cancelar
          </VBtn>
          <VBtn color="error" variant="elevated" :loading="esperando" @click="confirmarEliminarProveedor">
            <VIcon start icon="tabler-trash" /> Eliminar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Botón para agregar -->
    <v-row justify="end" class="mb-4">
      <v-btn color="primary" @click="nuevoProveedor">Agregar Proveedor</v-btn>
    </v-row>

    <!-- Tabla -->
    <ProveedorTabla
      :proveedores="proveedores"
      @editar="editarProveedor"
      @eliminar="eliminarProveedor"
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

const dialogEliminar = ref(false)
const proveedorAEliminar = ref(null)
const esperando = ref(false)

const authStore = useAuthStore()
const config = useRuntimeConfig()

// Crear nuevo
const nuevoProveedor = () => {
  proveedorSeleccionado.value = null
  editando.value = false
  mostrarModal.value = true
}

// Editar
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

// Cargar proveedores
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

// Mostrar diálogo de eliminar
const eliminarProveedor = (proveedor) => {
  proveedorAEliminar.value = proveedor
  dialogEliminar.value = true
}

// Confirmar eliminación
const confirmarEliminarProveedor = async () => {
  if (!proveedorAEliminar.value) return

  esperando.value = true
  try {
    await useFetch(`/proveedores/${proveedorAEliminar.value.id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    dialogEliminar.value = false
    proveedorAEliminar.value = null
    cargarProveedores()
  } catch (error) {
    console.error('Error al eliminar proveedor', error)
    alert('Ocurrió un error al eliminar el proveedor.')
  } finally {
    esperando.value = false
  }
}

onMounted(cargarProveedores)
</script>
