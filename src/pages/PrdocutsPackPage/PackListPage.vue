<template>
  <main class="packs-page">
    <div class="packs-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/product-list-bg.jpg" alt="" />
    </div>

    <div class="packs-page__inner _cnt">
      <!-- Pack catalog -->
      <div class="packs-page__content content">
        <div class="content__header">
          <h1 class="content__title _h3">
            {{ $t('Card Packs') }}
          </h1>
        </div>

        <div class="content__body">
          <LoadingSpinner v-if="loading" class="content__loader" />

          <div v-else-if="error" class="content__empty empty">
            <h2 class="empty__title _h3">
              {{ $t('Unable to load packs') }}
            </h2>

            <p class="empty__text">
              {{ error }}
            </p>

            <BaseButton
              type="button"
              variant="bordered"
              class="empty__button"
              @click="reloadCatalog"
            >
              {{ $t('Try again') }}
            </BaseButton>
          </div>

          <div v-else-if="packs.length" class="content__items">
            <div v-for="pack in packs" :key="pack.id" class="content__item">
              <PackCard
                :product="pack"
                class="content__card"
                @open="openPackDetails"
              />
            </div>
          </div>

          <div v-else class="content__empty empty">
            <h2 class="empty__title _h3">
              {{ $t('No packs found') }}
            </h2>

            <BaseButton
              type="button"
              variant="bordered"
              class="empty__button"
              @click="resetFilters"
            >
              {{ $t('Clear all') }}
            </BaseButton>
          </div>
        </div>

        <div
          v-if="!loading && packs.length"
          class="content__pagination pagination"
        >
          <div class="pagination__info">
            {{ $t('Results') }}
            {{ resultStart }}–{{ resultEnd }}
            {{ $t('out of') }}
            {{ pagination.total }}
          </div>

          <PaginationComponent
            v-if="totalPages > 1"
            class="pagination__component"
            :total-pages="totalPages"
            :current-page="Number(filters.page)"
            :is-small="isMobileView"
            @update:current-page="onPageChange"
          />
        </div>
      </div>

      <!-- Owned packs -->
      <aside class="packs-page__aside aside">
        <div class="aside__header">
          <h2 class="aside__title _h3">
            {{ $t('My Packs') }}
          </h2>

          <div
            class="aside__search"
            :class="{
              aside__search_active: isOwnedSearchFocused || ownedSearch.length,
            }"
          >
            <BaseInput
              v-model="ownedSearch"
              class="aside__search-input"
              :placeholder="$t('Search')"
              :aria-label="$t('Search my packs')"
              autocomplete="off"
              @focus="isOwnedSearchFocused = true"
              @blur="isOwnedSearchFocused = false"
              @keydown.enter.prevent="applyOwnedSearchImmediately"
            />

            <button
              type="button"
              class="aside__search-button"
              :aria-label="$t('Search my packs')"
              @click="applyOwnedSearchImmediately"
            >
              <SvgIcon :icon="SearchIcon" class="aside__search-icon" />
            </button>
          </div>
        </div>

        <div class="aside__frame">
          <div class="aside__content">
            <LoadingSpinner v-if="ownedLoading" class="owned-packs__loader" />

            <div v-else-if="ownedError" class="owned-packs__state">
              <p class="owned-packs__state-title">
                {{ $t('Unable to load your packs') }}
              </p>

              <p class="owned-packs__state-text">
                {{ ownedError }}
              </p>

              <BaseButton
                type="button"
                variant="bordered"
                class="owned-packs__state-button"
                @click="fetchOwnedPacks"
              >
                {{ $t('Try again') }}
              </BaseButton>
            </div>

            <div
              v-else-if="filteredOwnedPacks.length"
              class="owned-packs__items"
            >
              <!--
                The entire article opens UnpackPackModal.
                It does not open PackDetailsModal.
              -->
              <article
                v-for="pack in filteredOwnedPacks"
                :key="getOwnedPackKey(pack)"
                class="owned-packs__item"
                role="button"
                tabindex="0"
                :aria-label="`${$t('Open')} ${getPackName(pack)}`"
                @click="openUnpackModal(pack)"
                @keydown.enter.prevent="openUnpackModal(pack)"
                @keydown.space.prevent="openUnpackModal(pack)"
              >
                <div class="owned-packs__image">
                  <img :src="getPackImage(pack)" :alt="getPackName(pack)" />
                </div>

                <div class="owned-packs__info">
                  <h3 class="owned-packs__name">
                    {{ getPackName(pack) }}
                  </h3>
                </div>
              </article>
            </div>

            <div v-else class="owned-packs__state">
              <template v-if="hasAppliedOwnedSearch">
                <p class="owned-packs__state-title">
                  {{ $t('No matching packs found') }}
                </p>

                <p class="owned-packs__state-text">
                  {{ $t('Delete the search value and try another pack name.') }}
                </p>
              </template>

              <template v-else>
                <p class="owned-packs__state-title">
                  {{ $t("You don't have any card packs yet.") }}
                </p>

                <p class="owned-packs__state-text">
                  {{
                    $t(
                      'Purchase a pack to open it and increase your chances of winning.',
                    )
                  }}
                </p>
              </template>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Catalog purchase/details modal -->
    <PackDetailsModal
      v-model:show="isPackDetailsOpen"
      :pack-id="selectedPackId"
      :initial-pack="selectedPack"
      @close="closePackDetails"
    />

    <!-- Owned pack unpack modal -->
    <UnpackPackModal
      v-model:show="isUnpackModalOpen"
      :pack-id="selectedOwnedPackId"
      :pack="selectedOwnedPack"
      @opened="handlePackOpened"
      @close="closeUnpackModal"
    />
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import defaultImage from '@/assets/images/default-image.png'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useProductList } from '@/composables/useProductList'
import axios from '@/plugins/axios'

