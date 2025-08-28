<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEsperar } from '@/composables/useEsperar'

const { esperar, finEspera } = useEsperar()

const puestos            = ref([])
const unidades           = ref([]) // Áreas
const loading            = ref(true)
const esperando          = ref(false)

const authStore          = useAuthStore()
const config             = useRuntimeConfig()

const dialogPuesto       = ref(false)
const dialogEliminar     = ref(false)
const puestoAEliminar    = ref(null)
const editando           = ref(false)

const snackbar           = ref(false)
const snackbarMsg        = ref('')
const snackbarColor      = ref('success')

const puestoFormulario   = ref({})

const headers = [
  { title: 'ID',        value: 'id' },
  { title: 'Área',      value: 'unidad' },
  { title: 'Nombre',    value: 'nombre' },
  { title: 'Descripción', value: 'descripcion' },
  { title: 'Acciones',  value: 'acciones', sortable: false },
]

const cargarUnidades = async () => {
  try {
    const { data } = await useFetch('/unidad', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    if (data.value) unidades.value = data.value
  } catch (e) {
    console.error('Error al cargar unidades (áreas)', e)
  }
}

const cargarPuestos = async () => {
  loading.value = true
  try {
    const { data } = await useFetch('/puestos', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    console.log(data.value)
    if (data.value) puestos.value = data.value
  } catch (e) {
    console.error('Error al cargar puestos', e)
  } finally {
    loading.value = false
  }
}

const abrirModalCrear = async () => {
  if (!unidades.value.length) await cargarUnidades()
  puestoFormulario.value = { nombre: '', descripcion: '', area_id: null }
  editando.value = false
  dialogPuesto.value = true
}

const abrirModalEditar = async m => {
  if (!unidades.value.length) await cargarUnidades()
  puestoFormulario.value = {
    id: m.id,
    nombre: m.nombre,
    descripcion: m.descripcion ?? '',
    area_id: m.unidad?.id ?? null,
  }
  editando.value = true
  dialogPuesto.value = true
}

const nombreUnidadPorId = id =>
  unidades.value.find(u => u.id === id)?.nombre ?? ''

const validarFormulario = () => {
  if (!puestoFormulario.value.area_id) {
    snackbarMsg.value = 'Falta seleccionar el área'
    snackbarColor.value = 'error'
    snackbar.value = true
    return false
  }
  if (!puestoFormulario.value.nombre?.trim()) {
    snackbarMsg.value = 'Falta el nombre del puesto'
    snackbarColor.value = 'error'
    snackbar.value = true
    return false
  }
  return true
}

const guardarPuesto = async () => {
  if (!validarFormulario()) return

  const metodo = editando.value ? 'PUT' : 'POST'
  const endpoint = editando.value
    ? `/puestos/${puestoFormulario.value.id}`
    : '/puestos'

  esperando.value = true
  try {
    await useFetch(endpoint, {
      baseURL: config.public.apiBase,
      method: metodo,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(puestoFormulario.value),
    })

    snackbarMsg.value =
      `${puestoFormulario.value.nombre} – ${nombreUnidadPorId(puestoFormulario.value.area_id)}`
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogPuesto.value = false
    await cargarPuestos()
  } catch (e) {
    console.error('Error al guardar puesto', e)
    snackbarMsg.value = 'Error al guardar puesto'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    esperando.value = false
  }
}

const confirmarEliminar = m => {
  puestoAEliminar.value = m
  dialogEliminar.value = true
}

const eliminarPuesto = async () => {
  esperando.value = true
  try {
    await useFetch(`/puestos/${puestoAEliminar.value.id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    snackbarMsg.value =
      `${puestoAEliminar.value.nombre} – ${puestoAEliminar.value.unidad?.nombre ?? ''}`
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogEliminar.value = false
    await cargarPuestos()
  } catch (e) {
    console.error('Error al eliminar puesto', e)
    snackbarMsg.value = 'Error al eliminar puesto'
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
      await cargarUnidades()
      await cargarPuestos()
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
      <span>Puestos</span>
      <VBtn color="primary" @click="abrirModalCrear">Agregar Puesto</VBtn>
    </VCardTitle>

    <VDataTable
      :headers="headers"
      :items="puestos"
      :loading="loading"
      loading-text="Cargando puestos…"
      items-per-page="10"
      class="pa-4"
    >
      <template #item.unidad="{ item }">
        {{ item.area?.nombre }}
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
  <VDialog v-model="dialogPuesto" max-width="600" persistent>
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span class="text-h6">{{ editando ? 'Editar' : 'Agregar' }} Puesto</span>
        <VBtn icon @click="dialogPuesto = false"><VIcon>tabler-x</VIcon></VBtn>
      </VCardTitle>

      <VCardText>
        <VRow dense>
          <VCol cols="12">
            <VSelect
              v-model="puestoFormulario.area_id"
              :items="unidades"
              item-title="nombre"
              item-value="id"
              label="Área"
              placeholder="Selecciona un área"
              required
            />
          </VCol>

          <VCol cols="6">
            <VTextField v-model="puestoFormulario.nombre" label="Nombre" required />
          </VCol>
          <VCol cols="6">
            <VTextField v-model="puestoFormulario.descripcion" label="Descripción" />
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn color="error" variant="outlined" @click="dialogPuesto = false">
          <VIcon start icon="tabler-x" /> Cancelar
        </VBtn>
        <VBtn color="primary" variant="elevated" :loading="esperando" @click="guardarPuesto">
          <VIcon start icon="tabler-check" /> Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Eliminar -->
  <VDialog v-model="dialogEliminar" persistent max-width="400">
    <VCard class="pa-8 d-flex flex-column align-center justify-center" style="width:400px">
      <VIcon size="48" color="error" class="mb-4">tabler-x</VIcon>
      <span class="text-error text-h6 text-center text-no-wrap mb-6">
        ¿Estás seguro de eliminar este puesto?
      </span>
      <VCardActions class="justify-end w-100">
        <VBtn color="secondary" variant="outlined" @click="dialogEliminar = false">
          Cancelar
        </VBtn>
        <VBtn color="error" variant="elevated" :loading="esperando" @click="eliminarPuesto">
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
