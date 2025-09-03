<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const config = useRuntimeConfig()

// ========= tabla =========
const clientes = ref([])
const loading = ref(true)
const filtro = ref('')

const headers = [ 
  { title: 'Nombre completo', value: 'nombreCompleto' },
  { title: 'Teléfono',        value: 'telefono' },
  { title: 'Correo',          value: 'correo_personal' },
  { title: 'Departamento',    value: 'departamento.nombre' },
  { title: 'Municipio',       value: 'municipio.nombre' },
  { title: 'Acciones',        value: 'acciones', sortable: false },
]

// ========= catálogos =========
const departamentos = ref([])
const municipios = ref([])
const municipiosDepto = computed(() =>
  municipios.value.filter(m => m.departamento_id === (clienteForm.value.departamento_id || null))
)

// ========= dialogs / ui =========
const dlgForm = ref(false)
const dlgEliminar = ref(false)
const dlgVer = ref(false)
const clienteAEliminar = ref(null)
const clienteVer = ref(null)
const editando = ref(false)

// ========= wizard =========
const pasos = [
  { title: 'Nombres',  subtitle: 'Datos personales' },
  { title: 'Ubicación y contacto', subtitle: 'Departamento, municipio y contacto' },
  { title: 'Confirmación', subtitle: 'Revisa y guarda' },
]
const currentStep = ref(0)
const stepValid = ref({ 0: false, 1: false, 2: true })
const puedeSiguiente = computed(() => stepValid.value[currentStep.value])
const puedeGuardar   = computed(() => Object.values(stepValid.value).every(Boolean))

// ========= form =========
const clienteForm = ref({
  id: null,
  primer_nombre: '',
  segundo_nombre: '',
  tercer_nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  apellido_casada: '',
  departamento_id: null,
  municipio_id: null,
  telefono: '',
  correo_personal: '',
  direccion: '',
})

const nombreCompleto = (c) => {
  return [
    c.primer_nombre,
    c.segundo_nombre,
    c.tercer_nombre,
    c.primer_apellido,
    c.segundo_apellido,
    c.apellido_casada ? `(de ${c.apellido_casada})` : null,
  ].filter(Boolean).join(' ')
}