import PackCard from './components/PackCard.vue'
import PackDetailsModal from './modals/PackDetailsModal.vue'
import UnpackPackModal from './modals/UnpackPackModal.vue'

const OWNED_SEARCH_DELAY = 400
const OWNED_PACKS_PER_PAGE = 200

const STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const isMobileView = useMediaQuery('(max-width: 767.98px)')

/*
 * Owned packs
 */
const ownedPacks = ref([])
const ownedLoading = ref(true)
const ownedError = ref('')

/*
 * Owned-pack search
 */
const ownedSearch = ref('')
const appliedOwnedSearch = ref('')
const isOwnedSearchFocused = ref(false)

/*
 * Catalog pack details modal
 */
const selectedPackId = ref(null)
const selectedPack = ref(null)
const isPackDetailsOpen = ref(false)

/*
 * Owned pack unpack modal
 */
const selectedOwnedPackId = ref(null)
const selectedOwnedPack = ref(null)
const isUnpackModalOpen = ref(false)

let ownedSearchTimer = null
let ownedPacksRequestId = 0

const {
  packs,
  loading,
  error,
  filters,
  pagination,
  updateFilters,
  resetFilters: originalResetFilters,
  fetchPacks,
} = useProductList()

const hasAppliedOwnedSearch = computed(() => {
  return appliedOwnedSearch.value.length > 0
})

const totalPages = computed(() => {
  const total = Number(pagination.total) || 0
  const perPage = Math.max(1, Number(filters.perPage) || 1)

  return Math.max(1, Math.ceil(total / perPage))
})

const resultStart = computed(() => {
  if (!packs.value.length || !pagination.total) {
    return 0
  }

  const currentPage = Math.max(1, Number(filters.page) || 1)

  const perPage = Math.max(1, Number(filters.perPage) || packs.value.length)

  return (currentPage - 1) * perPage + 1
})

const resultEnd = computed(() => {
  const total = Number(pagination.total) || 0

  const currentPage = Math.max(1, Number(filters.page) || 1)

  const perPage = Math.max(1, Number(filters.perPage) || packs.value.length)

  return Math.min(currentPage * perPage, total)
})

