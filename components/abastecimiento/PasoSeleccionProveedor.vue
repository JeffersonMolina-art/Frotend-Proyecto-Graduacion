<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRuntimeConfig } from '#imports'

const props = defineProps({
  formData: { type: Object, required: true },
})

const emit = defineEmits(['update:formData', 'valid'])

const proveedores = ref([])
const proveedorSeleccionado = ref(null)
const loading = ref(false)

const config = useRuntimeConfig()
const authStore = useAuthStore()

const reglas = [
  v => (!!v && !!v.id) || 'Seleccione un proveedor',
]

// ---------- API ----------
const cargarProveedores = async () => {
  loading.value = true
  try {
    const { data, error } = await useFetch('/proveedores', {
      baseURL: config.public.apiBase,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })
    if (error.value) throw error.value

    proveedores.value = data.value ?? []

    // Si el padre ya traía proveedor preseleccionado, lo rehidratamos
    if (props.formData?.proveedor_id) {
      const ya = proveedores.value.find(p => p.id === props.formData.proveedor_id)
      if (ya) proveedorSeleccionado.value = ya
      emit('valid', !!ya)
    }
  } catch (e) {
    console.error('Error al cargar proveedores:', e)
  } finally {
    loading.value = false
  }
}

// ---------- MERGE + VALID ----------
watch(proveedorSeleccionado, (p) => {
  const patch = {
    proveedor: p ?? null,
    proveedor_id: p?.id ?? null,
    proveedor_nombre: p?.nombre ?? '',
    proveedor_correo: p?.correo ?? '',
    proveedor_telefono: p?.telefono ?? '',
    proveedor_direccion: p?.direccion ?? '',
  }
  // merge → nunca borra lo que ya existe
  emit('update:formData', { ...props.formData, ...patch })
  emit('valid', !!patch.proveedor_id)
})

// Exponer validar() para el wizard
function validar() {
  return !!(props.formData?.proveedor_id)
}
defineExpose({ validar })

onMounted(cargarProveedores)

// ---------- UI helpers ----------
const info = computed(() => proveedorSeleccionado.value || {})


watch(
  () => props.formData,
  (nuevo) => {
    console.log('📦 formData en PasoInformacionProducto:', nuevo)
  },
  { deep: true, immediate: true }
)
</script>

<template>
  <div>
    <h4 class="text-h6 mb-4">Seleccione un Proveedor</h4>

    <VAutocomplete
      v-model="proveedorSeleccionado"
      :items="proveedores"
      item-title="nombre"
      item-value="id"
      :loading="loading"
      label="Proveedor"
      variant="outlined"
      density="comfortable"
      return-object
      clearable
      :rules="reglas"
      persistent-hint
      hint="Busque por nombre y selecciónelo para continuar"
      prepend-inner-icon="tabler-building-store"
      class="mb-4"
    >
      <!-- Item de lista -->
      <template #item="{ props: itemProps, item }">
        <VListItem v-bind="itemProps">
          <VListItemSubtitle>
            <span v-if="item.raw.correo">{{ item.raw.correo }}</span>
            <span v-if="item.raw.telefono"> · {{ item.raw.telefono }}</span>
          </VListItemSubtitle>
        </VListItem>
      </template>

      <!-- Chip seleccionado (más limpio) -->
      <template #selection="{ item }">
        <VChip class="ma-1" variant="tonal" label>
          {{ item.raw.nombre }}
        </VChip>
      </template>
    </VAutocomplete>

    <!-- Tarjeta de detalle -->
    <VCard v-if="info.id" variant="tonal" class="mt-4">
      <VCardText class="py-4">
        <VRow>
          <VCol cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Nombre</div>
            <div class="text-body-1 font-weight-medium">{{ info.nombre }}</div>
          </VCol>
          <VCol cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Correo</div>
            <div class="text-body-1">{{ info.correo || 'N/A' }}</div>
          </VCol>
          <VCol cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Teléfono</div>
            <div class="text-body-1">{{ info.telefono || 'N/A' }}</div>
          </VCol>
          <VCol cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Dirección</div>
            <div class="text-body-1">{{ info.direccion || 'N/A' }}</div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.text-caption { letter-spacing: 0.3px; }
</style>
