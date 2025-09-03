<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title class="text-h6 font-weight-bold mb-4">
      Historial de Configuración por Producto
    </v-card-title>

    <v-autocomplete
      v-model="productoSeleccionado"
      :items="productos"
      item-title="nombre"
      item-value="id"
      label="Buscar producto por nombre"
      :loading="loadingProductos"
      hide-no-data
      hide-details
      clearable
      @update:search="buscarProductos"
      class="mb-6"
      density="compact"
    />

    <v-divider v-if="historial.length" class="mb-4" />

    <v-data-table
      v-if="historial.length"
      :headers="headers"
      :items="historial"
      :items-per-page="5"
      class="elevation-1"
      density="comfortable"
    >
      <template #item.fecha="{ item }">
        {{ formatearFecha(item.fecha) }}
      </template>

      <template #item.stock_minimo="{ item }">
        {{ item.stock_minimo_anterior }} → <strong>{{ item.stock_minimo_nuevo }}</strong>
      </template>

      <template #item.stock_maximo="{ item }">
        {{ item.stock_maximo_anterior }} → <strong>{{ item.stock_maximo_nuevo }}</strong>
      </template>

      <template #item.usuario="{ item }">
        {{ item.usuario?.nombre || 'N/A' }}
      </template>
    </v-data-table>

    <div v-else-if="productoSeleccionado && !loadingHistorial" class="text-center text-medium-emphasis mt-4">
      No hay historial de configuración para este producto.
    </div>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const productos = ref([])
const historial = ref([])
const productoSeleccionado = ref(null)
const loadingProductos = ref(false)
const loadingHistorial = ref(false)

const snackbar = ref(false)
const snackbarMsg = ref('')
const snackbarColor = ref('success')

const authStore = useAuthStore()

const headers = [
  { title: 'Producto', value: 'producto.nombre' },
  { title: 'Stock Mínimo', value: 'stock_minimo' },
  { title: 'Stock Máximo', value: 'stock_maximo' },
  { title: 'Motivo', value: 'motivo' },
  { title: 'Fecha', value: 'fecha' },
  { title: 'Usuario', value: 'usuario' },
]

const mostrarError = (mensaje) => {
  snackbarColor.value = 'error'
  snackbarMsg.value = mensaje
  snackbar.value = true
}

const buscarProductos = async (nombre) => {
  if (!nombre || nombre.length < 2) {
    productos.value = []
    return
  }

  try {
    loadingProductos.value = true

    const response = await fetch(`${useRuntimeConfig().public.apiBase}/productos?search=${nombre}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    productos.value = data
  } catch (err) {
    mostrarError('Error al buscar productos')
  } finally {
    loadingProductos.value = false
  }
}

watch(productoSeleccionado, async (productoId) => {
  if (!productoId) {
    historial.value = []
    return
  }

  try {
    loadingHistorial.value = true

    const response = await fetch(`${useRuntimeConfig().public.apiBase}/historialConfiguracionProducto/${productoId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    // 🔹 Filtrar solo los registros que coincidan con el producto seleccionado
    historial.value = data.filter(h => h.producto_id === productoId)

  } catch (err) {
    mostrarError('Error al obtener historial de configuración')
  } finally {
    loadingHistorial.value = false
  }
})

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
