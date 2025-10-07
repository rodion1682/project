<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useCurrStore } from '@/stores/currencies'
import { VueAwesomePaginate } from 'vue-awesome-paginate'
import 'vue-awesome-paginate/dist/style.css'
import UiText, { TextTheme, TextWeight } from '@/components/shared/UiText.vue'

const currStore = useCurrStore()
const profileStore = useProfileStore()

const itemsPerPage = ref(6)
const currentPage = ref(1)

const rawData = ref([])

async function fetchHistory() {
  await profileStore.getDepositHistory()
  rawData.value = profileStore.depositHistory?.data ?? []
  if (currentPage.value > Math.max(1, pageCount.value)) currentPage.value = 1
}

watch(
  () => currStore.currency,
  () => {
    if (currStore.currency) {
      currentPage.value = 1
      fetchHistory()
    }
  },
)

onMounted(() => {
  fetchHistory()
})

const totalItems = computed(() => rawData.value.length)
const pageCount = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return rawData.value.slice(start, start + itemsPerPage.value)
})

function formatDate(dateStr) {
  const date = new Date(dateStr?.replace(' ', 'T'))
  if (isNaN(date)) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}
</script>

<template>
  <div class="orders">
    <div class="orders__content">
      <div class="orders__top top">
        <UiText
          class="top__date"
          :theme="TextTheme.SECONDARY"
          :weight="TextWeight.BOLD"
          :text="$t('Date/time')"
        />
        <UiText
          class="top__sum"
          :theme="TextTheme.SECONDARY"
          :weight="TextWeight.BOLD"
          :text="$t('Sum')"
        />
        <UiText
          class="top__points"
          :theme="TextTheme.SECONDARY"
          :weight="TextWeight.BOLD"
          :text="$t('Points')"
        />
        <UiText
          class="top__type"
          :theme="TextTheme.SECONDARY"
          :weight="TextWeight.BOLD"
          :text="$t('Type')"
        />
        <UiText
          class="top__status"
          :theme="TextTheme.SECONDARY"
          :weight="TextWeight.BOLD"
          :text="$t('Status')"
        />
      </div>
      <div class="orders__body body" v-if="totalItems">
        <div class="body__item" v-for="item in pagedData" :key="item.id">
          <UiText
            class="body__date"
            :theme="TextTheme.SECONDARY"
            :text="formatDate(item.created_at)"
          />
          <UiText
            class="body__sum"
            :weight="TextWeight.BOLD"
            :text="`${item.amount} ${item.currency}`"
          />
          <div class="body__points">
            <div class="body__points-icon _ibg-contain">
              <img src="@/static/images/icons/creadit.webp" />
            </div>
            <UiText class="body__points-text" :weight="TextWeight.BOLD" :text="item.points" />
          </div>
          <UiText class="body__type" :text="$t('Lorem ipsum dolor sit amet')" />
          <div class="body__status" :class="'body__status_' + item.status">
            {{ $t(item.status) }}
          </div>
        </div>
      </div>
    </div>
    <vue-awesome-paginate
      v-if="pageCount > 1"
      v-model="currentPage"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      :max-pages-shown="6"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.orders {
  background-color: var(--bg-secondary-color);
  border-radius: var(--border-radius);
  @media (max-width: $md3) {
    margin: 0px -10px;
  }
  &__content {
    min-width: 0;
    overflow-x: auto;
  }
}

.top {
  display: flex;
  align-items: center;
  gap: 15px;
  @include adaptiveValue('min-height', 40, 30, 1470, 768, 1);
  padding: 0px 15px;

  &__date {
    flex: 0 0 120px;
  }
  &__sum {
    flex: 0 0 100px;
  }
  &__points {
    flex: 0 0 100px;
    margin-right: auto;
  }
  &__type {
    flex: 1 1 auto;
    min-width: 200px;
  }
  &__status {
    flex: 0 0 150px;
  }
}

.body {
  &__item {
    display: flex;
    align-items: center;
    gap: 15px;
    @include adaptiveValue('min-height', 40, 30, 1470, 768, 1);
    padding: 15px;
    @media (max-width: $md3) {
      padding: 15px 10px;
    }
    &:nth-child(odd) {
      background-color: var(--bg-primary-color);
    }
  }
  &__date {
    flex: 0 0 120px;
  }
  &__sum {
    flex: 0 0 100px;
  }
  &__points {
    flex: 0 0 100px;
    margin-right: auto;
    display: flex;
    align-items: center;
    gap: 3px;
    &-icon {
      width: 24px;
      height: 24px;
    }
  }
  &__type {
    flex: 1 1 auto;
    min-width: 200px;
  }
  &__status {
    flex: 0 0 150px;
    font-family: var(--font-family-sans);
    font-size: var(--font-size-base);
    text-transform: capitalize;
    &_pending {
      color: var(--secondary-color);
    }
    &_success {
      color: var(--success-color);
    }
    &_canceled {
      color: var(--error-color);
    }
  }
}

:deep(.pagination-container) {
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
  align-items: center;
  margin-left: auto;
  gap: 8px;
  margin-top: 20px;
  flex-wrap: wrap;
  width: 100%;
  padding-bottom: 10px;
  @media (max-width: $md3) {
    padding-right: 10px;
    padding-left: 10px;
  }

  .paginate-buttons {
    background-color: var(--bg-primary-color, #fff);
    color: var(--text-primary-color, #333);
    border: 1px solid var(--border-color, #ddd);
    border-radius: 8px;
    padding: 6px 12px;
    min-width: 36px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: var(--sixth-color, #f0f0f0);
      color: var(--secondary-color-inverted, #000);
      transform: translateY(-1px);
    }

    &.active-page {
      background-color: var(--sixth-color, #d33);
      color: var(--secondary-color-inverted, #fff);
      border-color: var(--sixth-color, #d33);
      cursor: default;
      transform: none;
    }

    &.disabled-page {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .paginate-ellipsis {
    color: var(--text-secondary-color, #888);
    font-weight: bold;
    user-select: none;
  }
}
</style>
