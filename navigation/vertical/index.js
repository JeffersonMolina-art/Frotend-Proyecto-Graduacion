export default [
  {
    title: 'Inicio',
    to: { name: 'second-page' },
    icon: { icon: 'tabler-smart-home' },
    roles: ['Super Administrador', 'Admin', 'Gerente', 'Colaborador'],
  },
  {
    title: 'Inventario',
    to: { name: 'inventario' },
    icon: { icon: 'tabler-box' },
    roles: ['Super Administrador', 'Admin', 'Gerente', 'Colaborador'],
  },
  {
    title: 'Productos',
    icon: { icon: 'tabler-shopping-cart' },
    roles: ['Super Administrador', 'Admin', 'Gerente'],
    children: [
      {
        title: 'Ingresar productos',
        icon: { icon: 'tabler-tag' },
        to: 'crearProductos',
        roles: ['Super Administrador', 'Admin', 'Gerente'],
      },
      {
        title: 'Abestecimiento de productos',
        icon: { icon: 'tabler-tag' },
        to: 'abastecimiento',
        roles: ['Super Administrador', 'Admin'],
      },
      {
        title: 'Historial de Stock',
        icon: { icon: 'tabler-tag' },
        roles: ['Super Administrador', 'Admin', 'Gerente'],
      },
    ],
  },
  {
    title: 'Ventas',
    icon: { icon: 'tabler-shopping-cart' },
    to: 'venta',
    roles: ['Super Administrador', 'Admin', 'Gerente', 'Colaborador'],
  },
  {
    title: 'Personas',
    icon: { icon: 'tabler-users' },
    to: 'clientes',
    roles: ['Super Administrador', 'Admin', 'Gerente'],
  },
  {
    title: 'Proveedores',
    to: { name: 'proveedor' },
    icon: { icon: 'tabler-users' },
    roles: ['Super Administrador', 'Admin', 'Gerente'],
  },
  {
    title: 'Usuarios',
    icon: { icon: 'tabler-user' },
    to: 'usuarios',
    roles: ['Super Administrador', 'Admin'],
  },
  {
    title: 'Configuración',
    icon: { icon: 'tabler-settings' },
    roles: ['Super Administrador', 'Admin'],
    children: [
      {
        title: 'Direcciones',
        icon: { icon: 'tabler-map' },
        roles: ['Super Administrador', 'Admin'],
        children: [
          {
            title: 'Departamentos',
            to: 'departamento',
            roles: ['Super Administrador', 'Admin'],
          },
          {
            title: 'Municipios',
            to: 'municipio',
            roles: ['Super Administrador', 'Admin'],
          },
          {
            title: 'Paises',
            to: 'pais',
            roles: ['Super Administrador', 'Admin'],
          },
        ],
      },
      {
        title: 'Categorias',
        icon: { icon: 'tabler-tag' },
        to: 'categorias',
        roles: ['Super Administrador', 'Admin'],
      },
      {
        title: 'Configuracion Usuarios',
        icon: { icon: 'tabler-users' },
        roles: ['Super Administrador'],
        children: [
          {
            title: 'Roles',
            icon: { icon: 'tabler-user' },
            to: 'roles',
            roles: ['Super Administrador'],
          },
          {
            title: 'Permisos',
            icon: { icon: 'tabler-lock' },
            to: 'permisos',
            roles: ['Super Administrador'],
          },
          {
            title: 'Unidad',
            icon: { icon: 'tabler-box' },
            to: 'unidad',
            roles: ['Super Administrador', 'Admin'],
          },
          {
            title: 'Puestos',
            icon: { icon: 'tabler-briefcase' },
            to: 'puestos',
            roles: ['Super Administrador', 'Admin'],
          },
        ],
      },
    ],
  },
]
