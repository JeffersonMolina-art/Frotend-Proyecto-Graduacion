<script setup>
import { computed } from 'vue'

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
})

// Acceso seguro al producto
const producto = computed(() => props.formData.producto ?? {})

const precioFormateado = computed(() => {
  const precio = producto.value.producto_completo.precio_unitario ?? 0
  return `Q ${parseFloat(precio).toFixed(2)}`
})

</script>

<template>
  <div class="mt-4">
    <h4 class="text-h6 mb-4">Información del Producto</h4>

    <VRow>
      <VCol cols="12" sm="6">
        <VTextField
          label="Nombre"
          :model-value="producto.nombre"
          readonly
        />
      </VCol>

      <VCol cols="12" sm="6">
        <VTextField
          label="Descripción"
          :model-value="producto.producto_completo.descripcion"
          readonly
        />
      </VCol>

      <VCol cols="12" sm="6">
        <VTextField
          label="Categoría"
          :model-value="producto.categoria"
          readonly
        />
      </VCol>

      <VCol cols="12" sm="6">
        <VTextField
          label="Precio Unitario"
          :model-value="precioFormateado"
          readonly
        />
      </VCol>

      <VCol cols="12" sm="6">
        <VTextField
          label="Unidad de Medida"
          :model-value="producto.producto_completo.unidad_medida"
          readonly
        />
      </VCol>

      <VCol cols="12" sm="6">
        <VTextField
          label="Código de Barras"
          :model-value="producto.producto_completo.codigo_barra"
          readonly
        />
      </VCol>
    </VRow>
  </div>
</template>
