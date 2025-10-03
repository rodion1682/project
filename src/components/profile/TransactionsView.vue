<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useCurrStore } from '@/stores/currencies'
import { VueAwesomePaginate } from 'vue-awesome-paginate'

const currStore = useCurrStore()
const profileStore = useProfileStore()

const itemsPerPage = ref(6)

const currentPage = ref(1)

const meta = computed(() => profileStore.depositHistory.meta)
const data = computed(() => profileStore.depositHistory.data)

function handlePageChange(page) {
  currentPage.value = page
  profileStore.getDepositHistory(page)
}

function formatDate(dateStr) {
  const date = new Date(dateStr.replace(' ', 'T'))
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

const totalPages = computed(() =>
  Math.ceil(profileStore.depositHistory.length / itemsPerPage.value),
)

watch(
  () => currStore.currency,
  () => {
    if (currStore.currency) {
      profileStore.getDepositHistory(currentPage.value)
    }
  },
)

onMounted(() => {
  profileStore.getDepositHistory(currentPage.value)
})
</script>

<template>
  <div class="profile-orders">
    <div class="profile-right-block" v-if="meta?.total">
      <div class="table-container table-container-transactions">
        <table>
          <thead>
            <tr>
              <th class="text text-14 text-gray">{{ $t('Date/time') }}</th>
              <th class="text text-14 text-gray">{{ $t('Sum') }}</th>
              <th class="text text-14 text-gray">{{ $t('Points') }}</th>
              <th class="text text-14 text-gray">{{ $t('Type') }}</th>
              <th class="text text-14 text-gray">{{ $t('Status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data" :key="item.id">
              <td class="text text-14">{{ formatDate(item.created_at) }}</td>
              <td class="text text-14 weight-700">{{ item.amount }} {{ item.currency }}</td>
              <td class="text text-14">
                <div class="flex items-center">
                  <span>{{ item.points }}</span>
                  <img alt="coin icon" class="coin" src="@/assets/imgs/coin.svg" />
                </div>
              </td>
              <td class="text text-14">
                {{ $t('Top up') }}
              </td>
              <td class="text text-14">
                <div :class="'status_' + item.status">{{ $t(item.status) }}</div>
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
