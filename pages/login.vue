<script setup>
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()


definePageMeta({
  layout: 'blank',
  middleware: 'redirect-if-authenticated',
  public: true
})



const form = ref({
  nombre_usuario: '',
  password: '',
  remember: false,
})

const isPasswordVisible = ref(false)
const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

const error = ref('')
const router = useRouter()


const handleLogin = async () => {
  error.value = ''

  const { data, error: fetchError } = await useFetch('/auth/login', {
    baseURL: useRuntimeConfig().public.apiBase,
    method: 'POST',
    body: {
      nombre_usuario: form.value.nombre_usuario,
      password: form.value.password
    }
  })

  if (fetchError.value) {
    error.value = 'Error al conectar con el servidor'
    return
  }

  if (data.value?.token) {
    authStore.login(data.value.token, data.value.user)
    router.push('/second-page')
  } else {
    error.value = 'Credenciales inválidas'
  }
}


</script>

<template>
  <a href="javascript:void(0)">
    <div class="auth-logo d-flex align-center gap-x-3">
      <h1 class="auth-title">
        Min y Max
      </h1>
    </div>
  </a>

  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 6.25rem;"
        >
          <VImg
            max-width="613"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <img
          class="auth-footer-mask flip-in-rtl"
          :src="authThemeMask"
          alt="auth-footer-mask"
          height="280"
          width="100"
        >
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-6"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Bienvenido a <span class="text-capitalize"> Variedades del Cid</span>! 👋🏻
          </h4>
          <p class="mb-0">
            Por favor, inicie sesión en su cuenta para continuar.
          </p>
        </VCardText>
        <VCardText>
          <VForm @submit.prevent="handleLogin">
            <VRow>
              <!-- Nombre de usuario -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.nombre_usuario"
                  autofocus
                  label="Nombre de usuario"
                  type="text"
                  placeholder="vdjefmolina"
                />
              </VCol>

              <!-- Contraseña -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  label="Contraseña"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between my-6">
                  <VCheckbox
                    v-model="form.remember"
                    label="Recuerdame"
                  />
                </div>

                <VBtn
                  block
                  type="submit"
                >
                  Iniciar sesión
                </VBtn>
                <p v-if="error" class="text-error mt-2 text-center">
                  {{ error }}
                </p>

              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
