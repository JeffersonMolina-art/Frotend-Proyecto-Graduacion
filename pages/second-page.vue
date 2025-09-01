<script setup>
import { useAuthStore } from '@/stores/authStore'

import ProductosAlertaStock from '@/components/ProductosAlertaStock.vue'
import OrdenesDeCompra from '@/components/OrdenesDeCompra.vue'

const personaNombre = ref('')
const authStore = useAuthStore()

const cargarNombrePersona = async () => {
  if (!authStore.user?.persona_id || !authStore.token) return

  const { data, error } = await useFetch(`/personas/${authStore.user.persona_id}`, {
    baseURL: useRuntimeConfig().public.apiBase,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authStore.token}`,
    },
  })

  if (data.value) {
    const p = data.value
    personaNombre.value = `${p.primer_nombre ?? ''} ${p.segundo_nombre ?? ''} ${p.primer_apellido ?? ''} ${p.segundo_apellido ?? ''}`.trim()
  }
}


onMounted(() => {
  cargarNombrePersona()
})

definePageMeta({
  middleware: 'auth'
})
</script>

<template>
  <div>
    <VCard :title="`Bienvenido, ${personaNombre || 'Invitado'}`">
      <VCardText>
        Es un placer volver a verte.
      </VCardText>
    </VCard>

    <!-- Enviar los roles del usuario como prop -->
    <ProductosAlertaStock :roles="authStore.user?.roles || []" />

    <OrdenesDeCompra :roles="authStore.user?.roles || []" />
  </div>
</template>