const onPageChange = page => {
  updateFilters({
    page: Number(page),
  })

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const reloadCatalog = () => {
  fetchPacks()
}

const resetFilters = () => {
  originalResetFilters()
}

/*
 * Supports Laravel resources, paginator responses and
 * older response wrappers.
 */
const getResponseItems = data => {
  const possibleItems = [
    data?.data,
    data?.payload,
    data?.data?.data,
    data?.payload?.data,
    data?.items,
  ]

  return possibleItems.find(Array.isArray) || []
}

const getResponsePack = response => {
  const data = response?.data

  return data?.data || data?.payload || data || null
}

/*
 * Owned inventory records contain:
 *
 * record.id      = pack instance ID
 * record.pack.id = pack template ID
 *
 * The unpack endpoint requires the template ID.
 */
const getPackId = pack => {
  return (
    pack?.pack_id ??
    pack?.product_id ??
    pack?.pack?.id ??
    pack?.product?.id ??
    pack?.id ??
    null
  )
}

const getPackName = pack => {
  return (
    pack?.pack?.name ??
    pack?.product?.name ??
    pack?.name ??
    pack?.title ??
    'Card Pack'
  )
}

const getPackQuantity = pack => {
  const quantity =
    pack?.quantity ??
    pack?.count ??
    pack?.amount ??
    pack?.instances?.length ??
    pack?.pivot?.quantity ??
    1

  return Math.max(0, Number(quantity) || 0)
}

const getOwnedPackKey = pack => {
  const packId = getPackId(pack)

  if (packId) {
    return `owned-pack-${packId}`
  }

  return (
    pack?.instance_uuid ??
    pack?.inventory_id ??
    pack?.player_pack_id ??
    pack?.id ??
    getPackName(pack)
  )
}

const resolveImageUrl = image => {
  if (!image) {
    return defaultImage
  }

  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:') ||
    image.startsWith('blob:')
  ) {
    return image
  }

  if (!STATIC_DOMAIN) {
    return image
  }

  const domain = STATIC_DOMAIN.replace(/\/$/, '')
  const path = image.startsWith('/') ? image : `/${image}`

  return `${domain}${path}`
}

/*
 * Same image order used by PackCard and PackDetailsModal.
 */
const getPackImage = pack => {
  const image =
    pack?.image_details ??
    pack?.pack?.image_details ??
    pack?.product?.image_details ??
    pack?.image ??
    pack?.pack?.image ??
    pack?.product?.image ??
    pack?.image_2 ??
    pack?.pack?.image_2 ??
    pack?.product?.image_2 ??
    pack?.img_url ??
    ''

  return resolveImageUrl(image)
}

/*
 * The API returns one row per unopened pack instance.
 * Group equal pack templates so the sidebar displays a
 * single item with its correct quantity.
 */
const groupOwnedPackInstances = instances => {
  const groupedPacks = new Map()

  instances.forEach(instance => {
    const packId = instance?.pack?.id

    if (!packId) {
      return
    }

    const groupKey = String(packId)
    const existingGroup = groupedPacks.get(groupKey)

    if (existingGroup) {
      existingGroup.quantity += 1
      existingGroup.instances.push(instance)

      return
    }

    groupedPacks.set(groupKey, {
      ...instance,

      /*
       * This is the pack template ID required by:
       *
       * POST /packs/{packId}/open
       */
      pack_id: packId,

      pack: {
        ...instance.pack,
      },

      quantity: 1,
      instances: [instance],

      price: instance?.price_in_game ?? instance?.pack?.price ?? 0,
    })
  })

  return Array.from(groupedPacks.values())
}

/*
 * PackInstanceResource contains pack.image but not
 * image_details. Enrich each unique owned pack using the
 * catalog details endpoint.
 */
