<script setup>
import { ref, watch, defineExpose } from 'vue'

const props = defineProps({
  formData: Object, // recibe el objeto completo del padre
})

const valid = ref(true)
const formRef = ref(null)

const rules = {
  required: v => !!v || 'Campo obligatorio',
  positiveInt: v => (Number.isInteger(+v) && +v > 0) || 'Solo enteros positivos',
}

// Calcular sugerencias (stock mínimo y máximo)
watch(
  () => [
    +props.formData.dias_llegada,
    +props.formData.dias_venta,
    +props.formData.unidades_necesarias,
  ],
  ([diasLlegada, diasVenta, unidades]) => {
    if (diasLlegada > 0 && diasVenta > 0 && unidades > 0) {
      const demandaDiaria = unidades / diasVenta
      const minimo = Math.ceil(demandaDiaria * diasLlegada)
      const maximo = Math.ceil(demandaDiaria * (diasLlegada + 3))

      props.formData.sugerencias = {
        stock_minimo: minimo,
        stock_maximo: maximo,
      }
    }
  }
)

const validar = async () => {
  const result = await formRef.value?.validate?.()
  return result?.valid === true
}

defineExpose({ validar })
</script>

<template>
  <v-form ref="formRef" v-model="valid">
    <v-row dense>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="formData.dias_llegada"
          label="¿Cuántos días tarda en llegar el producto?"
          type="number"
          :rules="[rules.required, rules.positiveInt]"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field
          v-model="formData.dias_venta"
          label="¿En cuántos días esperas venderlo?"
          type="number"
          :rules="[rules.required, rules.positiveInt]"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field
          v-model="formData.unidades_necesarias"
          label="¿Cuántas unidades necesitas para ese tiempo?"
          type="number"
          :rules="[rules.required, rules.positiveInt]"
        />
      </v-col>
    </v-row>
  </v-form>
</template>
