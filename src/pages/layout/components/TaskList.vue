<template>
  <div class="task-list">
    <var-app-bar title="任务列表">
      <template #right>
        <var-button type="primary" round icon-container @click.stop="handleBatchUpload">
          <var-icon name="upload" />
        </var-button>
      </template>
    </var-app-bar>
    <var-pull-refresh v-model="isRefresh" @refresh="refresh">
      <div class="list-container">
        <template v-if="data.length">
          <var-checkbox-group ref="group" v-model="checkboxGroup">
            <var-cell v-for="(item, index) in data" :key="index" border>
              <div class="item-content">
                <var-checkbox :checked-value="item.check"> </var-checkbox>
                <var-row justify="space-between" :gutter="[5, 10]" @click="handleDetail(item)">
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
                    <var-icon name="upload" />
                  </var-button>
                  <var-button type="success" round icon-container @click.stop="">
                    <var-icon name="cog" />
                  </var-button>
                  <var-button type="danger" round icon-container @click.stop="">
                    <var-icon name="delete" />
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
                  round
                  icon-container
                  @click="
                    () => {
                      refresh()
                      loading = !loading
                    }
                  "
                >
                  <var-icon name="refresh" />
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
const { router } = useAppRouter()
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
  router.push({ path: '/layout/detail', query: { id: item.id, name: item.name } })
}
const handleBatchUpload = () => {
  console.log(checkboxGroup.value)
  if (!checkboxGroup.value.length) {
    Snackbar({ type: 'warning', content: '至少选择一条任务！！', duration: 3000, forbidClick: true })
  }
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
  display: flex;
  flex-direction: column;
  .var-pull-refresh {
    flex: 1;
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
      margin-bottom: 10px;
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
