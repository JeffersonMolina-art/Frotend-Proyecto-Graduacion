<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEsperar } from '@/composables/useEsperar'

const { esperar, finEspera } = useEsperar()

const categorias           = ref([])
const categoriaFormulario = ref({ nombre: '', descripcion: '' })
const loading              = ref(true)
const esperando            = ref(false)

const dialogCategoria      = ref(false)
const dialogEliminar       = ref(false)
const categoriaAEliminar   = ref(null)
const editando             = ref(false)

const snackbar             = ref(false)
const snackbarMsg          = ref('')
const snackbarColor        = ref('success')

const authStore = useAuthStore()
const config = useRuntimeConfig()

const headers = [
  { title: 'ID',            value: 'id' },
  { title: 'Nombre',        value: 'nombre' },
  { title: 'Descripción',   value: 'descripcion' },
  { title: 'Creado',        value: 'created_at' },
  { title: 'Actualizado',   value: 'updated_at' },
  { title: 'Acciones',      value: 'acciones', sortable: false },
]

const formatearFecha = fecha => {
  if (!fecha) return ''
  const d = new Date(fecha)
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0') // los meses van de 0 a 11
  const anio = d.getFullYear()
  return `${dia}/${mes}/${anio}`
}


// Cargar lista de categorías
const cargarCategorias = async () => {
  loading.value = true
  try {
    const res = await useFetch('/categorias', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
    })

    const datos = res.data?.value

    if (Array.isArray(datos)) {
      categorias.value = datos
    } else {
      console.warn('Respuesta inesperada al cargar categorías', datos)
      categorias.value = []
    }
  } catch (e) {
    console.error('Error al cargar categorías', e)
  } finally {
    loading.value = false
  }
}

const abrirModalCrear = () => {
  categoriaFormulario.value = { nombre: '', descripcion: '' }
  editando.value = false
  dialogCategoria.value = true
}

const abrirModalEditar = m => {
  categoriaFormulario.value = {
    id: m.id,
    nombre: m.nombre,
    descripcion: m.descripcion ?? '',
  }
  editando.value = true
  dialogCategoria.value = true
}

const validarFormulario = () => {
  if (!categoriaFormulario.value.nombre?.trim()) {
    snackbarMsg.value = 'Falta el nombre de la categoría'
    snackbarColor.value = 'error'
    snackbar.value = true
    return false
  }
  if (!categoriaFormulario.value.descripcion?.trim()) {
    snackbarMsg.value = 'Falta la descripción de la categoría'
    snackbarColor.value = 'error'
    snackbar.value = true
    return false
  }
  return true
}

const guardarCategoria = async () => {
  if (!validarFormulario()) return

  const metodo = editando.value ? 'PUT' : 'POST'
  const endpoint = editando.value
    ? `/categorias/${categoriaFormulario.value.id}`
    : '/categorias'

  esperando.value = true
  try {
    await useFetch(endpoint, {
      baseURL: config.public.apiBase,
      method: metodo,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoriaFormulario.value),
    })

    snackbarMsg.value = 'Categoría guardada correctamente'
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogCategoria.value = false
    await cargarCategorias()
  } catch (e) {
    console.error('Error al guardar categoría', e)
    snackbarMsg.value = 'Error al guardar categoría'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    esperando.value = false
  }
}

const confirmarEliminar = m => {
  categoriaAEliminar.value = m
  dialogEliminar.value = true
}

const eliminarCategoria = async () => {
  if (!categoriaAEliminar.value?.id) return

  esperando.value = true
  try {
    await useFetch(`/categorias/${categoriaAEliminar.value.id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    snackbarMsg.value = 'Categoría eliminada correctamente'
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogEliminar.value = false
    await cargarCategorias()
  } catch (e) {
    console.error('Error al eliminar categoría', e)
    snackbarMsg.value = 'Error al eliminar categoría'
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
      await cargarCategorias()
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
      <span>Categorías</span>
      <VBtn color="primary" @click="abrirModalCrear">Agregar Categoría</VBtn>
    </VCardTitle>

    <VDataTable
      :headers="headers"
      :items="categorias"
      :loading="loading"
      loading-text="Cargando categorías…"
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
  <VDialog v-model="dialogCategoria" max-width="500" persistent>
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span class="text-h6">{{ editando ? 'Editar' : 'Agregar' }} Categoría</span>
        <VBtn icon @click="dialogCategoria = false"><VIcon>tabler-x</VIcon></VBtn>
      </VCardTitle>

      <VCardText>
        <VRow dense>
          <VCol cols="6">
            <VTextField
              v-model="categoriaFormulario.nombre"
              label="Nombre"
              required
            />
          </VCol>
          <VCol cols="6">
            <VTextField
              v-model="categoriaFormulario.descripcion"
              label="Descripción"
              required
            />
          </VCol>
        </VRow>
      </VCardText>


      <VCardActions class="justify-end">
        <VBtn color="error" variant="outlined" @click="dialogCategoria = false">
          <VIcon start icon="tabler-x" /> Cancelar
        </VBtn>
        <VBtn color="primary" variant="elevated" :loading="esperando" @click="guardarCategoria">
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
        ¿Estás seguro de eliminar esta categoría?
      </span>
      <VCardActions class="justify-end w-100">
        <VBtn color="secondary" variant="outlined" @click="dialogEliminar = false">
          Cancelar
        </VBtn>
        <VBtn color="error" variant="elevated" :loading="esperando" @click="eliminarCategoria">
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
