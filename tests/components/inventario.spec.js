import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Inventario from '@/pages/inventario.vue'

describe('inventario.vue', () => {
  it('renderiza el título principal del módulo', () => {
    const wrapper = mount(Inventario)
    expect(wrapper.text()).toMatch(/Inventario de Productos/i)
  })

  it('muestra el botón para agregar producto', () => {
    const wrapper = mount(Inventario)
    expect(wrapper.text()).toMatch(/Agregar Producto/i)
  })

  it('abre el diálogo de crear producto al presionar el botón', async () => {
    const wrapper = mount(Inventario)
    global.navigateTo.mockClear()
    await wrapper.vm.abrirModalCrear()
    expect(global.navigateTo).toHaveBeenCalled()
    })


  it('ejecuta cargarProductos sin errores', async () => {
    const wrapper = mount(Inventario)
    await wrapper.vm.cargarProductos()
    expect(Array.isArray(wrapper.vm.productos)).toBe(true)
  })

  it('filtra correctamente los productos por nombre', async () => {
    const wrapper = mount(Inventario)
    wrapper.vm.productos = [
      { nombre: 'Lapicero', categoria_id: 1 },
      { nombre: 'Cuaderno', categoria_id: 2 },
    ]
    wrapper.vm.filtroNombre = 'lapi'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.productosFiltrados.length).toBe(1)
  })
})
