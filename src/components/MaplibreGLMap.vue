<script setup>
/* global maplibregl */
import { onMounted, reactive, ref } from 'vue'
let map = reactive({})
const drawMode = ref('') // 当前绘制模式，初始为 'line'
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
const boundSource = (id) => {
  const layerId = `multi-polygon-layer-${id}`

  if (!map.getLayer(layerId)) {
    console.error(`Layer ${layerId} does not exist.`)
    return
  }

  const sourceId = `multi-polygon-source-${id}`
  const sourceData = map.getSource(sourceId)

  if (!sourceData) {
    console.error(`Source ${sourceId} does not exist.`)
    return
  }

  const geojsonData = sourceData._data

  const bounds = new maplibregl.LngLatBounds()

  geojsonData.features.forEach((feature) => {
    if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach((polygon) => {
        polygon[0].forEach((coord) => {
          bounds.extend(coord)
        })
      })
    }
  })

  map.fitBounds(bounds, { padding: 20 })
}
// 随机生成颜色函数
function getRandomColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16)
  return `#${randomColor.padStart(6, '0')}` // 确保是6位数
}
const allData = ref([])
const drawGeoJsons = (geojsonArray, allKeys, isStore) => {
  console.log(map, 'layers')
  // 清除之前的图层和数据源
  allKeys.forEach((key) => {
    if (map.getLayer(`multi-polygon-layer-${key}`)) {
      map.removeLayer(`multi-polygon-layer-${key}`)
    }
    if (map.getSource(`multi-polygon-source-${key}`)) {
      map.removeSource(`multi-polygon-source-${key}`)
    }
  })
  if (isStore) {
    allData.value = geojsonArray
  }
  const bounds = new maplibregl.LngLatBounds()

  if (geojsonArray.length === 0) return // 检查是否有数据
  console.log(geojsonArray, 'geojsonArray')
  geojsonArray.forEach((item) => {
    const geojsonData = item.geojson

    // 添加 MultiPolygon 数据源，使用唯一的源名称
    const sourceId = `multi-polygon-source-${item.key}`
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: item.key },
            geometry: {
              type: 'MultiPolygon',
              coordinates: geojsonData
            }
          }
        ]
      }
    })

    // 添加 MultiPolygon 图层，使用唯一的图层名称
    const layerId = `multi-polygon-layer-${item.key}`
    map.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': item?.color || getRandomColor(),
        'fill-opacity': 0.5
      }
    })

    // 扩展边界以包含当前多边形的坐标
    geojsonData.forEach((polygon) => {
      polygon[0].forEach((coord) => {
        bounds.extend(coord)
      })
    })
  })

  // 自动缩放以确保所有 MultiPolygon 都在视图中
  map.fitBounds(bounds, { padding: 20 }) // 添加边距以确保多边形完全可见
}

let points = [] // 存储点击的点
let drawingCircle = false // 是否正在绘制圆形
let circleCenter = null // 圆心坐标
let markers = [] // 存储所有的标记

// 绘制点的函数
function drawPoints() {
  // 清空之前的标记
  markers.forEach((marker) => marker.remove())
  markers = [] // 重置标记数组

  points.forEach((point) => {
    const marker = new maplibregl.Marker().setLngLat(point).addTo(map)
    markers.push(marker) // 将新标记添加到数组中
  })
}

// 绘制线的函数
function drawLine() {
  const lineSource = {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: points
      }
    }
  }

  if (map.getSource('line-source')) {
    map.getSource('line-source').setData(lineSource.data)
  } else {
    map.addSource('line-source', lineSource)

    map.addLayer({
      id: 'line-layer',
      type: 'line',
      source: 'line-source',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#FF0000',
        'line-width': 4
      }
    })
  }
}

