// Simula los imports automáticos de Nuxt (por si algún componente los usa)
export const useRouter = () => ({
  push: vi.fn(),
})

export const useFetch = vi.fn(() => ({
  data: { value: null },
  error: { value: null },
}))

export const useRoute = () => ({ params: {} })
export const useHead = vi.fn()