const enrichOwnedPack = async pack => {
  const packId = getPackId(pack)

  if (!packId) {
    return pack
  }

  const existingDetailsImage = pack?.image_details ?? pack?.pack?.image_details

  if (existingDetailsImage) {
    return pack
  }

  try {
    const response = await axios.get(`/catalog/packs/${packId}`)

    const details = getResponsePack(response)

    if (!details) {
      return pack
    }

    return {
      ...pack,

      image_details: details.image_details ?? details.image ?? null,

      pack: {
        ...pack.pack,
        ...details,

        id: details.id ?? pack.pack?.id ?? packId,

        image_details:
          details.image_details ?? details.image ?? pack.pack?.image ?? null,
      },

      /*
       * Preserve the price stored on the owned instance.
       */
      price: pack.price ?? pack.price_in_game ?? details.price ?? 0,
    }
  } catch (requestError) {
    console.error(`Unable to load details for pack ${packId}:`, requestError)

    /*
     * The regular inventory image remains usable.
     */
    return pack
  }
}

const fetchOwnedPacks = async () => {
  const requestId = ++ownedPacksRequestId

  ownedLoading.value = true
  ownedError.value = ''

  try {
    const { data } = await axios.get('/players/me/packs', {
      params: {
        per_page: OWNED_PACKS_PER_PAGE,
      },
    })

    if (requestId !== ownedPacksRequestId) {
      return
    }

    const instances = getResponseItems(data)
    const groupedPacks = groupOwnedPackInstances(instances)

    /*
     * One details request per unique pack template.
     */
    const enrichedPacks = await Promise.all(groupedPacks.map(enrichOwnedPack))

    if (requestId !== ownedPacksRequestId) {
      return
    }

    ownedPacks.value = enrichedPacks
  } catch (requestError) {
    if (requestId !== ownedPacksRequestId) {
      return
    }

    console.error('Unable to load owned packs:', requestError)

    if (requestError?.response?.status === 401) {
      ownedPacks.value = []
      ownedError.value = ''

      return
    }

    ownedError.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Unable to load your packs'

    ownedPacks.value = []
  } finally {
    if (requestId === ownedPacksRequestId) {
      ownedLoading.value = false
    }
  }
}

/*
 * Catalog PackCard modal
 */
const openPackDetails = pack => {
  const packId = getPackId(pack)

  if (!packId) {
    console.error('Cannot open pack details: pack ID is missing', pack)

    return
  }

  selectedPack.value = {
    ...pack,
    ...(pack?.pack || {}),

    id: packId,
    name: getPackName(pack),

    image: pack?.pack?.image ?? pack?.image ?? '',

    image_details: pack?.image_details ?? pack?.pack?.image_details ?? '',

    price: pack?.price ?? pack?.price_in_game ?? pack?.pack?.price ?? 0,
  }

  selectedPackId.value = packId
  isPackDetailsOpen.value = true
}

const closePackDetails = () => {
  isPackDetailsOpen.value = false
  selectedPackId.value = null
  selectedPack.value = null
}

/*
 * Owned packs open UnpackPackModal.
 */
const openUnpackModal = pack => {
  const packId = getPackId(pack)

  if (!packId) {
    console.error('Cannot unpack pack: pack template ID is missing', pack)

    return
  }

  selectedOwnedPackId.value = packId
  selectedOwnedPack.value = pack
  isUnpackModalOpen.value = true
}

const closeUnpackModal = () => {
  isUnpackModalOpen.value = false
  selectedOwnedPackId.value = null
  selectedOwnedPack.value = null
}

const handlePackOpened = async ({ packId, cards }) => {
  console.info(`Pack ${packId} opened`, cards)

  /*
   * The API has already:
   *
   * 1. Added all cards to the collection.
   * 2. Marked one pack instance as opened.
   *
   * Refreshing decreases the displayed quantity.
   */
  await fetchOwnedPacks()
}

/*
 * Debounced owned-pack search
 */
const filteredOwnedPacks = computed(() => {
  const search = appliedOwnedSearch.value.toLocaleLowerCase()

  if (!search) {
    return ownedPacks.value
  }

  return ownedPacks.value.filter(pack => {
    const name = String(getPackName(pack)).toLocaleLowerCase()

    return name.includes(search)
  })
})

