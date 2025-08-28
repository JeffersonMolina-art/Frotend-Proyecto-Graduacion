<template>
  <v-data-table
    :headers="headers"
    :items="proveedores"
    class="elevation-1"
    :items-per-page="5"
  >
    <template #item.created_at="{ item }">
      {{ formatearFecha(item.created_at) }}
    </template>
  </v-data-table>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  proveedores: {
    type: Array,
    required: true
  }
})

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Nombre', value: 'nombre' },
  { text: 'Descripción', value: 'descripcion' },
  { text: 'Fecha Registro', value: 'created_at' }
]

function formatearFecha(fecha) {
  if (!fecha) return ''
  const date = new Date(fecha)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}
</script>
