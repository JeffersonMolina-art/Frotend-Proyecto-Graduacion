<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  proveedor: {
    type: Object,
    required: true,
  },
})

const isEditarProveedorDialogVisible = ref(false)
</script>

<template>
  <VRow>
    <!-- Vista del Proveedor -->
    <VCol cols="12">
      <VCard v-if="proveedor">
        <VCardText class="text-center pt-12">
          <!-- Avatar genérico con iniciales -->
          <VAvatar
            rounded
            :size="100"
            color="primary"
            variant="tonal"
          >
            <span class="text-4xl font-weight-medium">
              {{ proveedor.nombre?.substring(0, 2).toUpperCase() || 'PR' }}
            </span>
          </VAvatar>

          <!-- Nombre -->
          <h5 class="text-h5 mt-4">
            {{ proveedor.nombre }}
          </h5>

          <!-- Estado -->
          <VChip
            label
            :color="proveedor.estado === 'Activo' ? 'success' : 'success'"
            class="mt-2"
            size="small"
          >
            {{ proveedor.estado }}
          </VChip>
        </VCardText>

        <!-- Detalles -->
        <VCardText>
          <h5 class="text-h5 mb-2">Detalles</h5>
          <VDivider class="my-3" />

          <VList class="card-list mt-2">
            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">Correo:</h6>
                <span class="text-body-1">{{ proveedor.correo || 'No registrado' }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">Teléfono:</h6>
                <span class="text-body-1">{{ proveedor.telefono || 'No registrado' }}</span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">Dirección:</h6>
                <span class="text-body-1">{{ proveedor.direccion || 'No registrada' }}</span>
              </VListItemTitle>
            </VListItem>

          </VList>
        </VCardText>

        <!-- Botón de Editar -->
        <VCardText class="d-flex justify-center">
          <VBtn
            color="primary"
            variant="elevated"
            @click="isEditarProveedorDialogVisible = true"
          >
            Editar
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Modal para editar -->
  <ProveedorModal
    v-if="isEditarProveedorDialogVisible"
    v-model:visible="isEditarProveedorDialogVisible"
    :editando="true"
    :proveedor="proveedor"
  />
</template>

<style scoped>
.card-list {
  --v-card-list-gap: 0.5rem;
}
</style>
