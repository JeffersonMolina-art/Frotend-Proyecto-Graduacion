<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEsperar } from '@/composables/useEsperar'

const { esperar, finEspera } = useEsperar()

const municipios            = ref([])
const departamentos         = ref([])
const loading               = ref(true)
const esperando             = ref(false)

const authStore             = useAuthStore()
const config                = useRuntimeConfig()

const dialogMunicipio       = ref(false)
const dialogEliminar        = ref(false)
const municipioAEliminar    = ref(null)
const editando              = ref(false)

const snackbar      = ref(false)
const snackbarMsg   = ref('')
const snackbarColor = ref('success')

const municipioFormulario = ref({})

const headers = [
  { title: 'ID',        value: 'id' },
  { title: 'Nombre',    value: 'nombre' },
  { title: 'Departamento', value: 'departamento' },
  { title: 'Acciones',  value: 'acciones', sortable: false },
]

const cargarDepartamentos = async () => {
  try {
    const { data } = await useFetch('/departamentosDireccion', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    if (data.value) departamentos.value = data.value
  } catch (e) {
    console.error('Error al cargar departamentos', e)
  }
}

const cargarMunicipios = async () => {
  loading.value = true
  try {
    const { data } = await useFetch('/municipio', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    if (data.value) municipios.value = data.value
  } catch (e) {
    console.error('Error al cargar municipios', e)
  } finally {
    loading.value = false
  }
}

const abrirModalCrear = async () => {
  if (!departamentos.value.length) await cargarDepartamentos()
  municipioFormulario.value = { nombre: '', departamento_id: null }
  editando.value = false
  dialogMunicipio.value = true
}

const abrirModalEditar = async m => {
  if (!departamentos.value.length) await cargarDepartamentos()
  municipioFormulario.value = {
    id: m.id,
    nombre: m.nombre,
    departamento_id: m.departamento?.id ?? null,
  }
  editando.value = true
  dialogMunicipio.value = true
}

const nombreDeptoPorId = id =>
  departamentos.value.find(d => d.id === id)?.nombre ?? ''

const validarFormulario = () => {
  if (!municipioFormulario.value.nombre?.trim()) {
    snackbarMsg.value = 'Falta el nombre del municipio'
    snackbarColor.value = 'error'
    snackbar.value = true
    return false
  }
  if (!municipioFormulario.value.departamento_id) {
    snackbarMsg.value = 'Falta seleccionar el departamento'
    snackbarColor.value = 'error'
    snackbar.value = true
    return false
  }
  return true
}

const guardarMunicipio = async () => {
  if (!validarFormulario()) return

  const metodo   = editando.value ? 'PUT' : 'POST'
  const endpoint = editando.value
    ? `/municipio/${municipioFormulario.value.id}`
    : '/municipio'

  esperando.value = true
  try {
    await useFetch(endpoint, {
      baseURL: config.public.apiBase,
      method: metodo,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(municipioFormulario.value),
    })

    snackbarMsg.value =
      `${municipioFormulario.value.nombre} – ` +
      `${nombreDeptoPorId(municipioFormulario.value.departamento_id)}`
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogMunicipio.value = false
    await cargarMunicipios()
  } catch (e) {
    console.error('Error al guardar municipio', e)
    snackbarMsg.value = 'Error al guardar municipio'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    esperando.value = false
  }
}

const confirmarEliminar = m => {
  municipioAEliminar.value = m
  dialogEliminar.value = true
}

const eliminarMunicipio = async () => {
  esperando.value = true
  try {
    await useFetch(`/municipio/${municipioAEliminar.value.id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    snackbarMsg.value =
      `${municipioAEliminar.value.nombre} – ` +
      `${municipioAEliminar.value.departamento?.nombre ?? ''}`
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogEliminar.value = false
    await cargarMunicipios()
  } catch (e) {
    console.error('Error al eliminar municipio', e)
    snackbarMsg.value = 'Error al eliminar municipio'
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
      await cargarDepartamentos()
      await cargarMunicipios()
      finEspera()
    }
  },
  { immediate: true },
)

definePageMeta({ middleware: 'auth' })
</script>

<template>
  <VCard>
    <VProgressLinear v-if="esperando" indeterminate height="3" color="primary" />

    <VCardTitle class="d-flex justify-space-between align-center">
      <span>Municipios</span>
      <VBtn color="primary" @click="abrirModalCrear">Agregar Municipio</VBtn>
    </VCardTitle>

    <VDataTable
      :headers="headers"
      :items="municipios"
      :loading="loading"
      loading-text="Cargando municipios…"
      items-per-page="10"
      class="pa-4"
    >
      <template #item.departamento="{ item }">
        {{ item.departamento?.nombre }}
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
  <VDialog v-model="dialogMunicipio" max-width="500" persistent>
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span class="text-h6">{{ editando ? 'Editar' : 'Agregar' }} Municipio</span>
        <VBtn icon @click="dialogMunicipio = false"><VIcon>tabler-x</VIcon></VBtn>
      </VCardTitle>

      <VCardText>
        <VRow dense>
          <VCol cols="6">
            <VTextField v-model="municipioFormulario.nombre" label="Nombre" required />
          </VCol>
          <VCol cols="6">
            <VSelect
              v-model="municipioFormulario.departamento_id"
              :items="departamentos"
              item-title="nombre"
              item-value="id"
              label="Departamento"
              placeholder="Selecciona un departamento"
              required
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn color="error" variant="outlined" @click="dialogMunicipio = false">
          <VIcon start icon="tabler-x" /> Cancelar
        </VBtn>
        <VBtn color="primary" variant="elevated" :loading="esperando" @click="guardarMunicipio">
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
        ¿Estás seguro de eliminar este elemento?
      </span>
      <VCardActions class="justify-end w-100">
        <VBtn color="secondary" variant="outlined" @click="dialogEliminar = false">
          Cancelar
        </VBtn>
        <VBtn color="error" variant="elevated" :loading="esperando" @click="eliminarMunicipio">
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
