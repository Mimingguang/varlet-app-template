<script setup>
/* global maplibregl */
import { onMounted, onUnmounted, reactive, ref, computed } from 'vue'
import { emitter } from '@/use'
// import { useOn } from '@/use/useOn'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/store'
const { controlShow } = storeToRefs(useGlobalStore())

let map = reactive({})
const state = reactive({
  isLoadFinished: false,
  drawMode: 'LineString', // 当前绘制模式，初始为 'LineString'
  isDrawOpen: false,
  coordinates: [],
  active: false,
  layerTypes: [
    {
      label: '点',
      value: 'Point'
    },
    {
      label: '线',
      value: 'LineString'
    },
    {
      label: '面',
      value: 'Polygon'
    },
    {
      label: '圆',
      value: 'Circle'
    }
  ]
})
const currentLayerType = computed(() => state.layerTypes.find((item) => item.value === state.drawMode).label)
// f4544db8c930fbea8272002799c78351
// 90425f13ed47e5a05f472e5d91d31594
// f4544db8c930fbea8272002799c78351
// 44da7b298e15d2a2ca96b53d0238feb0
// const vecUrl = 'http://t0.tianditu.com/vec_w/wmts?tk=90425f13ed47e5a05f472e5d91d31594'
const cvaUrl = 'http://t0.tianditu.com/cva_w/wmts?tk=90425f13ed47e5a05f472e5d91d31594'
const imgUrl = 'http://t0.tianditu.com/img_w/wmts?tk=90425f13ed47e5a05f472e5d91d31594'
const tdtCva = {
  type: 'raster',
  tiles: [
    cvaUrl +
      '&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles'
  ],
  tileSize: 256
}

const tdtImg = {
  type: 'raster',
  tiles: [
    imgUrl +
      '&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles'
  ],
  tileSize: 256
}

const style = {
  version: 8,
  sources: {
    tdtCva: tdtCva,
    tdtImg: tdtImg
  },
  layers: [
    {
      id: 'tdtImg',
      type: 'raster',
      source: 'tdtImg',
      minzoom: 0,
      maxzoom: 20
    },
    {
      id: 'tdtCva',
      type: 'raster',
      source: 'tdtCva',
      minzoom: 0,
      maxzoom: 20
    }
  ]
}
// 随机生成颜色函数
function getRandomColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16)
  return `#${randomColor.padStart(6, '0')}` // 确保是6位数
}
// const allData = ref([])

onUnmounted(() => {
  map.remove()
  map = null
})
onMounted(() => {
  map = new maplibregl.Map({
    container: 'map',
    style: style,
    center: [117.003825, 36.661953],
    zoom: 10
  })
  // 比例尺
  const scaleControl = new maplibregl.ScaleControl({
    maxWidth: 80, // 最大宽度
    unit: 'metric' // 单位 ('metric' 或 'imperial')
  })
  map.addControl(scaleControl, 'bottom-left')

  // 添加全屏控件
  const fullscreenControl = new maplibregl.FullscreenControl()
  map.addControl(fullscreenControl, 'bottom-right')

  // 添加定位控件
  map.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }),
    'bottom-right'
  )
  // 添加缩放控件
  const navigationControl = new maplibregl.NavigationControl({
    showCompass: true, // 显示指南针
    showZoom: true // 显示缩放按钮
  })
  map.addControl(navigationControl, 'bottom-right') // 将控件添加到右上角
  map.on('load', function () {
    emitter.emit('mapLoad', map)
    state.isLoadFinished = true
    // 可以在这里调用 drawGeoJsons 函数来绘制初始数据
    // drawGeoJsons([{ key: 'Example1', geojson: [[[...]]] }, { key: 'Example2', geojson: [[[...]]] }]);
  })
  // 点击绘制点和线或圆形
  map.on('click', (e) => {
    emitter.emit('mapClick', e)
    state.isDrawOpen && startDraw(e)
  })
})

const handleChangeType = (item) => {
  state.drawMode = item.value
  state.active = false
}

