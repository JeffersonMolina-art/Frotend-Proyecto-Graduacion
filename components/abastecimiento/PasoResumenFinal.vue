<script setup>
import { watch } from 'vue'

const props = defineProps({
  formData: { type: Object, required: true },
})

const emit = defineEmits(['finalizar'])

</script>

<template>
  <div>
    <h4 class="text-h6 mb-4">Confirmar Abastecimiento</h4>

    <VAlert type="info" border="start" variant="tonal" class="mb-4">
      Por favor, revisa toda la información antes de finalizar el proceso.
    </VAlert>

    <VRow>
      <!-- Producto -->
      <VCol cols="12" md="6">
        <VCard>
          <VCardTitle>Producto Seleccionado</VCardTitle>
          <VCardText>
            <p><strong>Nombre:</strong> {{ formData.producto_nombre }}</p>
            <p><strong>Stock Actual:</strong> {{ formData.stock_actual }}</p>
            <p><strong>Precio Unitario:</strong> Q. {{ formData.precio_unitario }}</p>
            <p><strong>Categoría:</strong> {{ formData.categoria || '-' }}</p>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Proveedor -->
      <VCol cols="12" md="6">
        <VCard>
          <VCardTitle>Proveedor Seleccionado</VCardTitle>
          <VCardText>
            <p><strong>Nombre:</strong> {{ formData.proveedor_nombre }}</p>
            <p><strong>Correo:</strong> {{ formData.proveedor_correo }}</p>
            <p><strong>Teléfono:</strong> {{ formData.proveedor_telefono }}</p>
            <p><strong>Dirección:</strong> {{ formData.proveedor_direccion }}</p>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Detalles del Pedido -->
      <VCol cols="12" class="mt-4">
        <VCard>
          <VCardTitle>Detalles del Pedido</VCardTitle>
          <VCardText>
            <p><strong>Tiempo Promedio:</strong> {{ formData.tiempo_promedio }} días</p>
            <p><strong>Stock Mínimo:</strong> {{ formData.stock_minimo }} unidades</p>
            <p><strong>Stock Máximo:</strong> {{ formData.stock_maximo }} unidades</p>
            <p><strong>Cantidad a Pedir:</strong> {{ formData.cantidad_sugerida }} unidades</p>
            <p>
              <strong>Total Estimado de compra: </strong>
              <strong>Q. {{ (formData.cantidad_sugerida || 0) * (formData.precio_unitario || 0) }}</strong>
            </p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
