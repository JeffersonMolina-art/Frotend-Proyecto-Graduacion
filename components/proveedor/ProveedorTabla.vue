<template>
  <v-data-table
    :headers="headers"
    :items="proveedores"
    loading-text="Cargando proveedores…"
    :items-per-page="5"
    item-value="id"
    class="pa-4"
    show-headers
  >
    <!-- Formatear fecha -->
    <template #item.created_at="{ item }">
      {{ formatearFecha(item.created_at) }}
    </template>

    <!-- Acciones -->
    <template #item.acciones="{ item }">
      <v-btn icon variant="text" color="info" @click="verProveedor(item)">
        <v-icon>tabler-eye</v-icon>
      </v-btn>

      <v-btn icon variant="text" color="primary" @click="$emit('editar', item)">
        <v-icon>tabler-edit</v-icon>
      </v-btn>
      <v-btn icon variant="text" color="error" @click="$emit('eliminar', item)">
        <v-icon>tabler-trash</v-icon>
      </v-btn>
    </template>
  </v-data-table>
  <v-dialog v-model="verDialogo" max-width="600px" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Detalle del proveedor</span>
        <v-btn icon @click="verDialogo = false">
          <v-icon>tabler-x</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <ProveedorVista :proveedor="proveedorSeleccionado" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue'

import ProveedorVista from './ProveedorVista.vue'




const proveedorSeleccionado = ref(null)
const verDialogo = ref(false)

const props = defineProps({
  proveedores: {
    type: Array,
    required: true
  }
})

const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Nombre', value: 'nombre' },
  { title: 'Correo', value: 'correo' },
  { title: 'Fecha Registro', value: 'created_at' },
  { title: 'Acciones', value: 'acciones', sortable: false }
]


function formatearFecha(fecha) {
  if (!fecha) return ''
  const date = new Date(fecha)
  return `${date.getDate().toString().padStart(2, '0')}/${
    (date.getMonth() + 1).toString().padStart(2, '0')
  }/${date.getFullYear()}`
}

function verProveedor(item) {
  proveedorSeleccionado.value = item
  verDialogo.value = true
}

</script>
