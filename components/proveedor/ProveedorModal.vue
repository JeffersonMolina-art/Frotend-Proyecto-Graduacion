<template>
  <v-dialog v-model="mostrarInterno" persistent max-width="600px">
    <v-card>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span class="text-h6">{{ editando ? 'Editar' : 'Agregar' }} Proveedor</span>
        <VBtn icon @click="cerrarModal"><VIcon>tabler-x</VIcon></VBtn>
      </VCardTitle>
      <v-card-text>
        <ProveedorFormulario
          :proveedor="proveedor"
          :editando="editando"
          @guardar="guardarProveedor"
          @cerrar="cerrarModal"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import ProveedorFormulario from './ProveedorFormulario.vue'

const props = defineProps({
  mostrar: Boolean,
  proveedor: Object,
  editando: Boolean,
})


const emit = defineEmits(['cerrar', 'guardado'])

const mostrarInterno = ref(false)

watch(
  () => props.mostrar,
  (nuevo) => (mostrarInterno.value = nuevo)
)

function cerrarModal() {
  emit('cerrar')
}

async function guardarProveedor(datos) {
  try {
    emit('guardado')
  } catch (error) {
    console.error('Error al guardar proveedor', error)
  }
}
</script>
