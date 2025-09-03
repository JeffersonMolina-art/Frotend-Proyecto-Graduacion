<script setup>
import { computed } from 'vue'

const props = defineProps({
  formData: { type: Object, required: true }
})

const totalPrecio = computed(() => {
  const cantidad = props.formData?.cantidad_sugerida || 0
  const precio = props.formData?.producto?.precio_unitario || 0
  return cantidad * precio
})
</script>

<template>
  <div>
    <h4 class="text-h6 mb-4">Resumen del Pedido</h4>

    <VRow>
      <!-- Producto -->
      <VCol cols="12" md="6">
        <VCard>
          <VCardTitle>Producto</VCardTitle>
          <VCardText>
            <p><strong>Nombre:</strong> {{ formData.producto?.nombre }}</p>
            <p><strong>Stock Actual:</strong> {{ formData.producto?.stock }}</p>
            <p><strong>Precio Unitario:</strong> Q{{ formData.producto?.precio_unitario }}</p>
            <p><strong>Categoría:</strong> {{ formData.producto?.categoria?.nombre || '-' }}</p>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Proveedor -->
      <VCol cols="12" md="6">
        <VCard>
          <VCardTitle>Proveedor</VCardTitle>
          <VCardText>
            <p><strong>Nombre:</strong> {{ formData.proveedor?.nombre }}</p>
            <p><strong>Correo:</strong> {{ formData.proveedor?.correo }}</p>
            <p><strong>Teléfono:</strong> {{ formData.proveedor?.telefono }}</p>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Datos de cálculo -->
      <VCol cols="12" class="mt-4">
        <VCard>
          <VCardTitle>Cálculo de Pedido</VCardTitle>
          <VCardText>
            <p><strong>Tiempo Promedio:</strong> {{ formData.tiempo_promedio }} días</p>
            <p><strong>Stock Mínimo:</strong> {{ formData.stock_minimo }}</p>
            <p><strong>Stock Máximo:</strong> {{ formData.stock_maximo }}</p>
            <p><strong>Cantidad Sugerida a Pedir:</strong> {{ formData.cantidad_sugerida }}</p>
            <p><strong>Total Aproximado:</strong> <strong>Q{{ totalPrecio }}</strong></p>
            <p v-if="formData.fecha_entrega_estimada"><strong>Entrega Estimada:</strong> {{ formData.fecha_entrega_estimada }}</p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
