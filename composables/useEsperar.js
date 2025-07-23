import { ref } from 'vue'

const visible = ref(false)

export function useEsperar () {
  const esperar   = () => { visible.value = true  }
  const finEspera = () => { visible.value = false }

  return { esperar, finEspera, visible }
}
