<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const productos = ref([])
const loading = ref(true)
const authStore = useAuthStore()

const dialogProducto = ref(false)
const dialogEliminar = ref(false)
const productoAEliminar = ref(null)
const editando = ref(false)

const snackbar = ref(false)
const snackbarMsg = ref('')
const snackbarColor = ref('success')

const productoFormulario = ref({})
const categorias = ref([]) // esto debe estar arriba


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
  const { data } = await useFetch('/productos', {
    baseURL: useRuntimeConfig().public.apiBase,
    headers: { Authorization: `Bearer ${authStore.token}` },
  })
  if (data.value) productos.value = data.value
  console.log('Productos cargados:', productos.value)
  loading.value = false
}

const cargarCategorias = async () => {
  const { data } = await useFetch('/categorias', {
    baseURL: useRuntimeConfig().public.apiBase,
    headers: { Authorization: `Bearer ${authStore.token}` }
  })
  if (data.value) categorias.value = data.value
}

const abrirModalCrear = () => {
  productoFormulario.value = {
    nombre: '', descripcion: '', codigo_barra: '', unidad_medida: '',
    precio_unitario: null, stock_actual: null, categoria_id: null
  }
  editando.value = false
  dialogProducto.value = true
}

const abrirModalEditar = (producto) => {
  productoFormulario.value = {
    ...producto,
    categoria_id: categorias.value.find(c => c.id === producto.categoria_id || c.id === producto.categorium?.id)
  }
  editando.value = true
  dialogProducto.value = true
}

const guardarProducto = async () => {
  const metodo = editando.value ? 'PUT' : 'POST'
  const endpoint = editando.value ? `/productos/${productoFormulario.value.id}` : '/productos'

  // Clona y ajusta antes de enviar
  const body = { ...productoFormulario.value }

  // Asegúrate de mandar solo el ID, no el objeto
  if (body.categoria_id && typeof body.categoria_id === 'object') {
    body.categoria_id = body.categoria_id.id
  }

  await useFetch(endpoint, {
    baseURL: useRuntimeConfig().public.apiBase,
    method: metodo,
    body,
    headers: { Authorization: `Bearer ${authStore.token}` },
  })

  snackbarMsg.value = editando.value ? 'Producto actualizado' : 'Producto creado'
  snackbarColor.value = 'success'
  snackbar.value = true

  dialogProducto.value = false
  await cargarProductos()
}


const confirmarEliminar = (producto) => {
  productoAEliminar.value = producto
  dialogEliminar.value = true
}

const eliminarProducto = async () => {
  await useFetch(`/productos/${productoAEliminar.value.id}`, {
    baseURL: useRuntimeConfig().public.apiBase,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authStore.token}` },
  })
  snackbarMsg.value = 'Producto eliminado'
  snackbarColor.value = 'success'
  snackbar.value = true
  dialogEliminar.value = false
  await cargarProductos()
}

onMounted(() => {
  cargarProductos()
  cargarCategorias()
})

definePageMeta({ middleware: 'auth' })
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center">
      <span>Inventario de Productos</span>
      <VBtn color="primary" @click="abrirModalCrear">Agregar Producto</VBtn>
    </VCardTitle>

    <VDataTable
      :headers="headers"
      :items="productos"
      :loading="loading"
      loading-text="Cargando productos..."
      items-per-page="10"
      class="pa-4"
    >
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
