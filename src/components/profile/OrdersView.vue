<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useCurrStore } from '@/stores/currencies'
import { useModelGeneratorStore } from '@/stores/model.js'
import { VueAwesomePaginate } from 'vue-awesome-paginate'

const currStore = useCurrStore()
const profileStore = useProfileStore()
const modelStore = useModelGeneratorStore()
const { downloadModel } = modelStore

const domain = ref(import.meta.env.VITE_IMG_DOMA)
const currentPage = ref(1)

const meta = computed(() => profileStore.orderHistory.meta)
const data = computed(() => profileStore.orderHistory.data)

function handlePageChange(page) {
  console.log(page, 'handlePageChange')

  currentPage.value = page
  profileStore.getOrderHistory(page)
}

function formatDate(dateStr) {
  const date = new Date(dateStr.replace(' ', 'T'))
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

watch(
  () => currStore.currency,
  () => {
    if (currStore.currency) {
      profileStore.getOrderHistory(currentPage.value)
    }
  },
)

onMounted(() => {
  profileStore.getOrderHistory(currentPage.value)
})
</script>

<template>
  <div class="profile-orders">
    <div class="profile-right-block" v-if="meta?.total">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th class="text text-14 text-gray">{{ $t('Date/time') }}</th>
              <th class="text text-14 text-gray">{{ $t('Sum') }}</th>
              <th class="text text-14 text-gray">{{ $t('Name') }}</th>
              <th class="text text-14 text-gray">{{ $t('Image') }}</th>
              <th class="text text-14 text-gray">{{ $t('Status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data" :key="item.id">
              <td class="text text-14">{{ formatDate(item.created_at) }}</td>
              <td class="text text-14 weight-700">
                <div class="flex items-center price">
                  <span> {{ item.price }}</span>
                  <img alt="coin icon" class="coin" src="@/assets/imgs/coin.svg" />
                </div>
              </td>
              <td class="text text-14">{{ item.prompt }}</td>
              <td class="text text-14">
                <img
                  v-if="item.thumbnail_url"
                  :alt="'image'"
                  class="img product-img"
                  :src="item.thumbnail_url"
                />
              </td>
              <td class="text text-14 weight-700">
                <div class="download flex items-center justify-between flex-wrap">
                  <div class="download-list flex items-center">
                    <div
                      v-for="format in item.available_formats"
                      :key="format"
                      class="download-item flex items-center justify-center"
                    >
                      <button
                        @click="downloadModel(item.id, format)"
                        class="text text-12 text-inter text-white"
                      >
                        {{ $t(`.${format}`) }}
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <vue-awesome-paginate
        v-if="meta.total > meta.per_page"
        :total-items="meta.total"
        :items-per-page="meta.per_page"
        :max-pages-shown="6"
        v-model="currentPage"
        :page-count="meta.last_page"
        @click="handlePageChange"
      />
    </div>
  </div>
</template>
