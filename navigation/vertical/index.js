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
    title: 'Productos',
    icon: {icon: 'tabler-shopping-cart'},
    children: [
      {
        title: 'Ingresar productos',
        icon: { icon: 'tabler-tag' },
        to: 'crearProductos',
      },
      {
        title: 'Abestecimiento de productos',
        icon: {icon: 'tabler-tag'},
      },
      {
        title: 'Historial de Stock',
        icon: {icon: 'tabler-tag'},
      },
    ]
  },
  {
    title: 'Ventas',
    // to: { name: 'ventas' },
    icon: { icon: 'tabler-shopping-cart' },
  },
  {
    title: 'Clientes',
    // to: { name: 'clientes' },
    icon: { icon: 'tabler-users' },
  },
  {
    title: 'Proveedores',
    to: { name: 'proveedor' },
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
        {
          title: 'Paises',
          to: 'pais',
        },
      ],
    },
    {
      title: 'Categorias',
      icon: { icon: 'tabler-tag' },
      to: 'categorias',
    },
    {
      title: 'Configuracion Usuarios',
      icon: { icon: 'tabler-users' },
      children: [
        {
          title: 'Roles',
          icon: { icon: 'tabler-user' },
          to: 'roles'
        },
        {
          title: 'Permisos',
          icon: { icon: 'tabler-lock' },
          to: 'permisos'
        },
        {
          title: 'Unidad',
          icon: { icon: 'tabler-box' },
          to: 'unidad'
        },
        {
          title: 'Puestos',
          icon: { icon: 'tabler-briefcase' },
          to: 'puestos'
        }
      ],
    },
    
  ],
}
]
