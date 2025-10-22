import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Proveedores from '@/pages/proveedor.vue'
import { nextTick } from 'vue'

describe('proveedor.vue', () => {
  it('renderiza el botón para agregar proveedor', () => {
    const wrapper = mount(Proveedores)
    expect(wrapper.text()).toMatch(/Agregar Proveedor/i)
  })

  it('asigna correctamente el proveedor al editar', async () => {
    const wrapper = mount(Proveedores)
    const proveedor = { id: 1, nombre: 'Proveedor A' }
    await wrapper.vm.editarProveedor(proveedor)
    expect(wrapper.vm.proveedorSeleccionado).toEqual(proveedor)
    expect(wrapper.vm.editando).toBe(true)
  })

  it('abre el diálogo de confirmación al intentar eliminar', async () => {
    const wrapper = mount(Proveedores)
    const proveedor = { id: 2, nombre: 'Proveedor B' }
    await wrapper.vm.eliminarProveedor(proveedor)
    expect(wrapper.vm.dialogEliminar).toBe(true)
    expect(wrapper.vm.proveedorAEliminar).toEqual(proveedor)
  })

  it('ejecuta cargarProveedores sin errores', async () => {
    const wrapper = mount(Proveedores)
    await wrapper.vm.cargarProveedores()
    expect(Array.isArray(wrapper.vm.proveedores)).toBe(true)
  })
})
