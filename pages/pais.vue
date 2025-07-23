<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEsperar } from '@/composables/useEsperar'

/* ─── stores & refs ─────────────────────────────────────────── */
const { esperar, finEspera } = useEsperar()
const authStore = useAuthStore()
const config    = useRuntimeConfig()

const paises          = ref([])
const esperando        = ref(false)     // barra superior y botones
const dialogPais       = ref(false)
const dialogEliminar   = ref(false)
const paisAEliminar    = ref(null)
const editando         = ref(false)

const snackbar      = ref(false)
const snackbarMsg   = ref('')
const snackbarColor = ref('success')

const paisFormulario = ref({})

/* ─── tabla ─────────────────────────────────────────────────── */
const headers = [
  { title: 'ID',     value: 'id'     },
  { title: 'Nombre', value: 'nombre' },
  { title: 'Acciones', value: 'acciones', sortable: false },
]

/* ─── peticiones API ────────────────────────────────────────── */
const cargarPaises = async () => {
  esperar()
  try {
    const { data } = await useFetch('/paises', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    // normaliza [] o { data: [] }
    paises.value = Array.isArray(data.value)
      ? data.value
      : data.value?.data ?? []
  } catch (e) {
    console.error('Error al cargar países', e)
  } finally {
    finEspera()
  }
}

/* ─── helpers de UI ─────────────────────────────────────────── */
const abrirModalCrear  = () => {
  paisFormulario.value = { nombre: '' }
  editando.value = false
  dialogPais.value = true
}

const abrirModalEditar = p => {
  paisFormulario.value = { id: p.id, nombre: p.nombre }
  editando.value = true
  dialogPais.value = true
}

const validarFormulario = () => {
  if (!paisFormulario.value.nombre?.trim()) {
    snackbarMsg.value = 'Falta el nombre del país'
    snackbarColor.value = 'error'
    snackbar.value = true
    return false
  }
  return true
}

/* ─── guardar (POST/PUT) ────────────────────────────────────── */
const guardarPais = async () => {
  if (!validarFormulario()) return

  const metodo   = editando.value ? 'PUT' : 'POST'
  const endpoint = editando.value
    ? `/paises/${paisFormulario.value.id}`
    : '/paises'

  esperando.value = true
  try {
    await useFetch(endpoint, {
      baseURL: config.public.apiBase,
      method: metodo,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paisFormulario.value),
    })

    snackbarMsg.value   = 'País guardado correctamente'
    snackbarColor.value = 'success'
    snackbar.value      = true
    dialogPais.value    = false
    await cargarPaises()
  } catch (e) {
    console.error('Error al guardar país', e)
    snackbarMsg.value   = 'Error al guardar país'
    snackbarColor.value = 'error'
    snackbar.value      = true
  } finally {
    esperando.value = false
  }
}

/* ─── eliminar ─────────────────────────────────────────────── */
const confirmarEliminar = p => { paisAEliminar.value = p; dialogEliminar.value = true }

const eliminarPais = async () => {
  esperando.value = true
  try {
    await useFetch(`/paises/${paisAEliminar.value.id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    snackbarMsg.value   = `País ${paisAEliminar.value.nombre} eliminado`
    snackbarColor.value = 'success'
    snackbar.value      = true
    dialogEliminar.value = false
    await cargarPaises()
  } catch (e) {
    console.error('Error al eliminar país', e)
    snackbarMsg.value   = 'Error al eliminar país'
    snackbarColor.value = 'error'
    snackbar.value      = true
  } finally {
    esperando.value = false
  }
}

/* ─── primera carga ─────────────────────────────────────────── */
watch(
  () => authStore.token,
  async token => { if (token) await cargarPaises() },
  { immediate: true },
)

definePageMeta({ middleware: 'auth' })
</script>

<template>
  <VCard>
    <!-- barra superior de espera -->
    <VProgressLinear v-if="esperando" indeterminate height="3" color="primary" />

    <VCardTitle class="d-flex justify-space-between align-center">
      <span>Países</span>
      <VBtn color="primary" @click="abrirModalCrear">Agregar País</VBtn>
    </VCardTitle>

    <!-- sin :loading para que no desaparezcan las filas -->
    <VDataTable
      :headers="headers"
      :items="paises"
      items-per-page="10"
      class="pa-4"
    >
      <template #item.acciones="{ item }">
        <VBtn icon variant="text" color="primary" @click="abrirModalEditar(item)">
          <VIcon>tabler-edit</VIcon>
        </VBtn>
        <VBtn icon variant="text" color="error"   @click="confirmarEliminar(item)">
          <VIcon>tabler-trash</VIcon>
        </VBtn>
      </template>
    </VDataTable>
  </VCard>

  <!-- Crear / Editar -->
  <VDialog v-model="dialogPais" persistent max-width="500">
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span class="text-h6">{{ editando ? 'Editar' : 'Agregar' }} País</span>
        <VBtn icon @click="dialogPais = false"><VIcon>tabler-x</VIcon></VBtn>
      </VCardTitle>

      <VCardText>
        <VTextField
          v-model="paisFormulario.nombre"
          label="Nombre"
          required
        />
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn color="error" variant="outlined" @click="dialogPais = false">
          <VIcon start icon="tabler-x" /> Cancelar
        </VBtn>
        <VBtn
          color="primary"
          variant="elevated"
          :loading="esperando"
          @click="guardarPais"
        >
          <VIcon start icon="tabler-check" /> Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Confirmar eliminación -->
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
        <VBtn
          color="error"
          variant="elevated"
          :loading="esperando"
          @click="eliminarPais"
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
