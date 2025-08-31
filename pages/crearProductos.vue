<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

import PasoDatosGenerales from '@/components/productos/PasoDatosGenerales.vue'
import PasoInventarioInicial from '@/components/productos/PasoInventarioInicial.vue'
import PasoPreguntasSugerencia from '@/components/productos/PasoPreguntasSugerencia.vue'
import PasoResumenYConfirmacion from '@/components/productos/PasoResumenYConfirmacion.vue'

const props = defineProps({
  producto: { type: Object, default: () => ({}) },
  editando: { type: Boolean, default: false },
})

const emit = defineEmits(['guardado', 'cerrar'])

const currentStep = ref(0)
const authStore = useAuthStore()
const config = useRuntimeConfig()

const esperando = ref(false)
const snackbar = ref(false)
const snackbarMsg = ref('')
const snackbarColor = ref('success')

// ---- Form central (se comparte con los pasos) ----
const formData = ref({
  id: null,
  // Paso 1
  nombre: '',
  descripcion: '',
  categoria_id: null,
  precio_unitario: null,
  unidad_id: null,
  unidad_medida: '',
  codigo_barras: '',
  proveedor_id: null,
  // Paso 2
  cantidad_comprada: null,
  stock_inicial: null,
  // Paso 3
  sugerencias: {},
  stock_actual: null,
  stock_minimo: null,
  stock_maximo: null,
})

// ---- Items Stepper ----
const pasos = [
  { title: 'Información Básica',     subtitle: 'Datos generales del producto' },
  { title: 'Parámetros Sugeridos',   subtitle: 'Preguntas para calcular sugerencias' },
  { title: 'Inventario',             subtitle: 'Cantidad, unidad y stock' },
  { title: 'Resumen y Confirmación', subtitle: 'Verifica y guarda el producto' },
]

// ---- Precarga en edición ----
onMounted(() => {
  if (props.editando && props.producto) {
    const p = props.producto
    formData.value = {
      id: p.id ?? null,
      nombre: p.nombre ?? '',
      descripcion: p.descripcion ?? '',
      categoria_id: p.categoria_id ?? null,
      precio_unitario: p.precio_unitario ?? null,
      unidad_id: p.unidad_id ?? null,
      unidad_medida: p.unidad_medida ?? '',
      codigo_barras: p.codigo_barras ?? '',
      proveedor_id: p.proveedor_id ?? null,
      cantidad_comprada: p.cantidad_comprada ?? null,
      stock_inicial: p.stock_inicial ?? null,
      sugerencias: p.sugerencias ?? {},
      stock_actual: null,
      stock_minimo: null,
      stock_maximo: null,

    }
  }
})

// ---- Validaciones por paso (inicialmente paso 1 requiere validación)
const stepValid = ref({
  0: false,
  1: true,
  2: true,
  3: true,
})

const puedeSiguiente = computed(() => stepValid.value[currentStep.value])
const puedeGuardar = computed(() => Object.values(stepValid.value).every(Boolean))

// ---- Refs a pasos
const pasoDatosRef = ref()
const pasoInventarioRef = ref()
const pasoPreguntasRef = ref()

// ---- Validar y avanzar
const irAlSiguientePaso = async () => {
  let esValido = true

  switch (currentStep.value) {
    case 0:
      esValido = await pasoDatosRef.value?.validar?.()
      stepValid.value[0] = esValido
      break
    case 1:
      esValido = await pasoPreguntasRef.value?.validar?.()
      stepValid.value[1] = esValido
      break
    case 2:
      esValido = await pasoInventarioRef.value?.validar?.()
      stepValid.value[2] = esValido
      break
  }

  if (esValido) {
    
    console.log('✅ Sugerencias actualizadas:', formData.value)
    
    currentStep.value++
  } else {
    snackbarMsg.value = 'Completa todos los campos obligatorios.'
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

// ---- Guardar ----
const guardarProducto = async () => {
  esperando.value = true

  try {
    console.log('Guardando producto con datos:', formData.value)

    const payload = {
      ...formData.value,
      stock_minimo: formData.value.sugerencias?.stock_minimo ?? 0,
      stock_maximo: formData.value.sugerencias?.stock_maximo ?? 0,
      stock_inicial: formData.value.stock_actual,
      precio_venta: (parseFloat(formData.value.precio_unitario) * 1.45).toFixed(2),
      dias_esperado: formData.value.dias_llegada,
      demanda: formData.value.dias_venta,
    }

    const { data, error } = await useFetch('/productos/configuracion', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (error.value) throw error.value

    snackbarMsg.value = 'Producto creado correctamente'
    snackbarColor.value = 'success'
    snackbar.value = true

    emit('guardado', data.value)


    formData.value = {
      id: null,
      nombre: '',
      descripcion: '',
      categoria_id: null,
      precio_unitario: null,
      unidad_id: null,
      unidad_medida: '',
      codigo_barras: '',
      proveedor_id: null,
      cantidad_comprada: null,
      stock_inicial: null,
      sugerencias: {},
      stock_actual: null,
      stock_minimo: null,
      stock_maximo: null,
    }

    // ✅ Ir al paso inicial
    currentStep.value = 0

    // ✅ Resetear validaciones
    stepValid.value = {
      0: true,
      1: true,
      2: true,
      3: true,
    }
  } catch (err) {
    console.error('❌ Error al guardar producto:', err)
    snackbarMsg.value = 'Error al guardar producto'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    esperando.value = false
  }
}

watch(() => formData.value, (val) => {
  console.log('FormData actualizado en el padre:', val)
}, { deep: true })
</script>

<template>
  <VCard>
    <VCardText>
      <AppStepper
        v-model:current-step="currentStep"
        :items="pasos"
        class="stepper-icon-step-bg"
      />
    </VCardText>

    <VDivider />

    <VCardText>
      <VWindow v-model="currentStep" class="disable-tab-transition">
        <!-- Paso 1 -->
        <VWindowItem>
          <PasoDatosGenerales
            ref="pasoDatosRef"
            v-model:formData="formData"
          />
        </VWindowItem>

        <!-- Paso 2 -->
        <VWindowItem>
          <PasoPreguntasSugerencia
            ref="pasoPreguntasRef"
            v-model:formData="formData"
          />
        </VWindowItem>

        <!-- Paso 3 -->
        <VWindowItem>
          <PasoInventarioInicial
            ref="pasoInventarioRef"
            v-model:formData="formData"
          />
        </VWindowItem>

        <!-- Paso 4 -->
        <VWindowItem>
          <PasoResumenYConfirmacion :data="formData" />
        </VWindowItem>

      </VWindow>

      <!-- Navegación -->
      <div class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8">
        <VBtn
          color="secondary"
          variant="tonal"
          :disabled="currentStep === 0 || esperando"
          @click="currentStep--"
        >
          <VIcon icon="tabler-arrow-left" start class="flip-in-rtl" />
          Anterior
        </VBtn>

        <VBtn
          v-if="currentStep === pasos.length - 1"
          color="success"
          :loading="esperando"
          :disabled="!puedeGuardar || esperando"
          @click="guardarProducto"
        >
          Guardar Producto
        </VBtn>

        <VBtn
          v-else
          color="primary"
          :disabled="esperando"
          @click="irAlSiguientePaso"
        >
          Siguiente
          <VIcon icon="tabler-arrow-right" end class="flip-in-rtl" />
        </VBtn>
      </div>

      <!-- Snackbar -->
      <VSnackbar v-model="snackbar" :color="snackbarColor" timeout="2500">
        {{ snackbarMsg }}
      </VSnackbar>
    </VCardText>
  </VCard>
</template>
