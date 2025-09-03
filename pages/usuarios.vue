<script setup> 
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const config = useRuntimeConfig()

// ========= tabla =========
const usuarios = ref([])
const roles = ref([])
const personas = ref([]) // usado en autocomplete
const puestos = ref([])
const loading = ref(true)

const headers = [
  { title: 'Usuario', value: 'nombre_usuario' },
  { title: 'Persona', value: 'personaNombre' },
  { title: 'Puesto',  value: 'puesto' },
  { title: 'Roles',   value: 'rolesList' },
  { title: 'Acciones', value: 'acciones', sortable: false },
]

// ========= dialogs =========
const dlgForm = ref(false)
const dlgEliminar = ref(false)
const usuarioAEliminar = ref(null)
const editando = ref(false)

// ========= wizard =========
const pasos = [
  { title: 'Persona', subtitle: 'Seleccionar persona' },
  { title: 'Datos usuario', subtitle: 'Usuario y contraseña' },
  { title: 'Rol', subtitle: 'Asignar rol' },
]
const currentStep = ref(0)
const stepValid = ref({ 0: false, 1: false, 2: false })
const puedeSiguiente = computed(() => stepValid.value[currentStep.value])
const puedeGuardar   = computed(() => Object.values(stepValid.value).every(Boolean))

// ========= form =========
const usuarioForm = ref({
  id: null,
  persona_id: null,
  nombre_usuario: '',
  password: '',
  puesto_id: null,
  role_id: null, // <- ahora un único rol
})

const showPassword = ref(false)

// ========= snackbar =========
const snackbar = ref(false)
const snackbarMsg = ref('')
const snackbarColor = ref('success')

