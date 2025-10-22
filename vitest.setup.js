import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'

global.ref = ref
global.reactive = reactive
global.computed = computed
global.watch = watch
global.onMounted = onMounted
global.onBeforeUnmount = onBeforeUnmount

beforeAll(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
})

global.definePageMeta = vi.fn(() => ({}))
global.useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}))
global.useRoute = vi.fn(() => ({
  path: '/',
  params: {},
  query: {},
}))
global.useFetch = vi.fn(async () => ({
  data: { value: null },
  error: { value: null },
}))
global.useRuntimeConfig = vi.fn(() => ({
  public: { apiBase: 'http://localhost:3000/api' },
}))

vi.mock('.*\\.(png|jpg|jpeg|svg|gif|webp)$', () => ({
  default: 'mock-image.png',
}))
vi.mock('.*\\.(css|scss|sass)$', () => ({}))
vi.mock('@core/composable/useGenerateImageVariant', () => ({
  useGenerateImageVariant: vi.fn(() => 'mocked-image'),
}))
vi.mock('@layouts/components/VNodeRenderer', () => ({
  VNodeRenderer: {},
}))
vi.mock('#app', () => ({
  useCookie: vi.fn(() => ({
    value: '',
  })),
  useRuntimeConfig: vi.fn(() => ({
    public: { apiBase: 'http://localhost:3000/api' },
  })),
  navigateTo: vi.fn(),
}))

config.global.stubs = {
  VImg: { template: '<img />' },
  VBtn: { template: '<button><slot /></button>' },
  VCard: { template: '<div><slot /></div>' },
  VCardText: { template: '<div><slot /></div>' },
  VCol: { template: '<div><slot /></div>' },
  VRow: { template: '<div><slot /></div>' },
  VCheckbox: { template: '<input type="checkbox" />' },
  VForm: { template: '<form><slot /></form>' },
  AppTextField: { template: '<input />' },
}

global.useFetch = vi.fn(async (url, options) => {
  if (url.includes('/personas') && (!options || options.method === 'GET')) {
    return {
      data: { value: [{ id: 1, primer_nombre: 'Ana', primer_apellido: 'López' }] },
      error: { value: null },
    }
  }
  if (url.includes('/departamentosDireccion')) {
    return {
      data: { value: [{ id: 1, nombre: 'Guatemala' }] },
      error: { value: null },
    }
  }
  if (url.includes('/municipio')) {
    return {
      data: { value: [{ id: 1, nombre: 'Mixco', departamento_id: 1 }] },
      error: { value: null },
    }
  }
  if (url.includes('/personas') && options?.method === 'POST') {
    return { data: { value: { id: 2 } }, error: { value: null } }
  }
  if (url.includes('/personas') && options?.method === 'DELETE') {
    return { data: { value: true }, error: { value: null } }
  }
  return {
    data: { value: [] },
    error: { value: null },
  }
})

config.global.stubs = {
  ...config.global.stubs,
  VDataTable: { template: '<table><slot /></table>' },
  VDialog: { template: '<div><slot /></div>' },
  VIcon: { template: '<i></i>' },
  VTextField: { template: '<input />' },
  VSelect: { template: '<select><slot /></select>' },
  VWindow: { template: '<div><slot /></div>' },
  VWindowItem: { template: '<div><slot /></div>' },
  VTable: { template: '<table><slot /></table>' },
  VAlert: { template: '<div><slot /></div>' },
  AppStepper: { template: '<div><slot /></div>' },
  VCardTitle: { template: '<div><slot /></div>' },
  VCardActions: { template: '<div><slot /></div>' },
  VAutocomplete: { template: '<input />' },
  VSnackbar: { template: '<div><slot /></div>' },
}
