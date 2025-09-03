<script setup>
import { ref, watch, onMounted, computed, toRaw } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRuntimeConfig } from '#imports'

const props = defineProps({
  formData: { type: Object, required: true }
})

const emit = defineEmits(['update:formData', 'valid'])

const authStore = useAuthStore()
const config = useRuntimeConfig()

const productos = ref([])
const loading = ref(false)

// ⚠️ Usamos un ref local para el v-model del autocomplete
const productoSeleccionado = ref(null)

// Cuando cambia la selección, MERGE al form del padre y avisamos validez
watch(productoSeleccionado, (val) => {
  const patch = {
    producto: val ?? null,
    producto_id: val?.id ?? null,
    producto_nombre: val?.nombre ?? '',
    categoria: val?.categoria ?? '',
    stock_actual: val?.stock_actual ?? 0,
    precio_unitario: val?.producto_completo?.precio_unitario ?? 0,
    unidad_medida: val?.producto_completo?.unidad_medida ?? '',
    codigo_barras: val?.producto_completo?.codigo_barras ?? ''
  }

  // merge sin borrar lo existente
  emit('update:formData', { ...props.formData, ...patch })
  emit('valid', !!patch.producto_id)
})

// Método que el padre llamará antes de pasar al siguiente paso
function validar() {
  return !!(props.formData?.producto_id)
}

// Exponemos validar() para el padre
defineExpose({ validar })

const cargarProductos = async () => {
  loading.value = true
  try {
    const { data, error } = await useFetch('/alertasInventario', {
      baseURL: config.public.apiBase,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })
    if (error.value) throw error.value

    productos.value = (data.value || []).map(alerta => ({
      id: alerta.producto.id,
      nombre: alerta.producto.nombre,
      categoria: alerta.producto.categorium?.nombre ?? 'Sin categoría',
      stock_actual: alerta.producto.stock_actual,
      stock_minimo: alerta.producto.configuracion_productos?.[0]?.stock_minimo ?? 'No definido',
      producto_completo: alerta.producto,
    }))

    // Si el form del padre ya traía producto_id (volver atrás), precargar selección
    if (props.formData?.producto_id) {
      const ya = productos.value.find(p => p.id === props.formData.producto_id)
      if (ya) productoSeleccionado.value = ya
      emit('valid', !!ya)
    }
  } catch (e) {
    console.error('Error al cargar productos:', e)
  } finally {
    loading.value = false
  }
}

onMounted(cargarProductos)
</script>

<template>
  <div>
    <h4 class="text-h6 mb-4">Seleccione un Producto</h4>

    <VAutocomplete
      v-model="productoSeleccionado"
      :items="productos"
      item-title="nombre"
      item-value="id"
      :loading="loading"
      label="Producto"
      return-object
      clearable
    >
      <template #item="{ props, item }">
        <VListItem
          v-bind="props"
          :title="item.raw.nombre"
          :subtitle="`Categoría: ${item.raw.categoria} | Stock actual: ${item.raw.stock_actual} | Stock mínimo: ${item.raw.stock_minimo}`"
        />
      </template>
    </VAutocomplete>
  </div>
</template>
