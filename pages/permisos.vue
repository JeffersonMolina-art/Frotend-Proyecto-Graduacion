<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEsperar } from '@/composables/useEsperar'

const { esperar, finEspera } = useEsperar()

const permisos             = ref([])
const permisoFormulario    = ref({ nombre: '', descripcion: '' })
const loading              = ref(true)
const esperando            = ref(false)

const dialogPermiso        = ref(false)
const dialogEliminar       = ref(false)
const permisoAEliminar     = ref(null)
const editando             = ref(false)

const snackbar             = ref(false)
const snackbarMsg          = ref('')
const snackbarColor        = ref('success')

const authStore = useAuthStore()
const config = useRuntimeConfig()

// 🔧 Formatear fecha
const formatearFecha = fecha => {
  if (!fecha) return ''
  const d = new Date(fecha)
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const anio = d.getFullYear()
  const horas = String(d.getHours()).padStart(2, '0')
  const minutos = String(d.getMinutes()).padStart(2, '0')
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`
}

const headers = [
  { title: 'ID',          value: 'id' },
  { title: 'Nombre',      value: 'nombre' },
  { title: 'Descripción', value: 'descripcion' },
  { title: 'Creado',      value: 'created_at' },
  { title: 'Actualizado', value: 'updated_at' },
  { title: 'Acciones',    value: 'acciones', sortable: false },
]

const cargarPermisos = async () => {
  loading.value = true
  try {
    const { data } = await useFetch('/permisos', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    if (data.value) permisos.value = data.value
  } catch (e) {
    console.error('Error al cargar permisos', e)
  } finally {
    loading.value = false
  }
}

const abrirModalCrear = () => {
  permisoFormulario.value = { nombre: '', descripcion: '' }
  editando.value = false
  dialogPermiso.value = true
}

const abrirModalEditar = m => {
  permisoFormulario.value = {
    id: m.id,
    nombre: m.nombre,
    descripcion: m.descripcion ?? '',
  }
  editando.value = true
  dialogPermiso.value = true
}

const validarFormulario = () => {
  if (!permisoFormulario.value.nombre?.trim()) {
    snackbarMsg.value = 'Falta el nombre del permiso'
    snackbarColor.value = 'error'
    snackbar.value = true
    return false
  }
  return true
}

const guardarPermiso = async () => {
  if (!validarFormulario()) return

  const metodo = editando.value ? 'PUT' : 'POST'
  const endpoint = editando.value
    ? `/permisos/${permisoFormulario.value.id}`
    : '/permisos'

  esperando.value = true
  try {
    await useFetch(endpoint, {
      baseURL: config.public.apiBase,
      method: metodo,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(permisoFormulario.value),
    })

    snackbarMsg.value = 'Permiso guardado correctamente'
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogPermiso.value = false
    await cargarPermisos()
  } catch (e) {
    console.error('Error al guardar permiso', e)
    snackbarMsg.value = 'Error al guardar permiso'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    esperando.value = false
  }
}

const confirmarEliminar = m => {
  permisoAEliminar.value = m
  dialogEliminar.value = true
}

const eliminarPermiso = async () => {
  esperando.value = true
  try {
    await useFetch(`/permisos/${permisoAEliminar.value.id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    snackbarMsg.value = 'Permiso eliminado correctamente'
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogEliminar.value = false
    await cargarPermisos()
  } catch (e) {
    console.error('Error al eliminar permiso', e)
    snackbarMsg.value = 'Error al eliminar permiso'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    esperando.value = false
  }
}

watch(
  () => authStore.token,
  async token => {
    if (token) {
      esperar()
      await cargarPermisos()
      finEspera()
    }
  },
  { immediate: true }
)

definePageMeta({ middleware: 'auth' })
</script>

<template>
  <VCard>
    <VProgressLinear v-if="esperando" indeterminate height="3" color="primary" />

    <VCardTitle class="d-flex justify-space-between align-center">
      <span>Permisos</span>
      <VBtn color="primary" @click="abrirModalCrear">Agregar Permiso</VBtn>
    </VCardTitle>

    <VDataTable
      :headers="headers"
      :items="permisos"
      :loading="loading"
      loading-text="Cargando permisos…"
      items-per-page="10"
      class="pa-4"
    >
      <template #item.created_at="{ item }">
        {{ formatearFecha(item.created_at) }}
      </template>
      <template #item.updated_at="{ item }">
        {{ formatearFecha(item.updated_at) }}
      </template>

      <template #item.acciones="{ item }">
        <VBtn icon variant="text" color="primary" @click="abrirModalEditar(item)">
          <VIcon>tabler-edit</VIcon>
        </VBtn>
        <VBtn icon variant="text" color="error" @click="confirmarEliminar(item)">
          <VIcon>tabler-trash</VIcon>
        </VBtn>
      </template>
    </VDataTable>
  </VCard>

  <!-- Crear / Editar -->
  <VDialog v-model="dialogPermiso" max-width="600" persistent>
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span class="text-h6">{{ editando ? 'Editar' : 'Agregar' }} Permiso</span>
        <VBtn icon @click="dialogPermiso = false"><VIcon>tabler-x</VIcon></VBtn>
      </VCardTitle>

      <VCardText>
        <VRow dense>
          <VCol cols="6">
            <VTextField v-model="permisoFormulario.nombre" label="Nombre" required />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="permisoFormulario.descripcion" label="Descripción" />
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn color="error" variant="outlined" @click="dialogPermiso = false">
          <VIcon start icon="tabler-x" /> Cancelar
        </VBtn>
        <VBtn color="primary" variant="elevated" :loading="esperando" @click="guardarPermiso">
          <VIcon start icon="tabler-check" /> Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Eliminar -->
  <VDialog v-model="dialogEliminar" persistent max-width="400">
    <VCard class="pa-8 d-flex flex-column align-center justify-center">
      <VIcon size="48" color="error" class="mb-4">tabler-x</VIcon>
      <span class="text-error text-h6 text-center text-no-wrap mb-6">
        ¿Estás seguro de eliminar este permiso?
      </span>
      <VCardActions class="justify-end w-100">
        <VBtn color="secondary" variant="outlined" @click="dialogEliminar = false">
          Cancelar
        </VBtn>
        <VBtn color="error" variant="elevated" :loading="esperando" @click="eliminarPermiso">
          <VIcon start icon="tabler-trash" /> Eliminar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VSnackbar
    v-model="snackbar"
    :color="snackbarColor"
    location="bottom end"
    timeout="2000"
  >
    {{ snackbarMsg }}
  </VSnackbar>
</template>
