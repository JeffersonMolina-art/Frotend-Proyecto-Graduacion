export default [
  {
    title: 'Home',
    to: { name: 'second-page' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Inventario',
    to: { name: 'inventario' },
    icon: { icon: 'tabler-box' },
  },
  {
  title: 'Catálogos',
  icon: { icon: 'tabler-folder' },
  children: [
    {
      title: 'Departamentos',
      // to: '/departamentos',
    },
    {
      title: 'Municipios',
      // to: '/municipios',
    },
  ],
}
]
