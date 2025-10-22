import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Usuarios from '@/pages/usuarios.vue'

describe('usuarios.vue', () => {
  it('renderiza el título principal del módulo', () => {
    const wrapper = mount(Usuarios)
    expect(wrapper.text()).toMatch(/Usuarios/i)
  })

  it('muestra el botón para agregar usuario', () => {
    const wrapper = mount(Usuarios)
    expect(wrapper.text()).toMatch(/Agregar usuario/i)
  })

  it('abre el diálogo de formulario al presionar "Agregar usuario"', async () => {
    const wrapper = mount(Usuarios)
    await wrapper.vm.abrirCrear()
    expect(wrapper.vm.dlgForm).toBe(true)
  })

  it('ejecuta cargarUsuarios sin errores', async () => {
    const wrapper = mount(Usuarios)
    await wrapper.vm.cargarUsuarios()
    expect(Array.isArray(wrapper.vm.usuarios)).toBe(true)
  })

  it('abre el diálogo de confirmación al intentar eliminar', async () => {
    const wrapper = mount(Usuarios)
    const user = { id: 1, nombre_usuario: 'admin' }
    await wrapper.vm.confirmarEliminar(user)
    expect(wrapper.vm.dlgEliminar).toBe(true)
  })
})
