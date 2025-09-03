<template>
  <div>
    <!-- Snackbar -->
    <v-alert
      v-if="snackbar"
      :type="snackbarColor"
      class="mb-4"
      dismissible
      @input="snackbar = false"
    >
      {{ snackbarMsg }}
    </v-alert>

    <!-- Selector de producto -->
    <v-autocomplete
      v-model="productoSeleccionado"
      :items="productos"
      item-title="nombre"
      item-value="id"
      label="Buscar producto"
      return-object
      @update:modelValue="agregarProducto"
    />

    <!-- Tabla productos seleccionados -->
    <v-table class="mt-4">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in productosSeleccionados" :key="p.id">
          <td>{{ p.nombre }}</td>
          <td>Q {{ p.precio_unitario }}</td>
          <td>
            <v-text-field
              v-model.number="p.cantidad"
              type="number"
              :min="1"
              :max="p.stock_actual - 1"
              density="compact"
              hide-details
              style="inline-size: 80px;"
            />
          </td>
          <td>Q {{ (p.precio_unitario * p.cantidad).toFixed(2) }}</td>
          <td>
            <v-btn size="small" variant="text" color="error" @click="eliminarProducto(p.id)">
              <v-icon size="18" icon="tabler-trash" />
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Campo NIT -->
    <v-text-field v-model="nit" label="NIT del cliente" class="mt-4" />

    <!-- Total y botón -->
    <div class="text-right mt-4">
      <h3 class="mb-2">Total: Q {{ total.toFixed(2) }}</h3>
      <v-btn color="primary" @click="finalizarVenta" v-if="productosSeleccionados.length > 0">Finalizar Venta</v-btn>
    </div>

    <!-- FACTURA IMPRIMIBLE (oculta, solo para usar su HTML) -->
    <div v-show="false" ref="facturaRef" class="factura-imprimible">
      <h2>Factura Variedades del Cid</h2>
      <p><strong>Fecha:</strong> {{ new Date().toLocaleDateString() }}</p>
      <p><strong>NIT:</strong> {{ nit }}</p>

      <table class="factura-tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in productosSeleccionados" :key="p.id">
            <td>{{ p.nombre }}</td>
            <td>Q {{ p.precio_unitario }}</td>
            <td>{{ p.cantidad }}</td>
            <td>Q {{ (p.precio_unitario * p.cantidad).toFixed(2) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3"><strong>Total</strong></td>
            <td><strong>Q {{ total.toFixed(2) }}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
const config = useRuntimeConfig()

const authStore = useAuthStore()
const productos = ref([])
const productoSeleccionado = ref(null)
const productosSeleccionados = ref([])
const nit = ref('CF')

// Snackbar
const snackbar = ref(false)
const snackbarMsg = ref('')
const snackbarColor = ref('success')

// Ref factura
const facturaRef = ref(null)

// Cargar productos
const cargarProductos = async () => {
  const { data } = await useFetch('/productos', {
    baseURL: config.public.apiBase,
    headers: { Authorization: `Bearer ${authStore.token}` },
  })
  if (data.value) productos.value = data.value
}
onMounted(cargarProductos)

// Agregar producto
const agregarProducto = (producto) => {
  if (!producto) return
  const existe = productosSeleccionados.value.find(p => p.id === producto.id)
  if (!existe) {
    productosSeleccionados.value.push({ ...producto, cantidad: 1 })
  }
  productoSeleccionado.value = null
}

// Eliminar producto
const eliminarProducto = (id) => {
  productosSeleccionados.value = productosSeleccionados.value.filter(p => p.id !== id)
}

// Calcular total
const total = computed(() =>
  productosSeleccionados.value.reduce((sum, p) => sum + p.precio_unitario * p.cantidad, 0)
)

// Finalizar venta
const finalizarVenta = async () => {
  if (productosSeleccionados.value.length === 0) {
    mostrarSnackbar('Debe seleccionar al menos un producto', 'error')
    return
  }

  try {
    for (const p of productosSeleccionados.value) {
      if (p.cantidad > (p.stock_actual - 1)) {
        mostrarSnackbar(`Stock insuficiente para "${p.nombre}"`, 'error')
        return
      }

      // Guardar en movimientosInventario
      await useFetch(`/movimientosInventario`, {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          producto_id: p.id,
          tipo: 'salida',
          cantidad: p.cantidad,
          descripcion: `Venta al cliente con NIT ${nit.value}`,
          usuario_id: authStore.user?.id || null,
        }),
      })

      // Actualizar stock
      await useFetch(`/productos/${p.id}`, {
        baseURL: config.public.apiBase,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock_actual: p.stock_actual - p.cantidad,
        }),
      })
    }

    mostrarSnackbar('Venta completada exitosamente', 'success')

    // Esperar brevemente y luego imprimir automáticamente
    setTimeout(() => {
      imprimirFactura()
    }, 1000)

    nit.value = 'CF'
    productoSeleccionado.value = null
    await cargarProductos()
  } catch (err) {
    mostrarSnackbar('Ocurrió un error al finalizar la venta', 'error')
    console.error(err)
  }
}

// Mostrar snackbar
const mostrarSnackbar = (mensaje, color = 'success') => {
  snackbarMsg.value = mensaje
  snackbarColor.value = color
  snackbar.value = true
  setTimeout(() => {
    snackbar.value = false
  }, 3000)
}

// Validar cantidad
watch(productosSeleccionados, (nuevos) => {
  nuevos.forEach((p) => {
    if (p.cantidad >= p.stock_actual) {
      p.cantidad = p.stock_actual - 1
      mostrarSnackbar(`Solo hay ${p.stock_actual} unidades de "${p.nombre}"`, 'warning')
    } else if (p.cantidad < 1) {
      p.cantidad = 1
    }
  })
}, { deep: true })

// Imprimir factura (modo seguro)
const imprimirFactura = () => {
  const printWindow = window.open('', '', 'width=800,height=600')
  const html = `
    <html>
    <head>
      <title>Factura</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 2rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
      </style>
    </head>
    <body>
      ${facturaRef.value.innerHTML}
    </body>
    </html>
  `
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()

  // Limpiar productos después de imprimir
  productosSeleccionados.value = []
}
</script>

<style scoped>
.text-right {
  text-align: end;
}
.factura-imprimible {
  background-color: white;
  color: #212121;
  padding: 2rem;
  border: 1px solid #ccc;
  margin-top: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.factura-tabla {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  color: #333;
}
.factura-tabla th,
.factura-tabla td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
}
.factura-tabla th {
  background-color: #f5f5f5;
  font-weight: bold;
}
</style>
