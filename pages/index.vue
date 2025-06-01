<script setup>
const router = useRouter()

// Redirigir automáticamente a /login al cargar
router.push('/login')
</script>

<template>
  <!-- Puedes dejar un pequeño loading si quieres -->
  <div class="d-flex justify-center align-center" style="height: 100vh;">
    <span>Redirigiendo al login...</span>
  </div>
</template>
