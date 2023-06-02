import vue from '@vitejs/plugin-vue'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import { VarletUIResolver } from 'unplugin-vue-components/resolvers'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    components({
      resolvers: [VarletUIResolver()]
    }),
    autoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      eslintrc: { enabled: true },
      resolvers: [VarletUIResolver({ autoImport: true })]
    })
  ]
})
