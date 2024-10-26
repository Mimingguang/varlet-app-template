import { reactive, toRefs } from 'vue'
export const useGlobalStore = defineStore('global', () => {
  const state = reactive({
    controlShow: true
  })
  const addControl = () => {
    state.controlShow = true
  }
  return {
    ...toRefs(state),
    addControl
  }
})
