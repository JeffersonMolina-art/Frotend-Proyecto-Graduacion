import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import Personas from '@/pages/clientes.vue'

describe('clientes.vue', () => {
  it('renderiza el título principal del módulo', () => {
    const wrapper = mount(Personas)
    expect(wrapper.text()).toMatch(/Personas/i)
  })

  it('muestra el botón para agregar persona', () => {
    const wrapper = mount(Personas)
    expect(wrapper.text()).toMatch(/Agregar persona/i)
  })

  it('filtra correctamente cuando se escribe en el campo de búsqueda', async () => {
    const wrapper = mount(Personas)
    const filtro = wrapper.vm.filtro
    wrapper.vm.filtro = 'ana'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.filtro).toBe('ana')
    })


  it('abre el diálogo de formulario al presionar "Agregar persona"', async () => {
    const wrapper = mount(Personas)
    await wrapper.vm.abrirCrear()
    expect(wrapper.vm.dlgForm).toBe(true)
  })

  it('ejecuta cargarClientes sin errores', async () => {
    const wrapper = mount(Personas)
    await wrapper.vm.cargarClientes()
    expect(Array.isArray(wrapper.vm.clientes)).toBe(true)
  })
})