const applyOwnedSearch = value => {
  appliedOwnedSearch.value = String(value || '')
    .trim()
    .toLocaleLowerCase()
}

const applyOwnedSearchImmediately = () => {
  if (ownedSearchTimer) {
    window.clearTimeout(ownedSearchTimer)
    ownedSearchTimer = null
  }

  applyOwnedSearch(ownedSearch.value)
}

watch(ownedSearch, value => {
  if (ownedSearchTimer) {
    window.clearTimeout(ownedSearchTimer)
  }

  ownedSearchTimer = window.setTimeout(() => {
    applyOwnedSearch(value)
    ownedSearchTimer = null
  }, OWNED_SEARCH_DELAY)
})

onMounted(() => {
  fetchOwnedPacks()
})

onBeforeUnmount(() => {
  ownedPacksRequestId += 1

  if (ownedSearchTimer) {
    window.clearTimeout(ownedSearchTimer)
    ownedSearchTimer = null
  }
})
</script>

<style lang="scss" scoped>
.packs-page {
  @include adaptiveValue('padding-top', 105, 75);
  @include adaptiveValue('padding-bottom', 80, 35);

  position: relative;

  display: flex;
  flex: 1 1 auto;

  width: 100%;
  min-width: 0;
  min-height: 780px;

  background-color: var(--bg-primary-color);

  &__bg {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;

    img {
      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center top;
    }
  }

  &__inner {
    position: relative;
    z-index: 1;

    display: grid;
    align-items: start;
    gap: clamp(20px, 2vw, 34px);
    grid-template-columns:
      minmax(0, 1fr)
      minmax(270px, 330px);

    width: 100%;
  }

  &__content,
  &__aside {
    min-width: 0;
  }

  @media (max-width: $md3) {
    &__inner {
      display: flex;
      flex-direction: column;
    }

    &__aside {
      order: -1;

      width: 100%;
    }

    &__content {
      width: 100%;
    }
  }
}

.content {
  display: flex;
  flex-direction: column;

  min-width: 0;

  &__header {
    min-height: 40px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 26, 18);
    }
  }

  &__title {
    color: var(--primary-color);
    text-align: center;
    text-transform: uppercase;
  }

  &__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    min-height: 430px;
  }

  &__loader {
    margin: auto;
  }

  &__items {
    @include adaptiveValue('margin-left', -5, -2);
    @include adaptiveValue('margin-right', -5, -2);
    @include adaptiveValue('row-gap', 10, 4);

    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  &__item {
    @include adaptiveValue('padding-left', 5, 2);
    @include adaptiveValue('padding-right', 5, 2);
    
    flex: 0 1 20%;

    min-width: 0;

    @media (max-width: $md2) {
      flex-basis: 25%;
    }

    @media (max-width: 1099.98px) {
      flex-basis: 33.333%;
    }

    @media (max-width: $md4) {
      flex-basis: 50%;
    }

    @media (max-width: $md6) {
      flex-basis: 100%;
    }
  }

  &__card {
    width: 100%;
    height: 100%;
  }

  &__empty {
    margin: auto;
  }

  &__pagination {
    @include adaptiveValue('margin-top', 45, 25);
  }
}

