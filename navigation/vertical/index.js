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
    title: 'Ventas',
    // to: { name: 'ventas' },
    icon: { icon: 'tabler-shopping-cart' },
  },
  {
    title: 'Compras',
    // to: { name: 'compras' },
    icon: { icon: 'tabler-shopping-cart' },
  },
  {
    title: 'Clientes',
    // to: { name: 'clientes' },
    icon: { icon: 'tabler-users' },
  },
  {
    title: 'Proveedores',
    // to: { name: 'proveedores' },
    icon: { icon: 'tabler-users' },
  },
  {
    title: 'Usuarios',
    // to: { name: 'usuarios' },
    icon: { icon: 'tabler-user' },
  },
  {
  title: 'Configuración',
  icon: { icon: 'tabler-settings' },
  children: [
    {
      title: 'Direcciones',
      icon: { icon: 'tabler-map' },
      children: [
        {
          title: 'Departamentos',
          to: 'departamento',
        },
        {
          title: 'Municipios',
          to: 'municipio',
        },
      ],
    },
  ],
}
]