const addDraw = () => {
  state.isDrawOpen = true
}
const endDraw = () => {
  state.isDrawOpen = false
  switch (state.drawMode) {
    case 'LineString':
      if (map.getLayer('line-layer')) {
        map.setPaintProperty('line-layer', 'line-dasharray', [1, 0])
      }
      break

    default:
      break
  }
}
const clearDraw = () => {
  // 移除线图层和数据源
  if (map.getLayer('line-layer')) {
    map.removeLayer('line-layer')
  }
  if (map.getSource('line-source')) {
    map.removeSource('line-source')
  }
  // 移除圆形图层和数据源
  if (map.getLayer('point-layer')) {
    map.removeLayer('point-layer')
  }
  if (map.getSource('point-source')) {
    map.removeSource('point-source')
  }
}
const startDraw = (e) => {
  console.log(e)
  switch (state.drawMode) {
    case 'Point':
      state.coordinates.push([e.lngLat.lng, e.lngLat.lat])
      drawPoints()
      // 当有两个点时，绘制线
      if (state.coordinates.length === 1) {
        state.coordinates = [] // 重置坐标数组，以便再次绘制
      }
      break
    case 'LineString':
      if (!map.getSource('line-source') && !map.getLayer('line-layer')) {
        map.addSource('line-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        })

        // 添加线的图层
        map.addLayer({
          id: 'line-layer',
          type: 'line',
          source: 'line-source',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': getRandomColor(), // 线的颜色
            'line-width': 2, // 线的宽度
            'line-dasharray': [3, 2] // 定义虚线样式，[2, 4] 表示线段长度为 2，间隔为 4
          }
        })
      }

      map.on('click', 'line-layer', () => {
        if (!state.isDrawOpen) {
          map.setPaintProperty('line-layer', 'line-dasharray', [3, 2])
          state.isDrawOpen = true
        }
      })

      state.coordinates.push([e.lngLat.lng, e.lngLat.lat])
      drawPoints()
      // 当有两个点时，绘制线
      if (state.coordinates.length === 2) {
        drawLine(state.coordinates)
        state.coordinates = [] // 重置坐标数组，以便再次绘制
      }
      break

    default:
      break
  }
}
const drawPoints = () => {
  // 创建一个包含多个点的 GeoJSON 数据
  const pointData = {
    type: 'FeatureCollection',
    features: state.coordinates.map((coord) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coord
      }
    }))
  }

  if (!map.getLayer('point-layer') && !map.getSource('point-source')) {
    // 添加一个数据源，用于存储点数据
    map.addSource('point-source', {
      type: 'geojson',
      data: pointData
    })
    // 添加一个圆点图层，用于显示点
    map.addLayer({
      id: 'point-layer',
      type: 'circle',
      source: 'point-source',
      paint: {
        'circle-radius': 3, // 点的半径
        'circle-color': 'red' // 点的颜色
      }
    })
  } else {
    map.getSource('point-source').setData(pointData)
  }
}
const drawLine = (coords) => {
  const lineData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coords
        }
      }
    ]
  }

  // 更新数据源的 GeoJSON 数据
  map.getSource('line-source').setData(lineData)
}
</script>

<template>
  <div class="MaplibreGLMap">
    <div id="map"></div>
    <div v-if="controlShow && state.isLoadFinished" class="custom-control-group">
      <var-button-group type="primary" vertical class="maplibregl-ctrl-group">
        <var-button class="maplibregl-ctrl" icon-container @click="addDraw"
          ><var-icon name="radio-marked"
        /></var-button>
        <var-button class="maplibregl-ctrl" icon-container @click="clearDraw"
          ><var-icon name="trash-can-outline"
        /></var-button>
        <var-button class="maplibregl-ctrl" icon-container @click="endDraw">
          <var-icon name="check" />
        </var-button>
      </var-button-group>
    </div>
    <var-fab v-model:active="state.active" position="left-top" :teleport="false" direction="bottom">
      <var-button
        v-for="(item, i) in state.layerTypes"
        :key="i"
        class="maplibregl-ctrl"
        @click="handleChangeType(item)"
      >
        {{ item.label }}
      </var-button>

      <template #trigger>
        <var-button class="trigger maplibregl-ctrl">
          {{ currentLayerType }}
        </var-button>
      </template>
    </var-fab>
  </div>
</template>

<style lang="less">
.MaplibreGLMap {
  width: 100%;
  height: 100%;
  position: relative;

  #map {
    width: 100%;
    height: 100%;
    .maplibregl-ctrl-attrib.maplibregl-compact {
      display: none;
    }
  }
  .custom-control-group {
    position: absolute;
    right: 10px;
    top: 10px;
    .var-button-group {
      border-radius: 4px;
      .var-button {
        color: #000;
        .var-button__content {
          justify-content: center;
        }
      }
    }
  }
}
</style>
