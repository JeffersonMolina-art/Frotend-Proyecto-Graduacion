<script setup>
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const productos = ref([])
const loading = ref(true)
const authStore = useAuthStore()
const config = useRuntimeConfig()

const dialogProducto = ref(false)
const dialogEliminar = ref(false)
const productoAEliminar = ref(null)
const editando = ref(false)

const snackbar = ref(false)
const snackbarMsg = ref('')
const snackbarColor = ref('success')

const productoFormulario = ref({})
const categorias = ref([])

const filtroNombre = ref('')
const filtroCategoria = ref(null)

const headers = [
  { title: 'Nombre', value: 'nombre' },
  { title: 'Descripción', value: 'descripcion' },
  { title: 'Código Barra', value: 'codigo_barra' },
  { title: 'Unidad Media', value: 'unidad_medida' },
  { title: 'Precio Unitario', value: 'precio_unitario' },
  { title: 'Stock Actual', value: 'stock_actual' },
  { title: 'Categoría', value: 'categorium.nombre' },
  { title: 'Acciones', value: 'acciones', sortable: false },
]

const cargarProductos = async () => {
  loading.value = true
  try {
    const { data } = await useFetch('/productos', {
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    if (data.value) productos.value = data.value
  } catch (e) {
    console.error('Error al cargar productos', e)
  } finally {
    loading.value = false
  }
}

const cargarCategorias = async () => {
  try {
    const { data } = await useFetch('/categorias', {
      baseURL: useRuntimeConfig().public.apiBase,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })
    if (data.value) categorias.value = data.value
  } catch (e) {
    console.error('Error al cargar categorías', e)
  }
}

const abrirModalCrear = () => {
   navigateTo('/crearProductos')
}

const esColaborador = computed(() => {
  const rolesUsuario = authStore.user?.roles || []
  return rolesUsuario.includes('Colaborador')
})

const abrirModalEditar = async (producto) => {
  if (!categorias.value.length) {
    await cargarCategorias()
  }

  productoFormulario.value = {
    ...producto,
    categoria_id: categorias.value.find(
      c => c.id === producto.categoria_id || c.id === producto.categorium?.id
    ),
  }
  editando.value = true
  dialogProducto.value = true
}

const guardarProducto = async () => {
  const metodo = editando.value ? 'PUT' : 'POST'
  const endpoint = editando.value ? `/productos/${productoFormulario.value.id}` : '/productos'

  const body = { ...productoFormulario.value }

  if (body.categoria_id && typeof body.categoria_id === 'object') {
    body.categoria_id = body.categoria_id.id
  }

  try {
    await useFetch(endpoint, {
      baseURL: useRuntimeConfig().public.apiBase,
      method: metodo,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    snackbarMsg.value = editando.value ? 'Producto actualizado' : 'Producto creado'
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogProducto.value = false

    await cargarProductos()
  } catch (e) {
    console.error('Error al guardar producto', e)
    snackbarMsg.value = 'Error al guardar producto'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const confirmarEliminar = (producto) => {
  productoAEliminar.value = producto
  dialogEliminar.value = true
}

const eliminarProducto = async () => {
  try {
    await useFetch(`/productos/${productoAEliminar.value.id}`, {
      baseURL: useRuntimeConfig().public.apiBase,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    snackbarMsg.value = 'Producto eliminado'
    snackbarColor.value = 'success'
    snackbar.value = true
    dialogEliminar.value = false
    await cargarProductos()
  } catch (e) {
    console.error('Error al eliminar producto', e)
    snackbarMsg.value = 'Error al eliminar producto'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const productosFiltrados = computed(() => {
  return productos.value.filter(p => {
    const coincideNombre = p.nombre?.toLowerCase().includes(filtroNombre.value.toLowerCase())
    const coincideCategoria = !filtroCategoria.value || p.categoria_id === filtroCategoria.value
    return coincideNombre && coincideCategoria
  })
})

watch(
  () => authStore.token,
  async (token) => {
    if (token) {
      await cargarCategorias()
      await cargarProductos()
    }
  },
  { immediate: true }
)

definePageMeta({ middleware: 'auth' })
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center">
      <span>Inventario de Productos</span>
      <VBtn color="primary" @click="abrirModalCrear"  v-if="!esColaborador">Agregar Producto</VBtn>
    </VCardTitle>

    <!-- Filtros -->
    <VCardText class="d-flex flex-wrap gap-4">
      <VTextField
        v-model="filtroNombre"
        label="Buscar por nombre"
        density="compact"
        hide-details
        clearable
        class="flex-grow-1"
      />
      <VSelect
        v-model="filtroCategoria"
        :items="categorias"
        item-title="nombre"
        item-value="id"
        label="Filtrar por categoría"
        density="compact"
        hide-details
        clearable
        class="flex-grow-1"
      />
    </VCardText>

    <VDataTable
      :headers="headers"
      :items="productosFiltrados"
      :loading="loading"
      loading-text="Cargando productos..."
      items-per-page="10"
      class="pa-4"
    >
      <template #item.acciones="{ item }">
        <VBtn icon variant="text" color="primary" @click="abrirModalEditar(item)"  v-if="!esColaborador">
          <VIcon>tabler-edit</VIcon>
        </VBtn>
        <VBtn icon variant="text" color="error" @click="confirmarEliminar(item)"  v-if="!esColaborador">
          <VIcon>tabler-trash</VIcon>
        </VBtn>
      </template>
    </VDataTable>
  </VCard>

  <!-- Modal Crear/Editar -->
  <VDialog v-model="dialogProducto" max-width="600" persistent>
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span class="text-h6">{{ editando ? 'Editar' : 'Agregar' }} Producto</span>
        <VBtn icon @click="dialogProducto = false">
          <VIcon>tabler-x</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VRow dense>
          <VCol cols="12" md="6">
            <VTextField v-model="productoFormulario.nombre" label="Nombre" required />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="productoFormulario.descripcion" label="Descripción" required />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="productoFormulario.codigo_barra" label="Código de Barra" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="productoFormulario.unidad_medida" label="Unidad de Media" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="productoFormulario.precio_unitario" label="Precio Unitario" type="number" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="productoFormulario.stock_actual" label="Stock Actual" type="number" />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              v-model="productoFormulario.categoria_id"
              :items="categorias"
              item-title="nombre"
              item-value="id"
              label="Seleccionar Categoría"
              placeholder="Seleccione una categoría"
              return-object
              required
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn color="error" variant="outlined" @click="dialogProducto = false">
          <VIcon start icon="tabler-x" /> Cancelar
        </VBtn>
        <VBtn color="primary" variant="elevated" @click="guardarProducto">
          <VIcon start icon="tabler-check" /> Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Modal Eliminar -->
  <VDialog v-model="dialogEliminar" max-width="400" persistent>
    <VCard>
      <VCardTitle class="text-h6 d-flex justify-space-between align-center">
        Confirmar Eliminación
        <VBtn icon @click="dialogEliminar = false">
          <VIcon>tabler-x</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText>
        ¿Estás seguro de que deseas eliminar este producto?
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn color="secondary" variant="outlined" @click="dialogEliminar = false">
          <VIcon start icon="tabler-x" /> Cancelar
        </VBtn>
        <VBtn color="error" variant="elevated" @click="eliminarProducto">
          <VIcon start icon="tabler-trash" /> Eliminar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Snackbar -->
  <VSnackbar
    v-model="snackbar"
    :color="snackbarColor"
    location="bottom end"
    timeout="2000"
  >
    {{ snackbarMsg }}
  </VSnackbar>
</template>
