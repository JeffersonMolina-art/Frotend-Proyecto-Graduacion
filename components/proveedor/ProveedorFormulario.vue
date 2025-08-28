<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEsperar } from '@/composables/useEsperar'

const emit = defineEmits(['guardar', 'cerrar'])

const currentStep = ref(0)

const authStore = useAuthStore()
const config = useRuntimeConfig()

const editando              = ref(false)
const loading               = ref(true)
const esperando             = ref(false)
const snackbar      = ref(false)
const snackbarMsg   = ref('')
const snackbarColor = ref('success')


const formData = ref({
  nombre: '',
  telefono: '',
  correo: '',
  direccion: '',
})

const steps = [
  {
    title: 'Datos',
    subtitle: 'Información del proveedor',
  },
  {
    title: 'Confirmar',
    subtitle: 'Revisar información',
  },
]



const guardarProveedor = async () => {
  if (!formData.value.nombre?.trim()) {
    snackbarMsg.value = 'Falta el nombre del proveedor'
    snackbarColor.value = 'error'
    snackbar.value = true
    return
  }

  const metodo = editando.value ? 'PUT' : 'POST'
  const endpoint = editando.value
    ? `/proveedores/${formData.value.id}`
    : '/proveedores'

  esperando.value = true
  try {
    await useFetch(endpoint, {
      baseURL: config.public.apiBase,
      method: metodo,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value),
    })

    snackbarMsg.value = `${formData.value.nombre} guardado correctamente`
    snackbarColor.value = 'success'
    snackbar.value = true
    // mostrarModal.value = false
    emit('guardado') // notifica al padre para recargar la tabla
  } catch (e) {
    console.error('Error al guardar proveedor', e)
    snackbarMsg.value = 'Error al guardar proveedor'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    esperando.value = false
  }
}

</script>

<template>
  <VCard>
  

    <!-- Stepper -->
    <VCardText>
      <AppStepper
        v-model:current-step="currentStep"
        :items="steps"
        class="stepper-icon-step-bg"
      />
    </VCardText>

    <VDivider />

    <VCardText>
      <VForm>
        <VWindow v-model="currentStep" class="disable-tab-transition">
          <!-- Paso 1: Datos -->
          <VWindowItem>
            <VRow>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.nombre"
                  label="Nombre"
                  placeholder="Ej. Distribuidora Global"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.telefono"
                  label="Teléfono"
                  placeholder="Ej. 55554444"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.correo"
                  label="Correo"
                  placeholder="Ej. contacto@empresa.com"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="formData.direccion"
                  label="Dirección"
                  placeholder="Ej. Zona 5, Ciudad de Guatemala"
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <!-- Paso 2: Confirmación -->
          <VWindowItem>
            <VRow>
              <VCol cols="12">
                <h6 class="text-h6 font-weight-medium">Confirma los datos</h6>
              </VCol>

              <VCol cols="12">
                <p><strong>Nombre:</strong> {{ formData.nombre }}</p>
                <p><strong>Teléfono:</strong> {{ formData.telefono }}</p>
                <p><strong>Correo:</strong> {{ formData.correo }}</p>
                <p><strong>Dirección:</strong> {{ formData.direccion }}</p>
              </VCol>
            </VRow>
          </VWindowItem>
        </VWindow>

        <!-- Botones -->
        <div class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8">
          <VBtn
            color="secondary"
            variant="tonal"
            :disabled="currentStep === 0"
            @click="currentStep--"
          >
            <VIcon icon="tabler-arrow-left" start class="flip-in-rtl" />
            Anterior
          </VBtn>

          <VBtn
            v-if="currentStep === steps.length - 1"
            color="success"
            @click="guardarProveedor"
          >
            Guardar
          </VBtn>

          <VBtn
            v-else
            color="primary"
            @click="currentStep++"
          >
            Siguiente
            <VIcon icon="tabler-arrow-right" end class="flip-in-rtl" />
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>
