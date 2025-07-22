<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEsperar } from '@/composables/useEsperar'

const { esperar, finEspera } = useEsperar()
const departamentos         = ref([])
const paises                = ref([])
const loading               = ref(true)
const esperando             = ref(false)

const authStore             = useAuthStore()
const config                = useRuntimeConfig()

const dialogDepartamento    = ref(false)
const dialogEliminar        = ref(false)
const departamentoAEliminar = ref(null)
const editando              = ref(false)

const snackbar      = ref(false)
const snackbarMsg   = ref('')
const snackbarColor = ref('success')

const departamentoFormulario = ref({})

const headers = [
  { title: 'ID',      value: 'id' },
  { title: 'Nombre',  value: 'nombre' },
  { title: 'País',    value: 'pais' },
  { title: 'Acciones', value: 'acciones', sortable: false },
]

const cargarPaises = async () => {
  try {
    const { data } = await useFetch('/paises', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    if (data.value) paises.value = data.value
  } catch (e) {
    console.error('Error al cargar países', e)
  }
}

const cargarDepartamentos = async () => {
  loading.value = true
  try {
    const { data } = await useFetch('/departamentosDireccion', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    if (data.value) departamentos.value = data.value
  } catch (e) {
    console.error('Error al cargar departamentos', e)
  } finally {
    loading.value = false
  }
}

const abrirModalCrear = async () => {
  if (!paises.value.length) await cargarPaises()
  departamentoFormulario.value = { nombre: '', pais_id: null }
  editando.value = false
  dialogDepartamento.value = true
}

const abrirModalEditar = async d => {
  if (!paises.value.length) await cargarPaises()
  departamentoFormulario.value = {
    id: d.id,
    nombre: d.nombre,
    pais_id: d.pais?.id ?? null,
  }
  editando.value = true
  dialogDepartamento.value = true
}

const nombrePaisPorId = id =>
  paises.value.find(p => p.id === id)?.nombre ?? ''

const validarFormulario = () => {
  if (!departamentoFormulario.value.nombre?.trim()) {
    snackbarMsg.value = 'Falta el nombre del departamento'
    snackbarColor.value = 'error'
    snackbar.value = true
    return false
  }
  if (!departamentoFormulario.value.pais_id) {
    snackbarMsg.value = 'Falta seleccionar el país'
    snackbarColor.value = 'error'
    snackbar.value = true
    return false
  }
  return true
}

const guardarDepartamento = async () => {
  if (!validarFormulario()) return

  const metodo   = editando.value ? 'PUT' : 'POST'
  const endpoint = editando.value
    ? `/departamentosDireccion/${departamentoFormulario.value.id}`
    : '/departamentosDireccion'

  esperando.value = true
  try {
    await useFetch(endpoint, {
      baseURL: config.public.apiBase,
      method: metodo,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(departamentoFormulario.value),
    })

    snackbarMsg.value =
      `${departamentoFormulario.value.nombre} – ` +
      `${nombrePaisPorId(departamentoFormulario.value.pais_id)}`
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogDepartamento.value = false
    await cargarDepartamentos()
  } catch (e) {
    console.error('Error al guardar departamento', e)
    snackbarMsg.value = 'Error al guardar departamento'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    esperando.value = false
  }
}

const confirmarEliminar = d => {
  departamentoAEliminar.value = d
  dialogEliminar.value = true
}

const eliminarDepartamento = async () => {
  esperando.value = true
  try {
    await useFetch(`/departamentosDireccion/${departamentoAEliminar.value.id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    snackbarMsg.value =
      `${departamentoAEliminar.value.nombre} – ` +
      `${departamentoAEliminar.value.pais?.nombre ?? ''}`
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogEliminar.value = false
    await cargarDepartamentos()
  } catch (e) {
    console.error('Error al eliminar departamento', e)
    snackbarMsg.value = 'Error al eliminar departamento'
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
      await cargarPaises()
      await cargarDepartamentos()
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
      <span>Departamentos</span>
      <VBtn color="primary" @click="abrirModalCrear">Agregar Departamento</VBtn>
    </VCardTitle>

    <VDataTable
      :headers="headers"
      :items="departamentos"
      :loading="loading"
      loading-text="Cargando departamentos…"
      items-per-page="10"
      class="pa-4"
    >
      <template #item.pais="{ item }">
        {{ item.pais?.nombre }}
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

  <VDialog v-model="dialogDepartamento" max-width="500" persistent>
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span class="text-h6">{{ editando ? 'Editar' : 'Agregar' }} Departamento</span>
        <VBtn icon @click="dialogDepartamento = false">
          <VIcon>tabler-x</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VRow dense>
          <VCol cols="6">
            <VTextField v-model="departamentoFormulario.nombre" label="Nombre" required />
          </VCol>
          <VCol cols="6">
            <VSelect
              v-model="departamentoFormulario.pais_id"
              :items="paises"
              item-title="nombre"
              item-value="id"
              label="País"
              placeholder="Selecciona un país"
              required
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn color="error" variant="outlined" @click="dialogDepartamento = false">
          <VIcon start icon="tabler-x" /> Cancelar
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :loading="esperando"
          @click="guardarDepartamento"
        >
          <VIcon start icon="tabler-check" /> Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VDialog v-model="dialogEliminar" persistent max-width="400">
  <VCard
    class="pa-8 d-flex flex-column align-center justify-center"
    style="width:400px"
  >
    <!-- Icono X grande -->
    <VIcon size="48" color="error" class="mb-4">tabler-x</VIcon>

    <!-- Mensaje en una sola línea -->
    <span class="text-error text-h6 text-center text-no-wrap mb-6">
      ¿Estás seguro de eliminar este elemento?
    </span>

    <VCardActions class="justify-end w-100">
      <VBtn
        color="secondary"
        variant="outlined"
        @click="dialogEliminar = false"
      >
        Cancelar
      </VBtn>
      <VBtn
        color="error"
        variant="elevated"
        :loading="esperando"
        @click="eliminarDepartamento"
      >
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
