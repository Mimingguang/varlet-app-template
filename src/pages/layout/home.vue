<template>
  <!-- <app-header>
    <template #left>
      <app-side-menu />
    </template>
    <template #right>
      <app-locale-switch />
      <app-theme-switch />
    </template>
    <template #content> </template>
  </app-header> -->
  <section ref="homeRef" id="#home" class="home-wrap">
    <MaplibreGLMap></MaplibreGLMap>
    <var-floating-panel v-model:anchor="anchor" :anchors="anchors" :teleport="false" :content-draggable="false">
      <template #header>
        <div class="var-floating-panel__header">
          <div class="var-floating-panel__header-toolbar"></div>
        </div>
      </template>
      <!-- <div style="text-align: center; padding: 15px">
        <p>面板锚点高度为 {{ Math.floor(anchor) }} px</p>
      </div> -->
      <TaskList></TaskList>
    </var-floating-panel>
  </section>
  <router-stack-view />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MaplibreGLMap from '@/components/MaplibreGLMap.vue'
import TaskList from './components/TaskList.vue'

const homeRef = ref(null)
const anchors = ref([40, window.innerHeight * 0.5])
let anchor = ref(window.innerHeight * 0.5)
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
    // transform:none !important;
    .var-floating-panel__content {
      background-color: #fff;
    }
    .var-floating-panel__header {
      height: 40px;
    }
    .var-floating-panel__header-toolbar {
      background-color: var(--bottom-navigation-item-active-color);
    }
  }
}
</style>