// ========= helpers =========
const authHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.token}`,
  'Content-Type': 'application/json',
}))

// ========= cargar data =========
const cargarUsuarios = async () => {
  loading.value = true
  try {
    const { data, error } = await useFetch('/users', {
      baseURL: config.public.apiBase,
      headers: authHeaders.value,
    })
    if (error.value) throw error.value
    usuarios.value = (data.value || []).map(u => ({
      ...u,
      personaNombre: u.persona
        ? `${u.persona.primer_nombre} ${u.persona.primer_apellido}`
        : '—',
      rolesList: u.role_User?.map(r => r.role?.nombre).join(', ') || '—',
      puesto: u.puesto?.nombre || '—',
    }))
  } catch (e) {
    console.error('Error al cargar usuarios:', e)
  } finally {
    loading.value = false
  }
}

const cargarRoles = async () => {
  const { data } = await useFetch('/roles', {
    baseURL: config.public.apiBase,
    headers: authHeaders.value,
  })
  roles.value = data.value || []
}

const cargarPuestos = async () => {
  const { data } = await useFetch('/puestos', {
    baseURL: config.public.apiBase,
    headers: authHeaders.value,
  })
  puestos.value = data.value || []
}

const buscarPersonas = async (q) => {
  const { data } = await useFetch(`/personas?search=${q}`, {
    baseURL: config.public.apiBase,
    headers: authHeaders.value,
  })
  personas.value = (data.value || []).map(p => ({
    ...p,
    nombre_completo: `${p.primer_nombre ?? ''} ${p.primer_apellido ?? ''}`.trim(),
  }))
}

const obtenerPersonaPorId = async (id) => {
  if (!id) return
  try {
    const { data } = await useFetch(`/personas/${id}`, {
      baseURL: config.public.apiBase,
      headers: authHeaders.value,
    })
    if (data.value) {
      const p = data.value
      personas.value = [{
        ...p,
        nombre_completo: `${p.primer_nombre ?? ''} ${p.primer_apellido ?? ''}`.trim(),
      }]
    }
  } catch (e) {
    console.error('Error al obtener persona:', e)
  }
}

// ========= acciones UI =========
const formKey = ref(0)
const bumpFormKey = () => { formKey.value++ }

const resetForm = () => {
  usuarioForm.value = {
    id: null,
    persona_id: null,
    nombre_usuario: '',
    password: '',
    puesto_id: null,
    role_id: null,
  }
  currentStep.value = 0
  stepValid.value = { 0: false, 1: false, 2: false }
  showPassword.value = false
}

const abrirCrear = () => {
  editando.value = false
  resetForm()
  personas.value = []
  bumpFormKey()
  dlgForm.value = true
}

const abrirEditar = async (u) => {
  editando.value = true
  resetForm()
  personas.value = []
  await obtenerPersonaPorId(u.persona_id)
  usuarioForm.value = {
    id: u.id,
    persona_id: u.persona_id,
    nombre_usuario: u.nombre_usuario,
    password: '',
    puesto_id: u.puesto_id,
    role_id: u.role_User?.[0]?.role?.id || null, // <- primer rol si existe
  }
  currentStep.value = 0
  bumpFormKey()
  dlgForm.value = true
}

const confirmarEliminar = (u) => { usuarioAEliminar.value = u; dlgEliminar.value = true }
const siguiente = () => { if (puedeSiguiente.value) currentStep.value++ }
const anterior = () => { if (currentStep.value > 0) currentStep.value-- }
const cerrarForm = () => { dlgForm.value = false; resetForm(); personas.value = []; bumpFormKey() }

// ========= CRUD =========
const guardar = async () => {
  try {
    const metodo = editando.value ? 'PUT' : 'POST'
    const endpoint = editando.value ? `/users/${usuarioForm.value.id}` : '/auth/register'

    // preparar body con solo los campos que tu backend acepta
    const { persona_id, nombre_usuario, password, puesto_id, role_id } = usuarioForm.value
    const body = { persona_id, nombre_usuario, puesto_id }
    if (!editando.value) body.password = password
    else if (password) body.password = password

    const { data, error } = await useFetch(endpoint, {
      baseURL: config.public.apiBase,
      method: metodo,
      headers: authHeaders.value,
      body: JSON.stringify(body),
    })
    if (error.value) throw error.value

    const userId = editando.value ? usuarioForm.value.id : data.value?.id

    // asignar rol único
    if (role_id && userId) {
      await useFetch(`/users/${userId}/roles`, {
        baseURL: config.public.apiBase,
        method: editando.value ? 'PUT' : 'POST',
        headers: authHeaders.value,
        body: JSON.stringify({ user_id: userId, role_id }),
      })
    }

    snackbarMsg.value = 'Usuario guardado correctamente'
    snackbarColor.value = 'success'
    snackbar.value = true
    cerrarForm()
    await cargarUsuarios()
  } catch (e) {
    snackbarMsg.value = 'Error al guardar usuario'
    snackbarColor.value = 'error'
    snackbar.value = true
    console.error('Error al guardar usuario:', e)
  }
}

const eliminarUsuario = async () => {
  try {
    const { error } = await useFetch(`/users/${usuarioAEliminar.value.id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: authHeaders.value,
    })
    if (error.value) throw error.value
    dlgEliminar.value = false
    await cargarUsuarios()
    snackbarMsg.value = 'Usuario eliminado correctamente'
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (e) {
    snackbarMsg.value = 'Error al eliminar usuario'
    snackbarColor.value = 'error'
    snackbar.value = true
    console.error('Error al eliminar usuario:', e)
  }
}

// ========= validaciones =========
watch(() => usuarioForm.value.persona_id, v => stepValid.value[0] = !!v)
watch(
  () => [usuarioForm.value.nombre_usuario, usuarioForm.value.password, usuarioForm.value.puesto_id, editando.value],
  ([usuario, pass, puesto, edit]) => {
    stepValid.value[1] = !!usuario && !!puesto && (edit ? true : !!pass)
  },
  { immediate: true }
)
watch(() => usuarioForm.value.role_id, r => stepValid.value[2] = !!r)

