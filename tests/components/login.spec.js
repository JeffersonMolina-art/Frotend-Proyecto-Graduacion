import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import Login from '@/pages/login.vue'

describe('login.vue', () => {
  it('renderiza el título principal del sistema', () => {
    const wrapper = mount(Login)
    expect(wrapper.text()).toMatch(/Min y Max/i)
  })

  it('renderiza el texto de bienvenida del formulario', () => {
    const wrapper = mount(Login)
    expect(wrapper.text()).toMatch(/Bienvenido a.*Variedades del Cid/i)
  })

  it('contiene un botón de iniciar sesión', () => {
    const wrapper = mount(Login)
    expect(wrapper.text()).toMatch(/Iniciar sesión/i)
  })

  it('ejecuta handleLogin correctamente y redirige', async () => {
    const mockPush = vi.fn()
    const routerSpy = vi.spyOn(global, 'useRouter').mockReturnValue({ push: mockPush })

    const fetchSpy = vi
      .spyOn(global, 'useFetch')
      .mockResolvedValueOnce({ data: { value: { token: '123', user: { nombre: 'Test' } } }, error: { value: null } })

    const wrapper = mount(Login)

    await wrapper.vm.handleLogin()

    expect(fetchSpy).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/second-page')

    routerSpy.mockRestore()
    fetchSpy.mockRestore()
  })
})
