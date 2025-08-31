<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEsperar } from '@/composables/useEsperar'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  roles: {
    type: Array,
    default: () => [],
  },
})

const authStore = useAuthStore()

const alertas = ref([])
const loading = ref(false)
const router = useRouter()
const { esperar, finEspera } = useEsperar()

const rolesPermitidos = ['Admin', 'gerente', 'superadministrador']

const puedeVerAlertas = computed(() => {
  return props.roles.some(rol => rolesPermitidos.includes(rol))
})

// Filtros
const filtroNombre = ref('')
const filtroCategoria = ref(null)
const categorias = ref([])

const alertasFiltradas = computed(() => {
  return alertas.value.filter(alerta => {
    const nombreCoincide = alerta.producto?.nombre?.toLowerCase().includes(filtroNombre.value.toLowerCase())
    const categoriaCoincide = !filtroCategoria.value || alerta.producto?.categorium?.id === filtroCategoria.value
    return nombreCoincide && categoriaCoincide
  })
})

const cargarAlertas = async () => {
  if (!puedeVerAlertas.value) return

  esperar()
  loading.value = true

  try {
    const { data } = await useFetch('/alertasInventario/generarAlertas', {
      baseURL: useRuntimeConfig().public.apiBase,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (data.value?.alertas) {
      alertas.value = data.value.alertas.alertas

      // Extraer categorías únicas
      const unicas = []
      data.value.alertas.alertas.forEach(alerta => {
        const categoria = alerta.producto?.categorium
        if (categoria && !unicas.some(c => c.id === categoria.id)) {
          unicas.push({ id: categoria.id, nombre: categoria.nombre })
        }
      })
      categorias.value = unicas
    }
  } catch (error) {
    console.error('Error al cargar alertas de inventario', error)
  } finally {
    finEspera()
    loading.value = false
  }
}

const irAReabastecer = () => {
  router.push('/productos/reabastecer')
}

onMounted(() => {
  cargarAlertas()
})
</script>

<template>
  <VCard v-if="puedeVerAlertas" title="Productos en stock mínimo" class="mt-4">
    <VCardText>
      <div v-if="loading" class="d-flex align-center gap-3">
        <VProgressCircular indeterminate color="primary" size="32" />
        Cargando alertas de inventario...
      </div>

      <div v-else>
        <!-- FILTROS -->
        <div class="d-flex flex-wrap align-center gap-4 mb-4">
          <VTextField
            v-model="filtroNombre"
            label="Buscar por nombre"
            prepend-inner-icon="tabler-search"
            clearable
            density="compact"
            class="flex-grow-1"
          />
          <VSelect
            v-model="filtroCategoria"
            :items="categorias"
            item-title="nombre"
            item-value="id"
            label="Filtrar por categoría"
            clearable
            density="compact"
            class="flex-grow-1"
          />
        </div>

        <!-- TABLA -->
        <div v-if="alertasFiltradas.length === 0">
          No hay productos que coincidan con los filtros aplicados.
        </div>

        <VTable v-else dense>
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">Categoría</th>
              <th scope="col">Stock actual</th>
              <th scope="col">Stock mínimo</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="alerta in alertasFiltradas"
              :key="alerta.id"
              :class="{ 'text-error': alerta.stock_actual <= (alerta.producto?.configuracion_productos?.[0]?.stock_minimo ?? 0) }"
            >
              <td>{{ alerta.producto?.nombre || 'Sin nombre' }}</td>
              <td>{{ alerta.producto?.categorium?.nombre || 'Sin categoría' }}</td>
              <td>{{ alerta.stock_actual }}</td>
              <td>{{ alerta.producto?.configuracion_productos?.[0]?.stock_minimo ?? 'N/A' }}</td>
            </tr>
          </tbody>
        </VTable>

        <div class="d-flex justify-end mt-4">
          <VBtn color="primary" @click="irAReabastecer">
            Ir a reabastecer productos
          </VBtn>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