.aside {
  position: sticky;
  top: 90px;

  min-width: 0;
  height: fit-content;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    min-height: 40px;

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__title {
    flex: 0 0 auto;

    color: var(--hint-primary-color);
    text-transform: uppercase;
  }

  &__search {
    position: relative;

    width: min(100%, 155px);

    :deep(.base-input__control) {
      min-height: 36px;

      padding-right: 42px;
      padding-left: 10px;

      border-color: transparent;
      background-color: transparent;

      &::placeholder {
        opacity: 0;
      }

      &:focus {
        border-color: var(--border-fourth-color);
        background-color: var(--bg-secondary-color);

        &::placeholder {
          opacity: 1;
        }
      }
    }

    &_active {
      :deep(.base-input__control) {
        border-color: var(--border-fourth-color);
        background-color: var(--bg-secondary-color);

        &::placeholder {
          opacity: 1;
        }
      }
    }

    @media (any-hover: hover) {
      &:hover {
        :deep(.base-input__control) {
          border-color: var(--border-fourth-color);
          background-color: var(--bg-secondary-color);

          &::placeholder {
            opacity: 1;
          }
        }
      }
    }
  }

  &__search-button {
    position: absolute;
    top: 50%;
    right: 4px;
    z-index: 2;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 34px;
    height: 34px;

    padding: 0;

    border: 0;
    border-radius: 4px;
    outline: none;
    background-color: transparent;

    color: var(--hint-primary-color);

    cursor: pointer;

    transform: translateY(-50%);
    transition:
      color 0.3s ease,
      background-color 0.3s ease;

    &:focus-visible {
      outline: 1px solid var(--hint-secondary-color);
      outline-offset: 1px;
    }

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--border-fourth-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  &__search-icon {
    width: 18px;
    height: 18px;
  }

  &__frame {
    padding: 5px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 8px;
    background-color: rgb(13 14 15 / 84%);
  }

  &__content {
    min-height: 510px;

    padding: clamp(14px, 1.5vw, 22px);

    border: 1px solid var(--border-secondary-color);
    border-radius: 5px;
    background-color: rgb(28 29 29 / 86%);
  }

  @media (max-width: $md3) {
    position: relative;
    top: auto;
  }

  @media (max-width: $md4) {
    &__header {
      flex-wrap: wrap;
    }

    &__search {
      width: min(100%, 220px);
    }

    &__content {
      min-height: 300px;
    }
  }

  @media (max-width: $md6) {
    &__title {
      flex: 1 1 100%;
    }

    &__search {
      width: 100%;
    }
  }
}

.owned-packs {
  min-width: 0;

  &__loader {
    display: flex;

    margin: 50px auto;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__item {
    position: relative;

    display: grid;
    align-items: center;
    gap: 10px;
    grid-template-columns: 58px minmax(0, 1fr);

    padding: 8px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 4px;
    background-color: var(--bg-secondary-color);

    transition:
      border-color 0.3s ease,
      transform 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--border-secondary-color);

        transform: translateY(-2px);
      }
    }
  }

  &__image {
    overflow: hidden;

    width: 58px;
    aspect-ratio: 0.75;

    img {
      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }

  &__info {
    min-width: 0;
  }

  &__name {
    overflow: hidden;

    color: var(--hint-primary-color);
    font-family: var(--font-spectral-sc);
    font-size: 12px;
    font-weight: 400;
    line-height: 130%;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__quantity {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    color: var(--secondary-color);
    font-size: 11px;

    strong {
      color: var(--primary-color);
      font-size: 13px;
      font-weight: 500;
    }
  }

  &__link {
    position: absolute;
    inset: 0;
    z-index: 2;

    width: 100%;
    height: 100%;

    padding: 0;

    border: 0;
    border-radius: inherit;
    background-color: transparent;

    cursor: pointer;

    &:focus-visible {
      outline: 1px solid var(--hint-secondary-color);
      outline-offset: 2px;
    }
  }

  &__state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 180px;

    padding: 20px 5px;

    text-align: center;
  }

  &__state-title {
    max-width: 230px;

    color: var(--secondary-color);
    font-size: 13px;
    line-height: 145%;

    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__state-text {
    max-width: 230px;

    color: var(--secondary-color);
    font-size: 12px;
    line-height: 145%;

    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }

  &__state-button {
    width: min(100%, 170px);
  }

  @media (max-width: $md3) {
    &__items {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: $md4) {
    &__items {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: $md6) {
    &__items {
      grid-template-columns: 1fr;
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 350px;

  padding: 30px;

  text-align: center;

  &__title {
    color: var(--primary-color);

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__text {
    max-width: 420px;

    color: var(--secondary-color);
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }

  &__button {
    width: min(100%, 210px);
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  &__info {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
  }

  @media (max-width: $md5) {
    flex-direction: column;

    &__info {
      text-align: center;
    }
  }
}
</style>
