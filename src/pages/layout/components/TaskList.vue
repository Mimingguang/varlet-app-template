<template>
  <div class="task-list">
    <var-app-bar title="任务列表">
      <template #right>
        <var-button type="primary" round icon-container @click.stop="">
          <var-icon name="plus" />
        </var-button>
      </template>
    </var-app-bar>
    <var-pull-refresh v-model="isRefresh" @refresh="refresh">
      <div class="list-container">
        <template v-if="data.length">
          <var-checkbox-group ref="group" v-model="checkboxGroup">
            <var-cell v-for="(item, index) in data" :key="index" border @click="handleDetail(item)">
              <div class="item-content">
                <var-checkbox :checked-value="item.check"> </var-checkbox>
                <var-row justify="space-between" :gutter="[5, 10]">
                  <var-col :span="12">
                    <div class="item">任务名称</div>
                  </var-col>
                  <var-col :span="12">
                    <div class="item">任务名称</div>
                  </var-col>
                  <var-col :span="12">
                    <div class="item">任务名称</div>
                  </var-col>
                  <var-col :span="12">
                    <div class="item">任务名称</div>
                  </var-col>
                  <var-col :span="12">
                    <div class="item">任务名称</div>
                  </var-col>
                  <var-col :span="12">
                    <div class="item">任务名称</div>
                  </var-col>
                  <var-col :span="12">
                    <div class="item">任务名称</div>
                  </var-col>
                  <var-col :span="12">
                    <div class="item">任务名称</div>
                  </var-col>
                </var-row>
              </div>
              <var-col :span="24" justify="flex-end">
                <div class="btns">
                  <var-button type="primary" round icon-container @click.stop="">
                    <var-icon name="plus" />
                  </var-button>
                  <var-button type="info" round icon-container @click.stop="">
                    <var-icon name="information" />
                  </var-button>
                  <var-button type="success" round icon-container @click.stop="">
                    <var-icon name="check" />
                  </var-button>
                </div>
              </var-col>
            </var-cell>
          </var-checkbox-group>
        </template>
        <template v-else>
          <var-loading description="LOADING" :loading="loading">
            <var-result class="result" type="empty" title="空值" description="嗨~ 我是结果页的一段描述~">
              <template #footer>
                <var-button
                  color="var(--result-empty-color)"
                  text-color="#fff"
                  @click="
                    () => {
                      refresh()
                      loading = !loading
                    }
                  "
                >
                  点击刷新
                </var-button>
              </template>
            </var-result>
          </var-loading>
        </template>
      </div>
    </var-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const { pushStack } = useAppRouter()
let isRefresh = ref(false)
const loading = ref(false)
let data = ref([])
const data1 = ref([])
let checkboxGroup = ref([])

onMounted(() => {
  for (let i = 0; i < 20; i++) {
    data1.value.push({
      name: 'List Item',
      id: i,
      check: i
    })
  }
})

const handleDetail = (item) => {
  console.log(item)
  pushStack('/detail')
}
const refresh = () => {
  setTimeout(() => {
    data.value = data1.value
    isRefresh.value = false
  }, 2000)
}
</script>
<style lang="less" scoped>
.task-list {
  height: 100%;
  overflow-y: auto;
  .var-pull-refresh {
    height: 100%;
  }
  .list-container {
    height: 100%;
    overflow-y: auto;
    // .var-checkbox__wrap {
    //   width: 100%;
    // }
    .item-content {
      display: flex;
      align-items: center;
    }
    .btns {
      .var-button {
        & + .var-button {
          margin-left: 5px;
        }
      }
    }
    :deep(.var-loading) {
      height: 100%;
      .var-loading__content {
        height: 100%;
      }
    }
    .var-result {
      height: 100%;
    }
  }
}
</style>
