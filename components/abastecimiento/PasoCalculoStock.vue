<script setup>
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRuntimeConfig } from '#imports'

const props = defineProps({
  formData: { type: Object, required: true },
})

const emit = defineEmits(['update:formData', 'datos-calculados', 'valid'])

const authStore = useAuthStore()
const config = useRuntimeConfig()

const movimientos = ref([])
const tiempoPromedio = ref(props.formData.tiempo_promedio || 0)
const stockMinimo = ref(props.formData.stock_minimo || 0)
const stockMaximo = ref(props.formData.stock_maximo || 0)
const cantidadSugerida = ref(props.formData.cantidad_sugerida || 0)

// Acceso cómodo al producto y a su stock actual
const producto = computed(() => props.formData?.producto || {})
const stockActual = computed(() => {
  return Number(props.formData?.stock_actual ?? producto.value?.stock ?? 0)
})

// Obtener movimientos filtrados directamente desde el backend
const obtenerMovimientos = async () => {
  try {
    const { data, error } = await useFetch('/movimientosInventario/filtrados', {
      baseURL: config.public.apiBase,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      params: { producto_id: props.formData?.producto_id },
    })
    if (error.value) throw error.value

    movimientos.value = data.value || []
    calcularValores()
  } catch (e) {
    console.error('Error al obtener movimientos:', e)
  }
}

// Cálculos de stock sugerido
const calcularValores = () => {

  console.log(movimientos.value)
  const totalSalidas = movimientos.value.reduce((acc, m) => acc + (Number(m.cantidad) || 0), 0)
  const promedioDiario = totalSalidas / 30

  stockMinimo.value = Math.ceil(promedioDiario * Number(tiempoPromedio.value || 0))
  stockMaximo.value = Math.ceil(stockMinimo.value * 1.5)

  const diferencia = stockMaximo.value - stockActual.value
  cantidadSugerida.value = diferencia > 0 ? diferencia : 0

  console.log('Cálculo de stock:', {
    totalSalidas,
    promedioDiario,
    stockMinimo: stockMinimo.value,
    stockMaximo: stockMaximo.value,
    cantidadSugerida: cantidadSugerida.value,
  })

  // Merge al form del padre
  const patch = {
    tiempo_promedio: Number(tiempoPromedio.value || 0),
    stock_minimo: Number(stockMinimo.value || 0),
    stock_maximo: Number(stockMaximo.value || 0),
    cantidad_sugerida: Number(cantidadSugerida.value || 0),
    fecha_entrega_estimada: props.formData?.producto?.configuracion?.fecha_entrega_estimada ?? null,
  }
  emit('update:formData', { ...props.formData, ...patch })
  emit('datos-calculados', patch)

  // Validación simple para habilitar el paso
  const esValido = !!props.formData?.producto_id
  emit('valid', esValido)
}

// Recalcular si cambia tiempoPromedio
watch(tiempoPromedio, calcularValores)

// Ejecutar cuando cambia de producto
watch(
  () => props.formData.producto_id,
  (nuevo, viejo) => {
    if (nuevo && nuevo !== viejo) {
      console.log(formatDate)
      obtenerMovimientos()
    }
  },
  { immediate: true }
)

// Exponer método validar() al wizard
function validar() {
  return !!props.formData?.producto_id
}
defineExpose({ validar })
</script>

<template>
  <div>
    <h4 class="text-h6 mb-4">Cálculo de Stock y Pedido</h4>

    <VRow>
      <VCol cols="12" md="6">
        <VTextField
          v-model.number="tiempoPromedio"
          label="Tiempo Promedio (días)"
          type="number"
          min="0"
          hint="Días de reposición / entrega"
          persistent-hint
        />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField
          :model-value="stockActual"
          label="Stock Actual"
          type="number"
          readonly
        />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField
          v-model.number="stockMinimo"
          label="Stock Mínimo Sugerido"
          type="number"
          readonly
        />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField
          v-model.number="stockMaximo"
          label="Stock Máximo Sugerido"
          type="number"
          readonly
        />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField
          v-model.number="cantidadSugerida"
          label="Cantidad a Pedir"
          type="number"
          readonly
        />
      </VCol>
    </VRow>
  </div>
</template>
