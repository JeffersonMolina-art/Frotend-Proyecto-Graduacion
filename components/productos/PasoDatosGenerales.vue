<script setup>
import { ref, defineExpose } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  formData: Object, // recibe directamente el formData del padre
})

const valid = ref(true)
const formRef = ref(null)
const authStore = useAuthStore()
const config = useRuntimeConfig()

const categorias = ref([])
const proveedores = ref([])
const loading = ref(false)

const rules = {
  required: v => !!v || 'Campo obligatorio',
  minZero: v => v >= 0 || 'Debe ser mayor o igual a 0',
}

const cargarCategorias = async () => {
  loading.value = true
  try {
    const res = await useFetch('/categorias', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    categorias.value = Array.isArray(res.data.value) ? res.data.value : []
  } catch (e) {
    console.error('Error al cargar categorías', e)
  } finally {
    loading.value = false
  }
}

const cargarProveedores = async () => {
  try {
    const res = await useFetch('/proveedores', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    proveedores.value = Array.isArray(res.data.value) ? res.data.value : []
  } catch (e) {
    console.error('Error al cargar proveedores', e)
  }
}

onMounted(() => {
  cargarCategorias()
  cargarProveedores()
})

const validar = async () => {
  const result = await formRef.value?.validate?.()
  return result?.valid === true
}

defineExpose({
  validar,
})
</script>

<template>
  <v-form ref="formRef" v-model="valid">
    <v-row dense>
      <v-col cols="12" sm="6">
        <v-text-field
          label="Nombre del producto"
          v-model="formData.nombre"
          :rules="[rules.required]"
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          label="Código de barras"
          v-model="formData.codigo_barras"
          :rules="[rules.required]"
        />
      </v-col>

      <v-col cols="12">
        <v-textarea
          label="Descripción"
          v-model="formData.descripcion"
          auto-grow
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          label="Unidad de medida (ej. unidades, kg, litros)"
          v-model="formData.unidad_medida"
          :rules="[rules.required]"
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          label="Precio unitario"
          v-model="formData.precio_unitario"
          type="number"
          :rules="[rules.required, rules.minZero]"
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-select
          label="Categoría"
          v-model="formData.categoria_id"
          :items="categorias"
          item-title="nombre"
          item-value="id"
          :rules="[rules.required]"
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-autocomplete
          label="Proveedor"
          v-model="formData.proveedor_id"
          :items="proveedores"
          item-title="nombre"
          item-value="id"
          :rules="[rules.required]"
        />
      </v-col>
    </v-row>
  </v-form>
</template>