function panduanxiangjiao() {
  let keys = []
  allData.value.forEach((item) => {
    console.log(item, 'item')
    console.log(points, 'item')
    console.log(item.geojson, 'item')
    console.log()
    // let result = turf.booleanPointInPolygon(turf.multiPolygon(item.geojson), turf.points(points[0]))
    let result = false
    if (result) {
      keys.push(item.key)
    }
  })
  return keys
}
// 绘制圆形的函数
function drawCircle(center, edge) {
  const radius = Math.sqrt(Math.pow(edge.lng - center[0], 2) + Math.pow(edge.lat - center[1], 2)) //计算半径

  const circleCoordinates = []

  for (let i = 0; i <= 360; i++) {
    const angle = (i * Math.PI) / 180 // 转换为弧度
    const lng = center[0] + radius * Math.cos(angle)
    const lat = center[1] + radius * Math.sin(angle)
    circleCoordinates.push([lng, lat])
  }

  const circleSource = {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [circleCoordinates]
      }
    }
  }

  if (map.getSource('circle-source')) {
    map.getSource('circle-source').setData(circleSource.data)
  } else {
    map.addSource('circle-source', circleSource)

    map.addLayer({
      id: 'circle-layer',
      type: 'fill',
      source: 'circle-source',
      paint: {
        'fill-color': '#00FF00',
        'fill-opacity': 0.5
      }
    })
  }
}

onMounted(() => {
  map = new maplibregl.Map({
    container: 'map',
    style: style,
    center: [117.003825, 36.661953],
    zoom: 10
  })

  map.on('load', function () {
    // 可以在这里调用 drawGeoJsons 函数来绘制初始数据
    // drawGeoJsons([{ key: 'Example1', geojson: [[[...]]] }, { key: 'Example2', geojson: [[[...]]] }]);
  })
  // 点击绘制点和线或圆形
  map.on('click', (e) => {
    if (drawMode.value === 'line') {
      if (points.length < 2) {
        points.push([e.lngLat.lng, e.lngLat.lat]) // 添加点击的点
        drawPoints() // 绘制点

        if (points.length === 2) {
          drawLine() // 绘制线
        }
      } else {
        console.warn('已经绘制了一条线，请先清除再绘制。')
      }
    } else if (drawMode.value === 'circle') {
      if (!drawingCircle) {
        drawingCircle = true
        circleCenter = [e.lngLat.lng, e.lngLat.lat] // 设置圆心
      }
    }
  })

  // 鼠标移动时更新圆形
  map.on('mousemove', (e) => {
    if (drawingCircle && circleCenter) {
      drawCircle(circleCenter, e.lngLat) // 绘制圆形
    }
  })

  // 鼠标抬起结束绘制圆形
  map.on('mouseup', () => {
    if (drawingCircle) {
      drawingCircle = false
      circleCenter = null // 清空圆心
    }
  })
})
// 切换绘制模式
// const toggleDrawMode = () => {
//   drawMode.value = drawMode.value === 'line' ? 'circle' : 'line'
//   // clearLineAndCircle(); // 清除之前的绘制
// }
// 清除线和圆的函数
const clearLineAndCircle = () => {
  points = [] // 清空存储的点

  // 移除线图层和数据源
  if (map.getLayer('line-layer')) {
    map.removeLayer('line-layer')
  }
  if (map.getSource('line-source')) {
    map.removeSource('line-source')
  }

  // 移除圆形图层和数据源
  if (map.getLayer('circle-layer')) {
    map.removeLayer('circle-layer')
  }
  if (map.getSource('circle-source')) {
    map.removeSource('circle-source')
  }
  // 移除圆形图层和数据源
  if (map.getLayer('polygon-layer')) {
    map.removeLayer('polygon-layer')
  }
  if (map.getSource('polygon-source')) {
    map.removeSource('polygon-source')
  }

  drawingCircle = false // 重置绘制状态
  circleCenter = null // 清空圆心
  markers.forEach((marker) => marker.remove())
  markers = [] // 重置标记数组
}
defineExpose({
  drawGeoJsons: drawGeoJsons,
  boundSource: boundSource,
  clearLineAndCircle: clearLineAndCircle,
  panduanxiangjiao: panduanxiangjiao
})
</script>

<template>
  <div class="MaplibreGLMap">
    <div id="map"></div>
  </div>
</template>

<style lang="less">
.MaplibreGLMap {
  width: 100%;
  height: 100%;

  #map {
    width: 100%;
    height: 100%;
  }
}
</style>
