<script setup lang="js">
import { ref,onMounted } from 'vue'
const { route } = useAppRouter()
import { useOn } from '@/use/useOn'
import DetailList from './components/detailList.vue'
const anchors = ref([40, window.innerHeight * 0.5])
let anchor = ref(window.innerHeight * 0.5)
// const isRefresh = ref(false)
let _map = null

// function handleRefresh() {
//   isRefresh.value = false
// }
useOn('mapLoad',(map) => {
    _map = map
    console.log(_map);
})
useOn('mapClick',(e) => {
    console.log(e);
})
onMounted(() => {
    useOn('detail',(item) => {
        console.log(item);
    })
    useOn('add', (item) => {
        _map.setCenter([116.96989682278297, 36.78766181272357])
        const circleSource = {
            type: 'geojson',
            data: {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [[116.96989682278297, 36.78766181272357],[115.96989682278297, 36.78766181272357]]
            }
            }
        }
        if (_map.getSource('circle-source')) {
            _map.getSource('circle-source').setData(circleSource)
        } else {
            _map.addSource('circle-source', circleSource)
            _map.addLayer({
                id: 'circle-layer',
                type: 'line',
                source: 'circle-source',
                paint: {
                    'line-color': '#00FF00',
                    'line-width':4,
                    'line-opacity': 0.5
                }
            })
        }
    })
})
</script>

<template>
  <router-stack>
    <div class="pt-[var(--app-bar-height)] h-full detail-wrap">
      <app-header :title="route.query.name">
        <template #left>
          <app-back />
        </template>
        <!-- <template #right>
          <var-menu close-on-click-reference placement="bottom-end" offset-y="2vmin">
            <var-button text round>
              <var-icon class="text-[22px]!" name="dots-vertical" />
            </var-button>

            <template #menu>
              <var-cell icon="heart" ripple> {{ $t('ACTION') }} </var-cell>
              <var-cell icon="star" ripple> {{ $t('ACTION') }} </var-cell>
              <var-cell icon="delete" ripple> {{ $t('ACTION') }} </var-cell>
            </template>
          </var-menu>
        </template> -->
      </app-header>
      <div class="detail-container">
        <slot name="map"></slot>
        <var-floating-panel v-model:anchor="anchor" :anchors="anchors" :teleport="false" :content-draggable="false">
          <template #header>
            <div class="var-floating-panel__header">
              <div class="var-floating-panel__header-toolbar"></div>
            </div>
          </template>
          <!-- <div style="text-align: center; padding: 15px">
        <p>面板锚点高度为 {{ Math.floor(anchor) }} px</p>
      </div> -->
          <DetailList></DetailList>
        </var-floating-panel>
      </div>
      <!-- <var-pull-refresh v-model="isRefresh" @refresh="handleRefresh">
        <var-swipe>
          <var-swipe-item>
            <var-image
              class="pointer-events-none"
              @click="handleRefresh"
              fit="cover"
              height="54vmin"
              src="@/assets/images/material-2.png"
            />
          </var-swipe-item>
          <var-swipe-item>
            <var-image class="pointer-events-none" fit="cover" height="54vmin" src="@/assets/images/material-2.png" />
          </var-swipe-item>
          <var-swipe-item>
            <var-image class="pointer-events-none" fit="cover" height="54vmin" src="@/assets/images/material-2.png" />
          </var-swipe-item>
        </var-swipe>

        <var-card
          class="mt-[6px]"
          style="--card-background: transparent; --card-padding: 0"
          :elevation="0"
          :title="$t('Card Title')"
          :subtitle="$t('Card Subtitle')"
          :description="$t('Card Description')"
        />

        <var-divider class="my-[30px]!" />

        <div class="px-[14px]">
          <div class="text-md text-tertiary">{{ $t('Comment Information Area') }}</div>
          <div class="mt-[28px]!">
            <var-space :size="['5vmin', '4vmin']">
              <var-chip class="p-0!" v-for="i in 8" :key="i">
                <template #left>
                  <var-avatar class="w-[32px]! h-[32px]! mr-[2px]" src="@/assets/images/avatar.jpg" />
                </template>
                <var-ellipsis class="max-w-[100px]" :tooltip="{ sameWidth: false }">
                  {{ $t('This is a comment') }}
                </var-ellipsis>
              </var-chip>
            </var-space>
          </div>

          <div class="flex items-center mt-[28px]">
            <var-rate
              class="w-auto! mr-[12px]"
              style="--rate-action-padding: 0"
              size="6vmin"
              half
              empty-color="var(--color-warning)"
              color="var(--color-warning)"
              readonly
              :gap="2"
              :model-value="3.5"
            />

            <div class="text-tertiary text-md">{{ $t('A total of {count} comments', { count: 100 }) }}</div>
          </div>
        </div>

        <div class="pt-[28px] pb-[34px] px-[14px]">
          <var-button block type="primary">
            <var-icon name="star" />
            <span class="mx-[10px]">
              {{ $t('ACTION BUTTON') }}
            </span>
            <var-icon name="star" />
          </var-button>
        </div>
      </var-pull-refresh> -->
    </div>
  </router-stack>
</template>
<style scoped lang="less">
.detail {
  &-wrap {
    display: flex;
    flex-direction: column;
  }
  &-container {
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
}
</style>
