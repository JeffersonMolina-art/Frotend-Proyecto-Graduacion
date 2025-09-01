<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEsperar } from '@/composables/useEsperar'

const authStore = useAuthStore()
const { esperar, finEspera } = useEsperar()

const loading = ref(false)
const filtroTexto = ref('')
const ordenes = ref([])
const expandedId = ref(null)

const snack = ref(false)
const snackMsg = ref('')
const snackColor = ref('success')

const confirmar = ref(false)
const ordenSeleccionada = ref(null)

const normalizeOrden = (o) => {
  // asegúrate de que vengan arrays
  const detalles = Array.isArray(o.detalles) ? o.detalles : []
  // si no hay total, lo calculamos: cantidad * precio_unitario
  const total =
    o.total ??
    detalles.reduce(
      (acc, d) => acc + Number(d.cantidad || 0) * Number(d.precio_unitario || 0),
      0
    )
  return { ...o, detalles, total }
}

const cargarOrdenes = async () => {
  esperar(); loading.value = true
  try {
    const { data, error } = await useFetch('/ordenesCompra', {
      baseURL: useRuntimeConfig().public.apiBase,
      method: 'GET',
      headers: { Authorization: `Bearer ${authStore.token}` },
      // el endpoint ya filtra/soporta estado pendiente
      params: { estado: 'pendiente' },
    })
    if (error.value) throw error.value
    const arr = Array.isArray(data.value) ? data.value : []
    console.log(arr)
    ordenes.value = arr.map(normalizeOrden)
  } catch (e) {
    snackMsg.value = 'Error al cargar órdenes'; snackColor.value = 'error'; snack.value = true
    console.error(e)
  } finally {
    finEspera(); loading.value = false
  }
}

const ordenesFiltradas = computed(() => {
  const q = filtroTexto.value.trim().toLowerCase()
  if (!q) return ordenes.value
  return ordenes.value.filter(o =>
    String(o.id).includes(q) ||
    (o.proveedor?.nombre || '').toLowerCase().includes(q)
  )
})

const abrirConfirmacion = (orden) => {
  ordenSeleccionada.value = orden
  confirmar.value = true
}

const marcarComoRecibido = async () => {
  if (!ordenSeleccionada.value) return
  confirmar.value = false
  esperar()
  try {
    const id = ordenSeleccionada.value.id
    const { data, error } = await useFetch(`/ordenesCompra/${id}/recibir`, {
      baseURL: useRuntimeConfig().public.apiBase,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    if (error.value) throw error.value

    // ✅ eliminar del listado de pendientes
    ordenes.value = ordenes.value.filter(o => o.id !== id)

    snackMsg.value = `Orden #${id} marcada como recibida`
    snackColor.value = 'success'
    snack.value = true

    console.log('Orden recibida:', data.value)
  } catch (e) {
    snackMsg.value = 'No se pudo marcar como recibida'
    snackColor.value = 'error'
    snack.value = true
    console.error(e)
  } finally {
    finEspera()
  }
}

onMounted(cargarOrdenes)
</script>

<template>
  <VCard title="Órdenes de compra pendientes" class="mt-4">
    <VCardText>
      <div class="d-flex flex-wrap align-center gap-4 mb-4">
        <VTextField v-model="filtroTexto" label="Buscar (# orden o proveedor)" prepend-inner-icon="tabler-search" density="compact" clearable class="flex-grow-1"/>
        <VBtn :loading="loading" @click="cargarOrdenes" prepend-icon="tabler-refresh">Actualizar</VBtn>
      </div>

      <div v-if="loading" class="d-flex align-center gap-3">
        <VProgressCircular indeterminate color="primary" size="32" /> Cargando órdenes…
      </div>

      <div v-else>
        <div v-if="ordenesFiltradas.length === 0" class="text-medium-emphasis">No hay órdenes pendientes.</div>

        <VTable v-else density="comfortable">
          <thead>
            <tr>
              <th scope="col"># Orden</th>
              <th scope="col">Proveedor</th>
              <th scope="col">Fecha</th>
              <th scope="col">Estado</th>
              <th scope="col" class="text-right">Total</th>
              <th scope="col" class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="o in ordenesFiltradas" :key="o.id">
              <tr>
                <td>
                  <VBtn variant="text" density="comfortable" @click="expandedId = expandedId === o.id ? null : o.id">
                    {{ o.id }}
                    <VIcon :icon="expandedId === o.id ? 'tabler-chevron-up' : 'tabler-chevron-down'" size="18" class="ml-1"/>
                  </VBtn>
                </td>
                <td>{{ o.proveedor?.nombre || `#${o.proveedor_id}` }}</td>
                <td>{{ o.fecha }}</td>
                <td><VChip color="warning" size="small" variant="flat">pendiente</VChip></td>
                <td class="text-right">{{ Number(o.total ?? 0).toFixed(2) }}</td>
                <td class="text-right">
                  <VBtn color="success" size="small" prepend-icon="tabler-package-import" @click="abrirConfirmacion(o)">
                    Marcar como recibido
                  </VBtn>
                </td>
              </tr>

              <tr v-if="expandedId === o.id">
                <td colspan="6" class="bg-grey-lighten-5">
                  <div class="pa-3">
                    <strong>Detalle de productos</strong>
                    <VTable class="mt-2" density="compact">
                      <thead>
                        <tr>
                          <th scope="col">Producto</th>
                          <th scope="col" class="text-right">Cantidad</th>
                          <th scope="col" class="text-right">Precio unitario</th>
                          <th scope="col" class="text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="d in o.detalle_ordenes" :key="d.id">
                          <td>{{ d.producto?.nombre || `#${d.producto_id}` }}</td>
                          <td class="text-right">{{ d.cantidad }}</td>
                          <td class="text-right">{{ Number(d.precio_unitario ?? 0).toFixed(2) }}</td>
                          <td class="text-right">{{ (Number(d.cantidad||0) * Number(d.precio_unitario||0)).toFixed(2) }}</td>
                        </tr>
                      </tbody>
                    </VTable>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </VTable>
      </div>
    </VCardText>
  </VCard>

  <VDialog v-model="confirmar" max-width="480">
    <VCard>
      <VCardTitle>Confirmar recepción</VCardTitle>
      <VCardText>
        ¿Seguro que quieres marcar la orden <strong>#{{ ordenSeleccionada?.id }}</strong> como <strong>recibida</strong>?
      </VCardText>
      <VCardActions class="justify-end">
        <VBtn variant="text" @click="confirmar=false">Cancelar</VBtn>
        <VBtn color="success" @click="marcarComoRecibido" prepend-icon="tabler-check">Sí, marcar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VSnackbar v-model="snack" :color="snackColor" timeout="3500">{{ snackMsg }}</VSnackbar>
</template>
