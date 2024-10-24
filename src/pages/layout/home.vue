<template>
  <app-header>
    <template #left>
      <app-side-menu />
    </template>
    <template #right>
      <app-locale-switch />
      <app-theme-switch />
    </template>
    <template #content> </template>
  </app-header>
  <section ref="homeRef" id="#home" class="home-wrap">
    <MaplibreGLMap></MaplibreGLMap>
    <var-floating-panel v-model:anchor="anchor" :anchors="anchors" :teleport="false">
      <template #header>
        <div class="var-floating-panel__header">
          <div class="var-floating-panel__header-toolbar"></div>
        </div>
      </template>
      <div style="text-align: center; padding: 15px">
        <p>面板锚点高度为 {{ Math.floor(anchor) }} px</p>
      </div>
    </var-floating-panel>
  </section>
  <router-stack-view />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MaplibreGLMap from '@/components/MaplibreGLMap.vue'
const homeRef = ref(null)
const anchors = ref([60, window.innerHeight * 0.4, window.innerHeight * 0.6])
let anchor = ref(60)
</script>
<style lang="less" scoped>
.home-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
  :deep(.var-floating-panel) {
    position: absolute;
    background-color: transparent;
    box-shadow: none;
    .var-floating-panel__content {
      background-color: #fff;
    }
  }
}
</style>