// ========= API base =========
const authHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.token}`,
  'Content-Type': 'application/json',
}))

const cargarClientes = async () => {
  loading.value = true
  try {
    const { data, error } = await useFetch('/personas', {
      baseURL: config.public.apiBase,
      headers: authHeaders.value,
    })
    if (error.value) throw error.value
    const arr = Array.isArray(data.value) ? data.value : []
    clientes.value = arr.map(c => ({ ...c, nombreCompleto: nombreCompleto(c) }))
  } catch (e) {
    console.error('Error al cargar personas:', e)
  } finally {
    loading.value = false
  }
}

const cargarDepartamentos = async () => {
  const { data } = await useFetch('/departamentosDireccion', {
    baseURL: config.public.apiBase,
    headers: authHeaders.value,
  })
  departamentos.value = data.value || []
}
const cargarMunicipios = async () => {
  const { data } = await useFetch('/municipio', {
    baseURL: config.public.apiBase,
    headers: authHeaders.value,
  })
  municipios.value = data.value || []
}

watch(
  () => authStore.token,
  async (t) => {
    if (!t) return
    await Promise.all([cargarDepartamentos(), cargarMunicipios(), cargarClientes()])
  },
  { immediate: true }
)

// ========= filtros =========
const clientesFiltrados = computed(() => {
  const q = (filtro.value || '').toLowerCase().trim()
  if (!q) return clientes.value
  return clientes.value.filter(c =>
    nombreCompleto(c).toLowerCase().includes(q) ||
    (c.telefono || '').toLowerCase().includes(q) ||
    (c.correo_personal || '').toLowerCase().includes(q)
  )
})

// ========= validar pasos =========
const validarPaso = () => {
  if (currentStep.value === 0) {
    stepValid.value[0] = !!(clienteForm.value.primer_nombre && clienteForm.value.primer_apellido)
  }
  if (currentStep.value === 1) {
    const okUbic = !!(clienteForm.value.departamento_id && clienteForm.value.municipio_id)
    const okContacto = !!(clienteForm.value.telefono || clienteForm.value.correo_personal)
    stepValid.value[1] = okUbic && okContacto
  }
}
watch(
  () => ({ ...clienteForm.value, step: currentStep.value }),
  validarPaso,
  { deep: true, immediate: true }
)

// ========= acciones UI =========
const resetForm = () => {
  clienteForm.value = {
    id: null,
    primer_nombre: '',
    segundo_nombre: '',
    tercer_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    apellido_casada: '',
    departamento_id: null,
    municipio_id: null,
    telefono: '',
    correo_personal: '',
    direccion: '',
  }
  currentStep.value = 0
  stepValid.value = { 0: false, 1: false, 2: true }
}

const abrirCrear = () => {
  resetForm()
  editando.value = false
  dlgForm.value = true
}
const abrirEditar = (c) => {
  editando.value = true
  clienteForm.value = {
    id: c.id,
    primer_nombre: c.primer_nombre || '',
    segundo_nombre: c.segundo_nombre || '',
    tercer_nombre: c.tercer_nombre || '',
    primer_apellido: c.primer_apellido || '',
    segundo_apellido: c.segundo_apellido || '',
    apellido_casada: c.apellido_casada || '',
    departamento_id: c.departamento_id || null,
    municipio_id: c.municipio_id || null,
    telefono: c.telefono || '',
    correo_personal: c.correo_personal || '',
    direccion: c.direccion || '',
  }
  currentStep.value = 0
  dlgForm.value = true
}
const abrirVer = (c) => { clienteVer.value = c; dlgVer.value = true }
const confirmarEliminar = (c) => { clienteAEliminar.value = c; dlgEliminar.value = true }

const siguiente = () => { if (puedeSiguiente.value) currentStep.value++ }
const anterior = () => { if (currentStep.value > 0) currentStep.value-- }

const cerrarForm = () => {
  dlgForm.value = false
  resetForm()
}

// ========= CRUD =========
const guardar = async () => {
  const metodo = editando.value ? 'PUT' : 'POST'
  const endpoint = editando.value ? `/personas/${clienteForm.value.id}` : '/personas'
  try {
    const { error } = await useFetch(endpoint, {
      baseURL: config.public.apiBase,
      method: metodo,
      headers: authHeaders.value,
      body: JSON.stringify(clienteForm.value),
    })
    if (error.value) throw error.value
    cerrarForm()
    await cargarClientes()
  } catch (e) {
    console.error('Error al guardar persona:', e)
  }
}

const eliminarCliente = async () => {
  try {
    const { error } = await useFetch(`/personas/${clienteAEliminar.value.id}`, {
      baseURL: useRuntimeConfig().public.apiBase,
      method: 'DELETE',
      headers: authHeaders.value,
    })
    if (error.value) throw error.value
    dlgEliminar.value = false
    await cargarClientes()
  } catch (e) {
    console.error('Error al eliminar persona:', e)
  }
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center">
      <span>Personas</span>
      <VBtn color="primary" @click="abrirCrear">
        <VIcon start icon="tabler-user-plus" /> Agregar persona
      </VBtn>
    </VCardTitle>

    <VCardText class="d-flex gap-4 align-center">
      <VTextField
        v-model="filtro"
        label="Buscar (nombre, teléfono, correo)"
        density="compact"
        prepend-inner-icon="tabler-search"
        clearable
        class="flex-grow-1"
      />
      <VBtn variant="text" @click="cargarClientes" prepend-icon="tabler-refresh">Actualizar</VBtn>
    </VCardText>

    <VDataTable
      :headers="headers"
      :items="clientesFiltrados"
      :loading="loading"
      loading-text="Cargando personas…"
      items-per-page="10"
      class="pa-2"
    >
      <template #item.nombreCompleto="{ item }">
        {{ nombreCompleto(item) }}
      </template>

        <!-- Departamento -->
        <template #item.departamento="{ item }">
          {{ item.departamento?.nombre || '—' }}
        </template>

        <!-- Municipio -->
        <template #item.municipio="{ item }">
          {{ item.municipio?.nombre || '—' }}
        </template>

      <template #item.acciones="{ item }">
        <div class="d-flex gap-1">
          <VBtn size="small" variant="text" color="info" @click="abrirVer(item)">
            <VIcon size="18" icon="tabler-eye" />
          </VBtn>
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

  <!-- Ver -->
  <VDialog v-model="dlgVer" max-width="620">
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span>Detalle de la persona</span>
        <VBtn icon variant="text" @click="dlgVer=false"><VIcon icon="tabler-x" /></VBtn>
      </VCardTitle>
      <VCardText>
        <VTable density="comfortable">
          <tbody>
            <tr><th class="text-left" scope="row">Nombre completo</th><td>{{ nombreCompleto(clienteVer || {}) }}</td></tr>
            <tr><th class="text-left" scope="row">Teléfono</th><td>{{ clienteVer?.telefono || '—' }}</td></tr>
            <tr><th class="text-left" scope="row">Correo</th><td>{{ clienteVer?.correo_personal || '—' }}</td></tr>
            <tr><th class="text-left" scope="row">Departamento</th><td>{{ clienteVer?.departamento?.nombre || '—' }}</td></tr>
            <tr><th class="text-left" scope="row">Municipio</th><td>{{ clienteVer?.municipio?.nombre || '—' }}</td></tr>
            <tr><th class="text-left" scope="row">Dirección</th><td>{{ clienteVer?.direccion || '—' }}</td></tr>
          </tbody>
        </VTable>
      </VCardText>
      <VCardActions class="justify-end"><VBtn @click="dlgVer=false">Cerrar</VBtn></VCardActions>
    </VCard>
  </VDialog>

  <!-- Form (Wizard) -->
  <VDialog v-model="dlgForm" max-width="860" persistent>
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span>{{ editando ? 'Editar persona' : 'Agregar persona' }}</span>
        <VBtn icon variant="text" @click="cerrarForm"><VIcon icon="tabler-x" /></VBtn>
      </VCardTitle>
      <VCardText>
        <AppStepper v-model:current-step="currentStep" :items="pasos" class="mb-4 stepper-icon-step-bg" />
        <VWindow v-model="currentStep" class="disable-tab-transition">
          <!-- Paso 0 -->
          <VWindowItem>
            <VRow>
              <VCol cols="12" md="4"><VTextField v-model="clienteForm.primer_nombre"   label="Primer nombre *" /></VCol>
              <VCol cols="12" md="4"><VTextField v-model="clienteForm.segundo_nombre"  label="Segundo nombre" /></VCol>
              <VCol cols="12" md="4"><VTextField v-model="clienteForm.tercer_nombre"   label="Tercer nombre" /></VCol>

              <VCol cols="12" md="4"><VTextField v-model="clienteForm.primer_apellido"  label="Primer apellido *" /></VCol>
              <VCol cols="12" md="4"><VTextField v-model="clienteForm.segundo_apellido" label="Segundo apellido" /></VCol>
              <VCol cols="12" md="4"><VTextField v-model="clienteForm.apellido_casada"  label="Apellido de casada" /></VCol>
            </VRow>
            <small class="text-medium-emphasis">* Campos obligatorios</small>
          </VWindowItem>

          <!-- Paso 1 -->
          <VWindowItem>
            <VRow>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="clienteForm.departamento_id"
                  :items="departamentos"
                  item-title="nombre"
                  item-value="id"
                  label="Departamento *"
                  clearable
                />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="clienteForm.municipio_id"
                  :items="municipiosDepto"
                  item-title="nombre"
                  item-value="id"
                  label="Municipio *"
                  clearable
                />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="clienteForm.telefono" label="Teléfono" />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField v-model="clienteForm.correo_personal" label="Correo personal" type="email" />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="clienteForm.direccion" label="Dirección" />
              </VCol>
            </VRow>
            <small class="text-medium-emphasis">* Departamento y municipio obligatorios. También necesitas teléfono o correo.</small>
          </VWindowItem>

          <!-- Paso 2 -->
          <VWindowItem>
            <VAlert type="info" variant="tonal" border="start" class="mb-4">
              Verifica los datos antes de guardar.
            </VAlert>
            <VTable density="comfortable">
              <tbody>
                <tr><th class="text-left" scope="row">Nombre completo</th><td>{{ nombreCompleto(clienteForm) }}</td></tr>
                <tr><th class="text-left" scope="row">Departamento</th><td>{{ departamentos.find(d=>d.id===clienteForm.departamento_id)?.nombre || '—' }}</td></tr>
                <tr><th class="text-left" scope="row">Municipio</th><td>{{ municipios.find(m=>m.id===clienteForm.municipio_id)?.nombre || '—' }}</td></tr>
                <tr><th class="text-left" scope="row">Teléfono</th><td>{{ clienteForm.telefono || '—' }}</td></tr>
                <tr><th class="text-left" scope="row">Correo</th><td>{{ clienteForm.correo_personal || '—' }}</td></tr>
                <tr><th class="text-left" scope="row">Dirección</th><td>{{ clienteForm.direccion || '—' }}</td></tr>
              </tbody>
            </VTable>
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
      <VCardTitle class="text-h6">Eliminar persona</VCardTitle>
      <VCardText>
        ¿Seguro que deseas eliminar a <strong>{{ nombreCompleto(clienteAEliminar || {}) }}</strong>?
      </VCardText>
      <VCardActions class="justify-end">
        <VBtn variant="text" @click="dlgEliminar=false">Cancelar</VBtn>
        <VBtn color="error" @click="eliminarCliente" prepend-icon="tabler-trash">Eliminar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