// ========= inicial =========
watch(() => authStore.token, async (t) => {
  if (!t) return
  await Promise.all([cargarUsuarios(), cargarRoles(), cargarPuestos()])
}, { immediate: true })
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center">
      <span>Usuarios</span>
      <VBtn color="primary" @click="abrirCrear">
        <VIcon start icon="tabler-user-plus" /> Agregar usuario
      </VBtn>
    </VCardTitle>

    <VDataTable
      :headers="headers"
      :items="usuarios"
      :loading="loading"
      loading-text="Cargando usuarios…"
      items-per-page="10"
      class="pa-2"
    >
      <template #item.acciones="{ item }">
        <div class="d-flex gap-1">
          <VBtn size="small" variant="text" color="primary" @click="abrirEditar(item)">
            <VIcon size="18" icon="tabler-edit" />
          </VBtn>
          <VBtn size="small" variant="text" color="error" @click="confirmarEliminar(item)">
            <VIcon size="18" icon="tabler-trash" />
          </VBtn>
        </div>
      </template>
    </VDataTable>
  </VCard>

  <!-- Form Wizard -->
  <VDialog v-model="dlgForm" max-width="860" persistent :key="formKey">
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span>{{ editando ? 'Editar usuario' : 'Registrar usuario' }}</span>
        <VBtn icon variant="text" @click="cerrarForm"><VIcon icon="tabler-x" /></VBtn>
      </VCardTitle>
      <VCardText>
        <AppStepper v-model:current-step="currentStep" :items="pasos" class="mb-4" />
        <VWindow v-model="currentStep" class="disable-tab-transition" :key="formKey">
          <!-- Paso 1 -->
          <VWindowItem>
            <VAutocomplete
              v-model="usuarioForm.persona_id"
              :items="personas"
              item-title="nombre_completo"
              item-value="id"
              label="Buscar persona"
              clearable
              @update:search="buscarPersonas"
            />
          </VWindowItem>

          <!-- Paso 2 -->
          <VWindowItem>
            <VRow>
              <VCol cols="12" md="6">
                <VTextField v-model="usuarioForm.nombre_usuario" label="Nombre de usuario" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="usuarioForm.password"
                  label="Contraseña"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="showPassword = !showPassword"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="usuarioForm.puesto_id"
                  :items="puestos"
                  item-title="nombre"
                  item-value="id"
                  label="Puesto"
                  clearable
                />
              </VCol>
            </VRow>
          </VWindowItem>

          <!-- Paso 3 -->
          <VWindowItem>
            <VSelect
              v-model="usuarioForm.role_id"
              :items="roles"
              item-title="nombre"
              item-value="id"
              label="Rol"
              clearable
            />
          </VWindowItem>
        </VWindow>

        <div class="d-flex justify-space-between mt-6">
          <VBtn color="secondary" variant="tonal" :disabled="currentStep===0" @click="anterior">
            <VIcon start icon="tabler-arrow-left" /> Anterior
          </VBtn>

          <template v-if="currentStep < pasos.length - 1">
            <VBtn color="primary" :disabled="!puedeSiguiente" @click="siguiente">
              Siguiente <VIcon end icon="tabler-arrow-right" />
            </VBtn>
          </template>
          <template v-else>
            <VBtn color="success" :disabled="!puedeGuardar" @click="guardar">
              <VIcon start icon="tabler-check" /> Guardar
            </VBtn>
          </template>
        </div>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Eliminar -->
  <VDialog v-model="dlgEliminar" max-width="420">
    <VCard>
      <VCardTitle class="text-h6">Eliminar usuario</VCardTitle>
      <VCardText>
        ¿Seguro que deseas eliminar a <strong>{{ usuarioAEliminar?.nombre_usuario }}</strong>?
      </VCardText>
      <VCardActions class="justify-end">
        <VBtn variant="text" @click="dlgEliminar=false">Cancelar</VBtn>
        <VBtn color="error" @click="eliminarUsuario" prepend-icon="tabler-trash">Eliminar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Snackbar -->
  <VSnackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
    {{ snackbarMsg }}
  </VSnackbar>
</template>
