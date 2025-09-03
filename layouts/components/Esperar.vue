<script setup>
import { useEsperar } from '@/composables/useEsperar'
const { visible } = useEsperar()
</script>

<template>
  <VDialog v-model="visible" persistent max-width="320" transition="fade-transition">
    <VCard
      class="pa-8 d-flex flex-column align-center justify-center"
      style="width:320px"
    >
      <VProgressCircular indeterminate size="70" color="primary" class="mb-6" />
      <span class="text-h6 font-weight-medium text-center text-no-wrap">
        Espera unos momentos…
      </span>
    </VCard>
  </VDialog>
</template>
