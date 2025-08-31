<script setup>
import { ref, onMounted, defineExpose } from 'vue'

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  }
})

const valid = ref(true)
const formRef = ref(null)

const rules = {
  required: v => v !== null && v !== '' || 'Campo obligatorio',
  minZero: v => Number(v) >= 0 || 'Debe ser mayor o igual a 0',
}

// Copiar sugerencias si no están ya en formData
onMounted(() => {
  if (props.formData.sugerencias) {
    props.formData.stock_minimo ??= props.formData.sugerencias.stock_minimo
    props.formData.stock_maximo ??= props.formData.sugerencias.stock_maximo
  }
})

// Función de validación para avanzar al siguiente paso
const validar = async () => {
  const { stock_actual, stock_minimo, stock_maximo } = props.formData

  const esValido =
    rules.required(stock_actual) === true &&
    rules.required(stock_minimo) === true &&
    rules.required(stock_maximo) === true &&
    rules.minZero(stock_actual) === true &&
    rules.minZero(stock_minimo) === true &&
    rules.minZero(stock_maximo) === true

  return esValido
}

defineExpose({ validar })
</script>


<template>
  <VRow dense>
    <!-- Stock actual editable -->
    <VCol cols="12" md="4">
      <VTextField
        v-model="formData.stock_actual"
        label="Stock Actual"
        type="number"
        placeholder="Ej. 100"
      />
    </VCol>

    <!-- Stock mínimo calculado automáticamente -->
    <VCol cols="12" md="4">
      <VTextField
        :model-value="formData.sugerencias?.stock_minimo"
        label="Stock Mínimo (sugerido)"
        hint="Calculado automáticamente"
        persistent-hint
      />
    </VCol>

    <!-- Stock máximo calculado automáticamente -->
    <VCol cols="12" md="4">
      <VTextField
        :model-value="formData.sugerencias?.stock_maximo"
        label="Stock Máximo (sugerido)"
        hint="Calculado automáticamente"
        persistent-hint
      />
    </VCol>
  </VRow>
</template>

