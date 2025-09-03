<script setup>
import { ref, computed } from 'vue'

import { useAuthStore } from '@/stores/authStore'

import PasoSeleccionProducto from '@/components/abastecimiento/PasoSeleccionProducto.vue'
import PasoInformacionProducto from '@/components/abastecimiento/PasoInformacionProducto.vue'
import PasoSeleccionProveedor from '@/components/abastecimiento/PasoSeleccionProveedor.vue'
import PasoCalculoStock from '@/components/abastecimiento/PasoCalculoStock.vue'
import PasoResumenFinal from '@/components/abastecimiento/PasoResumenFinal.vue'

const pasos = [
  { title: 'Producto', subtitle: 'Selecciona el producto a abastecer' },
  { title: 'Información del producto', subtitle: 'Detalles visuales del producto' },
  { title: 'Proveedor', subtitle: 'Selecciona el proveedor y revisa su información' },
  { title: 'Cálculo', subtitle: 'Calcula stock mínimo, máximo y sugerido' },
  { title: 'Resumen', subtitle: 'Confirma y registra el abastecimiento' },
]

const currentStep = ref(0)
const esperando = ref(false)
const snackbar = ref(false)
const snackbarMsg = ref('')
const snackbarColor = ref('success')
const authStore = useAuthStore()
const config = useRuntimeConfig()


const formDataAbastecimiento = ref({
  producto_id: null,
  producto_nombre: '',
  categoria: '',
  stock_actual: 0,
  precio_unitario: 0,
  proveedor_id: null,
  proveedor_nombre: '',
  stock_minimo: 0,
  stock_maximo: 0,
  cantidad_recomendada: 0,
  tiempo_promedio: 0,
  producto: null,
  proveedor: null
})

const stepValid = ref({ 0: false, 1: true, 2: false, 3: false, 4: true })
const puedeSiguiente = computed(() => stepValid.value[currentStep.value])
const puedeGuardar = computed(() => Object.values(stepValid.value).every(Boolean))

const pasoRefs = [
  ref(), // PasoSeleccionProducto
  ref(), // PasoInformacionProducto
  ref(), // PasoSeleccionProveedor
  ref(), // PasoCalculoStock
]

const irAlSiguientePaso = async () => {
  let esValido = true
  const refPaso = pasoRefs[currentStep.value]
  if (refPaso?.value?.validar) {
    esValido = await refPaso.value.validar()
    stepValid.value[currentStep.value] = esValido
  }

  if (esValido) {
    currentStep.value++
  } else {
    snackbarMsg.value = 'Completa los campos obligatorios.'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

const guardarAbastecimiento = async () => {
  esperando.value = true
  try {
    const payload = {
      producto_id: formDataAbastecimiento.value.producto_id,
      proveedor_id: formDataAbastecimiento.value.proveedor_id,
      stock_minimo: formDataAbastecimiento.value.stock_minimo,
      stock_maximo: formDataAbastecimiento.value.stock_maximo,
      tiempo_reabastecimiento_dias: formDataAbastecimiento.value.tiempo_promedio,
      cantidad_sugerida: formDataAbastecimiento.value.cantidad_sugerida,
      precio_unitario: formDataAbastecimiento.value.precio_unitario,
    }

    console.log('📦 Enviando payload al backend:', payload)

    await $fetch(`/productos/${formDataAbastecimiento.value.producto_id}/abastecer`, {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: payload,
    })

    snackbarMsg.value = 'Abastecimiento registrado exitosamente'
    snackbarColor.value = 'success'
    snackbar.value = true

    navigateTo('/second-page')
    
  } catch (error) {
    console.error('❌ Error al guardar abastecimiento:', error)
    snackbarMsg.value = 'Error al guardar abastecimiento'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    esperando.value = false
  }
}

</script>

<template>
  <VCard>
    <VCardText>
      <AppStepper v-model:current-step="currentStep" :items="pasos" class="stepper-icon-step-bg" />
    </VCardText>

    <VDivider />

    <VCardText>
      <VWindow v-model="currentStep" class="disable-tab-transition">
        <VWindowItem>
          <PasoSeleccionProducto
            :ref="pasoRefs[0]"
            v-model:formData="formDataAbastecimiento"
            @valid="stepValid[0] = $event"
          />
        </VWindowItem>

        <VWindowItem>
          <PasoInformacionProducto ref="pasoRefs[1]" v-model:formData="formDataAbastecimiento" />
        </VWindowItem>

        <VWindowItem>
          <PasoSeleccionProveedor
            :ref="pasoRefs[2]"
            v-model:formData="formDataAbastecimiento"
            @valid="stepValid[2] = $event"
          />
        </VWindowItem>

        <VWindowItem>
          <PasoCalculoStock ref="pasoRefs[3]" v-model:formData="formDataAbastecimiento"  @valid="stepValid[3] = $event" />
        </VWindowItem>

        <VWindowItem>
          <PasoResumenFinal :formData="formDataAbastecimiento" />
        </VWindowItem>
      </VWindow>

      <div class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8">
        <VBtn color="secondary" variant="tonal" :disabled="currentStep === 0 || esperando" @click="currentStep--">
          <VIcon icon="tabler-arrow-left" start class="flip-in-rtl" /> Anterior
        </VBtn>

        <VBtn
          v-if="currentStep === pasos.length - 1"
          color="success"
          :loading="esperando"
          :disabled="!puedeGuardar || esperando"
          @click="guardarAbastecimiento"
        >
          Finalizar Abastecimiento
        </VBtn>

        <VBtn v-else color="primary" :disabled="!puedeSiguiente || esperando" @click="irAlSiguientePaso">
          Siguiente
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>
