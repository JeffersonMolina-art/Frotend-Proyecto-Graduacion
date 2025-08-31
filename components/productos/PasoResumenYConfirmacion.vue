<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const categoriaNombre = ref('')
const proveedorNombre = ref('')
const categorias = ref([])
const proveedores = ref([])

const authStore = useAuthStore()
const config = useRuntimeConfig()

const cargarDatos = async () => {
  try {
    const [catRes, provRes] = await Promise.all([
      useFetch('/categorias', {
        baseURL: config.public.apiBase,
        headers: { Authorization: `Bearer ${authStore.token}` },
      }),
      useFetch('/proveedores', {
        baseURL: config.public.apiBase,
        headers: { Authorization: `Bearer ${authStore.token}` },
      }),
    ])

    categorias.value = catRes.data.value || []
    proveedores.value = provRes.data.value || []

    const cat = categorias.value.find(c => c.id === props.data.categoria_id)
    const prov = proveedores.value.find(p => p.id === props.data.proveedor_id)

    categoriaNombre.value = cat?.nombre || 'No definido'
    proveedorNombre.value = prov?.nombre || 'No definido'
  } catch (e) {
    console.error('Error al cargar categoría o proveedor', e)
  }
}

onMounted(() => {
  cargarDatos()
})

// ===== Valores derivados =====
const precioVenta = computed(() => {
  const base = parseFloat(props.data.precio_unitario)
  return isNaN(base) ? '0.00' : (base * 1.45).toFixed(2)
})

const stockInicial = computed(() => props.data.stock_actual ?? '—')
const diasEntrega = computed(() => props.data.dias_llegada ?? '—')
const demandaMensual = computed(() => props.data.dias_venta ?? '—')
</script>

<template>
  <v-card flat>
    <v-card-text>
      <v-row dense>
        <!-- Información Básica -->
        <v-col cols="12" md="6">
          <h5 class="text-primary">Información Básica</h5>
          <p><strong>Nombre:</strong> {{ data.nombre }}</p>
          <p><strong>Unidad de medida:</strong> {{ data.unidad_medida }}</p>
          <p><strong>Precio de Compra:</strong> Q {{ data.precio_unitario }}</p>
          <p><strong>Precio de Venta:</strong> Q {{ precioVenta }}</p>
        </v-col>

        <!-- Datos de Inventario -->
        <v-col cols="12" md="6">
          <h5 class="text-primary">Datos de Inventario</h5>
          <p><strong>Categoría:</strong> {{ categoriaNombre }}</p>
          <p><strong>Proveedor:</strong> {{ proveedorNombre }}</p>
          <p><strong>Stock Inicial:</strong> {{ stockInicial }} unidades</p>
        </v-col>

        <!-- Parámetros Sugeridos -->
        <v-col cols="12" md="6">
          <h5 class="text-primary">Parámetros Sugeridos</h5>
          <p><strong>Demanda mensual esperada:</strong> {{ demandaMensual }} dias</p>
          <p><strong>Días de entrega:</strong> {{ diasEntrega }} días</p>
        </v-col>

        <!-- Stock Calculado -->
        <v-col cols="12" md="6">
          <h5 class="text-success">Stock Calculado</h5>
          <v-text-field
            label="Stock Mínimo Sugerido"
            v-model="data.stock_minimo"
            type="number"
          />
          <v-text-field
            label="Stock Máximo Sugerido"
            v-model="data.stock_maximo"
            type="number"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
