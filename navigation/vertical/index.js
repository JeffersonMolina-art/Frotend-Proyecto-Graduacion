export default [
  {
    title: 'Inicio',
    to: { name: 'second-page' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Inventario',
    to: { name: 'inventario' },
    icon: { icon: 'tabler-box' },
  },
  {
  title: 'Configuración',
  icon: { icon: 'tabler-settings' },
  children: [
    {
      title: 'Departamentos',
      to: 'departamento',
    },
    {
      title: 'Municipios',
      // to: '/municipios',
    },
  ],
}
]
