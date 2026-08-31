<template>
  <main class="collection-page">
    <div class="collection-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/product-list-bg.jpg" alt="" />
    </div>

    <button
      type="button"
      class="collection-page__filters-toggle"
      :class="{
        'collection-page__filters-toggle_open': isFiltersOpen,
      }"
      :aria-expanded="isFiltersOpen"
      aria-controls="collection-filters"
      :aria-label="isFiltersOpen ? $t('Close filters') : $t('Open filters')"
      @click="toggleFilters"
    >
      <SvgIcon
        :icon="isFiltersOpen ? CloseIcon : FilterIcon"
        class="collection-page__filters-toggle-icon"
      />
    </button>

    <Transition name="filters-overlay">
      <button
        v-if="isFiltersOpen"
        type="button"
        class="collection-page__filters-overlay"
        :aria-label="$t('Close filters')"
        @click="closeFilters"
      />
    </Transition>

    <div class="collection-page__inner _cnt">
      <aside
        id="collection-filters"
        class="collection-page__aside collection-aside"
        :class="{
          'collection-aside_open': isFiltersOpen,
        }"
        :aria-hidden="isFiltersMobile && !isFiltersOpen"
      >
        <div class="collection-aside__header">
          <h1 class="collection-aside__title _h3">
            {{ $t('Filters') }}
          </h1>

          <button
            type="button"
            class="collection-aside__clear _link"
            @click="resetFilters"
          >
            {{ $t('Clear all filters') }}
          </button>

          <button
            type="button"
            class="collection-aside__close"
            :aria-label="$t('Close filters')"
            @click="closeFilters"
          >
            <SvgIcon :icon="CloseIcon" class="collection-aside__close-icon" />
          </button>
        </div>

        <div class="collection-aside__wrapper">
          <div class="collection-aside__content">
            <nav
              class="collection-aside__tabs"
              :aria-label="$t('Collection type')"
            >
              <RouterLink
                :to="{
                  name: 'MyCardsPage',
                  query: createCollectionQuery('bought'),
                }"
                class="collection-aside__tab"
                :class="{
                  'collection-aside__tab_active': !isRentedCollection,
                }"
                :aria-current="!isRentedCollection ? 'page' : undefined"
                @click="closeFilters"
              >
                {{ $t('Bought') }}
              </RouterLink>

              <RouterLink
                :to="{
                  name: 'MyCardsPage',
                  query: createCollectionQuery('rented'),
                }"
                class="collection-aside__tab"
                :class="{
                  'collection-aside__tab_active': isRentedCollection,
                }"
                :aria-current="isRentedCollection ? 'page' : undefined"
                @click="closeFilters"
              >
                {{ $t('Rented') }}
              </RouterLink>
            </nav>

            <div class="collection-aside__section filter-group">
              <h2 class="filter-group__title">
                {{ $t('Heroes') }}
              </h2>

              <BaseDropdown
                class="filter-group__dropdown"
                :label="selectedHeroOption?.label || $t('All')"
                :placeholder="!selectedHeroOption"
                variant="aside"
                bordered
                absolute
              >
                <template #default="{ close }">
                  <button
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': collectionFilters.hero === '',
                    }"
                    role="option"
                    :aria-selected="collectionFilters.hero === ''"
                    @click="selectHero('', close)"
                  >
                    {{ $t('All') }}
                  </button>

                  <button
                    v-for="option in heroOptions"
                    :key="option.value"
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': isSelected(
                        option.value,
                        collectionFilters.hero,
                      ),
                    }"
                    role="option"
                    :aria-selected="
                      isSelected(option.value, collectionFilters.hero)
                    "
                    @click="selectHero(option.value, close)"
                  >
                    {{ option.label }}
                  </button>
                </template>
              </BaseDropdown>
            </div>

            <div class="collection-aside__section filter-group">
              <h2 class="filter-group__title">
                {{ $t('Rarity') }}
              </h2>

              <BaseDropdown
                class="filter-group__dropdown"
                :label="
                  selectedRarityOption?.label
                    ? formatOptionLabel(selectedRarityOption.label)
                    : $t('All')
                "
                :placeholder="!selectedRarityOption"
                variant="aside"
                bordered
                absolute
              >
                <template #default="{ close }">
                  <button
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected':
                        collectionFilters.rarity === '',
                    }"
                    role="option"
                    :aria-selected="collectionFilters.rarity === ''"
                    @click="selectRarity('', close)"
                  >
                    {{ $t('All') }}
                  </button>

                  <button
                    v-for="option in rarityOptions"
                    :key="option.value"
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': isSelected(
                        option.value,
                        collectionFilters.rarity,
                      ),
                    }"
                    role="option"
                    :aria-selected="
                      isSelected(option.value, collectionFilters.rarity)
                    "
                    @click="selectRarity(option.value, close)"
                  >
                    {{ formatOptionLabel(option.label) }}
                  </button>
                </template>
              </BaseDropdown>
            </div>

            <div class="collection-aside__section filter-group">
              <h2 class="filter-group__title">
                {{ $t('Card Type') }}
              </h2>

              <BaseDropdown
                class="filter-group__dropdown"
                :label="
                  selectedTypeOption?.label
                    ? formatOptionLabel(selectedTypeOption.label)
                    : $t('All')
                "
                :placeholder="!selectedTypeOption"
                variant="aside"
                bordered
                absolute
              >
                <template #default="{ close }">
                  <button
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': collectionFilters.type === '',
                    }"
                    role="option"
                    :aria-selected="collectionFilters.type === ''"
                    @click="selectType('', close)"
                  >
                    {{ $t('All') }}
                  </button>

                  <button
                    v-for="option in typeOptions"
                    :key="option.value"
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': isSelected(
                        option.value,
                        collectionFilters.type,
                      ),
                    }"
                    role="option"
                    :aria-selected="
                      isSelected(option.value, collectionFilters.type)
                    "
                    @click="selectType(option.value, close)"
                  >
                    {{ formatOptionLabel(option.label) }}
                  </button>
                </template>
              </BaseDropdown>
            </div>

            <div class="collection-aside__section filter-group">
              <h2 class="filter-group__title">
                {{ $t('Frame Type') }}
              </h2>

              <BaseDropdown
                class="filter-group__dropdown"
                :label="
                  selectedFrameOption?.label
                    ? formatOptionLabel(selectedFrameOption.label)
                    : $t('All')
                "
                :placeholder="!selectedFrameOption"
                variant="aside"
                bordered
                absolute
              >
                <template #default="{ close }">
                  <button
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected':
                        collectionFilters.frameType === '',
                    }"
                    role="option"
                    :aria-selected="collectionFilters.frameType === ''"
                    @click="selectFrameType('', close)"
                  >
                    {{ $t('All') }}
                  </button>

                  <button
                    v-for="option in frameOptions"
                    :key="option.value"
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': isSelected(
                        option.value,
                        collectionFilters.frameType,
                      ),
                    }"
                    role="option"
                    :aria-selected="
                      isSelected(option.value, collectionFilters.frameType)
                    "
                    @click="selectFrameType(option.value, close)"
                  >
                    {{ formatOptionLabel(option.label) }}
                  </button>
                </template>
              </BaseDropdown>
            </div>

            <div
              v-if="isRentedCollection"
              class="collection-aside__section filter-group"
            >
              <h2 class="filter-group__title">
                {{ $t('Rental Status') }}
              </h2>

              <BaseDropdown
                class="filter-group__dropdown"
                :label="
                  selectedRentalStatusOption?.label
                    ? $t(selectedRentalStatusOption.label)
                    : $t('All')
                "
                :placeholder="!selectedRentalStatusOption"
                variant="aside"
                bordered
                absolute
              >
                <template #default="{ close }">
                  <button
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected': filters.rentalStatus === '',
                    }"
                    role="option"
                    :aria-selected="filters.rentalStatus === ''"
                    @click="selectRentalStatus('', close)"
                  >
                    {{ $t('All') }}
                  </button>

                  <button
                    v-for="option in rentalStatusOptions"
                    :key="option.value"
                    type="button"
                    class="dropdown-option"
                    :class="{
                      'dropdown-option_selected':
                        option.value === filters.rentalStatus,
                    }"
                    role="option"
                    :aria-selected="option.value === filters.rentalStatus"
                    @click="selectRentalStatus(option.value, close)"
                  >
                    {{ $t(option.label) }}
                  </button>
                </template>
              </BaseDropdown>
            </div>

            <BaseButton
              type="button"
              class="collection-aside__apply"
              variant="bordered"
              @click="applyFilters"
            >
              {{ $t('Apply') }}
            </BaseButton>
          </div>
        </div>
      </aside>

      <div class="collection-page__content collection-content">
        <div class="collection-content__top">
          <BaseDropdown
            class="collection-content__sort"
            :label="$t(selectedSortOption?.label || 'Sort by')"
            :placeholder="!selectedSortOption"
            variant="aside"
            bordered
            absolute
          >
            <template #default="{ close }">
              <button
                v-for="option in COLLECTION_SORT_OPTIONS"
                :key="option.value"
                type="button"
                class="dropdown-option"
                :class="{
                  'dropdown-option_selected': option.value === filters.sort,
                }"
                role="option"
                :aria-selected="option.value === filters.sort"
                @click="selectSort(option.value, close)"
              >
                {{ $t(option.label) }}
              </button>
            </template>
          </BaseDropdown>

          <BaseInput
            v-model="collectionFilters.search"
            class="collection-content__search"
            :class="{
              'collection-content__search_filled':
                collectionFilters.search.trim().length > 0,
            }"
            :placeholder="$t('Search')"
          >
            <template #suffix>
              <SearchIcon
                class="collection-content__search-icon"
                aria-hidden="true"
              />
            </template>
          </BaseInput>
        </div>

        <div class="collection-content__body">
          <LoadingSpinner
            v-if="loading || !initialized"
            class="collection-content__loader"
          />

          <div
            v-else-if="error"
            class="collection-content__empty collection-empty"
          >
            <p class="collection-empty__title _h3">
              {{ $t(error) }}
            </p>

            <BaseButton
              type="button"
              class="collection-empty__button"
              variant="bordered"
              @click="reloadCards"
            >
              {{ $t('Try again') }}
            </BaseButton>
          </div>

          <div
            v-else-if="visibleProducts.length"
            class="collection-content__items"
          >
            <div
              v-for="product in visibleProducts"
              :key="getProductKey(product)"
              class="collection-content__item"
            >
              <MyProductCard
                class="collection-content__card"
                :product="product"
                @open="openProduct"
              />
            </div>
          </div>

          <div v-else class="collection-content__empty collection-empty">
            <p class="collection-empty__title _h3">
              {{
                isRentedCollection
                  ? $t('No rented cards found')
                  : $t('No bought cards found')
              }}
            </p>

            <p class="collection-empty__description">
              <template v-if="hasLocalFilters">
                {{ $t('Try changing or clearing your collection filters.') }}
              </template>

              <template v-else-if="isRentedCollection">
                {{ $t('Your rented cards will appear here.') }}
              </template>

              <template v-else>
                {{ $t('Your purchased cards will appear here.') }}
              </template>
            </p>

            <BaseButton
              v-if="hasLocalFilters"
              type="button"
              class="collection-empty__button"
              variant="bordered"
              @click="resetFilters"
            >
              {{ $t('Clear all') }}
            </BaseButton>
          </div>
        </div>

        <div
          v-if="showPagination"
          class="collection-content__pagination collection-pagination"
        >
          <p class="collection-pagination__info">
            {{ $t('Results') }}
            {{ pagination.from }}–{{ pagination.to }}
            {{ $t('out of') }}
            {{ pagination.total }}
          </p>

          <PaginationComponent
            class="collection-pagination__component"
            :total-pages="totalPages"
            :current-page="Number(filters.page)"
            :is-small="isMobileView"
            @update:current-page="onPageChange"
          />
        </div>
      </div>
    </div>
  </main>

  <MyCardDetailsModal
    v-model:show="isProductDetailsOpen"
    :product-id="selectedProductId"
    :collection-item="selectedCollectionItem"
    :rented="isRentedCollection"
    @close="closeProduct"
    @sold="handleCardSold"
  />
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseDropdown from '@/components/base/BaseDropdown.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { CloseIcon } from '@/components/icons'
import SearchIcon from '@/components/icons/SearchIcon.vue'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useProductList } from '@/composables/useProductList'
import { useHeroesStore } from '@/stores/heroes'
import { useNavigationStore } from '@/stores/navigation'
import MyProductCard from './components/MyProductCard.vue'
import MyCardDetailsModal from './modals/MyCardDetailsModal.vue'

const FilterIcon = `
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6H20"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M7 12H17"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M10 18H14"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <circle
      cx="8"
      cy="6"
      r="2"
      fill="#07080e"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <circle
      cx="15"
      cy="12"
      r="2"
      fill="#07080e"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <circle
      cx="12"
      cy="18"
      r="2"
      fill="#07080e"
      stroke="currentColor"
      stroke-width="1.5"
    />
  </svg>
`

const rentalStatusOptions = [
  {
    value: 'active',
    label: 'Active',
  },
  {
    value: 'expired',
    label: 'Expired',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
  },
]

const route = useRoute()
const heroesStore = useHeroesStore()
const navigationStore = useNavigationStore()

const isMobileView = useMediaQuery('(max-width: 767.98px)')

const isFiltersMobile = useMediaQuery('(max-width: 991.98px)')

const { isFiltersOpen } = storeToRefs(navigationStore)

const {
  COLLECTION_SORT_OPTIONS,

  collectionMode,
  isRentedCollection,
  collectionProducts,

  loading,
  error,
  initialized,

  filters,
  availableFilters,
  pagination,

  updateFilters,
  resetFilters: resetStoreFilters,
  fetchCollectionProducts,
} = useProductList()

/*
 * Modal state
 */
const selectedProductId = ref(null)
const selectedCollectionItem = ref(null)
const isProductDetailsOpen = ref(false)

/*
 * Local UI filters
 */
const collectionFilters = reactive({
  search: '',
  hero: '',
  rarity: '',
  type: '',
  frameType: '',
})

const appliedFilters = reactive({
  hero: '',
  rarity: '',
  type: '',
  frameType: '',
})

const normalizeValue = value => {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

const isSelected = (value, selectedValue) => {
  return normalizeValue(value) === normalizeValue(selectedValue)
}

const formatOptionLabel = value => {
  if (!value) {
    return ''
  }

  const text = String(value).replaceAll('_', ' ').trim()

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/*
 * Normalizes the different response shapes returned
 * for bought and rented cards.
 */
const getCard = product => {
  return (
    product?.card ||
    product?.product?.card ||
    product?.product ||
    product?.item?.card ||
    product?.item ||
    product ||
    {}
  )
}

/*
 * This must return the actual catalog card ID,
 * not the card-instance or rental ID.
 */
const getCardId = product => {
  const card = getCard(product)

  return (
    card?.id ??
    product?.card_id ??
    product?.product_id ??
    product?.item_id ??
    null
  )
}

const getProductKey = product => {
  return (
    product?.rental_id ??
    product?.instance_uuid ??
    product?.id ??
    `${collectionMode.value}-${getCardId(product)}`
  )
}

const getCardName = product => {
  const card = getCard(product)

  return card?.name || card?.title || product?.card_name || product?.name || ''
}

const getCardHeroId = product => {
  const card = getCard(product)

  return (
    card?.hero_id ??
    card?.hero?.id ??
    product?.hero_id ??
    product?.hero?.id ??
    ''
  )
}

const getCardRarity = product => {
  const card = getCard(product)

  return (
    card?.rarity?.name ??
    card?.rarity?.slug ??
    card?.rarity ??
    product?.rarity?.name ??
    product?.rarity ??
    ''
  )
}

const getCardType = product => {
  const card = getCard(product)

  return (
    card?.type?.name ??
    card?.type?.slug ??
    card?.type ??
    product?.type?.name ??
    product?.type ??
    ''
  )
}

const getCardFrameId = product => {
  const card = getCard(product)

  return (
    card?.card_frame_set_id ??
    card?.frame_type?.id ??
    card?.frame?.id ??
    product?.card_frame_set_id ??
    product?.frame_type_id ??
    ''
  )
}

/*
 * Dropdown options
 */
const heroOptions = computed(() => {
  return (heroesStore.heroes || []).map(hero => ({
    label: hero.name,
    value: hero.id,
  }))
})

const rarityOptions = computed(() => {
  return Array.isArray(availableFilters.rarities)
    ? availableFilters.rarities
    : []
})

const typeOptions = computed(() => {
  return Array.isArray(availableFilters.types) ? availableFilters.types : []
})

const frameOptions = computed(() => {
  return Array.isArray(availableFilters.frameTypes)
    ? availableFilters.frameTypes
    : []
})

const selectedHeroOption = computed(() => {
  return heroOptions.value.find(option => {
    return isSelected(option.value, collectionFilters.hero)
  })
})

const selectedRarityOption = computed(() => {
  return rarityOptions.value.find(option => {
    return isSelected(option.value, collectionFilters.rarity)
  })
})

const selectedTypeOption = computed(() => {
  return typeOptions.value.find(option => {
    return isSelected(option.value, collectionFilters.type)
  })
})

const selectedFrameOption = computed(() => {
  return frameOptions.value.find(option => {
    return isSelected(option.value, collectionFilters.frameType)
  })
})

const selectedSortOption = computed(() => {
  return COLLECTION_SORT_OPTIONS.find(option => {
    return option.value === filters.sort
  })
})

const selectedRentalStatusOption = computed(() => {
  return rentalStatusOptions.find(option => {
    return option.value === filters.rentalStatus
  })
})

/*
 * Whether the user currently has active local filters.
 */
const hasLocalFilters = computed(() => {
  return Boolean(
    collectionFilters.search.trim() ||
    appliedFilters.hero ||
    appliedFilters.rarity ||
    appliedFilters.type ||
    appliedFilters.frameType ||
    filters.rentalStatus,
  )
})

/*
 * Apply client-side filters to the products returned
 * by the current collection request.
 */
const visibleProducts = computed(() => {
  const search = normalizeValue(collectionFilters.search)

  return collectionProducts.value.filter(product => {
    if (search && !normalizeValue(getCardName(product)).includes(search)) {
      return false
    }

    if (
      appliedFilters.hero &&
      !isSelected(getCardHeroId(product), appliedFilters.hero)
    ) {
      return false
    }

    if (
      appliedFilters.rarity &&
      !isSelected(getCardRarity(product), appliedFilters.rarity)
    ) {
      return false
    }

    if (
      appliedFilters.type &&
      !isSelected(getCardType(product), appliedFilters.type)
    ) {
      return false
    }

    if (
      appliedFilters.frameType &&
      !isSelected(getCardFrameId(product), appliedFilters.frameType)
    ) {
      return false
    }

    return true
  })
})

/*
 * Pagination
 */
const totalPages = computed(() => {
  const total = Number(pagination.total || 0)

  const perPage = Math.max(1, Number(filters.perPage) || 1)

  return Math.max(1, Math.ceil(total / perPage))
})

const showPagination = computed(() => {
  return (
    !loading.value &&
    collectionProducts.value.length > 0 &&
    Number(pagination.total || 0) > Number(filters.perPage || 0)
  )
})

/*
 * Creates the route query for Bought/Rented tabs.
 */
const createCollectionQuery = mode => {
  const query = {
    ...route.query,
  }

  /*
   * Always return to page one when the
   * collection type changes.
   */
  delete query.page
  delete query.status

  if (mode === 'rented') {
    query.collection = 'rented'
  } else {
    delete query.collection
  }

  return query
}

/*
 * Filter dropdown handlers
 */
const selectHero = (value, close) => {
  collectionFilters.hero = value
  close()
}

const selectRarity = (value, close) => {
  collectionFilters.rarity = value
  close()
}

const selectType = (value, close) => {
  collectionFilters.type = value
  close()
}

const selectFrameType = (value, close) => {
  collectionFilters.frameType = value
  close()
}

const selectRentalStatus = async (value, close) => {
  close()

  if (filters.rentalStatus === value) {
    return
  }

  await updateFilters({
    rentalStatus: value,
    page: 1,
  })
}

const applyFilters = () => {
  appliedFilters.hero = collectionFilters.hero

  appliedFilters.rarity = collectionFilters.rarity

  appliedFilters.type = collectionFilters.type

  appliedFilters.frameType = collectionFilters.frameType

  closeFilters()
}

const selectSort = async (value, close) => {
  close()

  if (filters.sort === value) {
    return
  }

  await updateFilters({
    sort: value,
    page: 1,
  })
}

const clearLocalFilters = () => {
  collectionFilters.search = ''
  collectionFilters.hero = ''
  collectionFilters.rarity = ''
  collectionFilters.type = ''
  collectionFilters.frameType = ''

  appliedFilters.hero = ''
  appliedFilters.rarity = ''
  appliedFilters.type = ''
  appliedFilters.frameType = ''
}

const resetFilters = async () => {
  clearLocalFilters()

  await resetStoreFilters()

  closeFilters()
}

const reloadCards = async () => {
  await fetchCollectionProducts({
    debounced: false,
  })
}

const onPageChange = async page => {
  const normalizedPage = Number(page)

  if (
    !Number.isInteger(normalizedPage) ||
    normalizedPage < 1 ||
    normalizedPage === Number(filters.page)
  ) {
    return
  }

  await updateFilters({
    page: normalizedPage,
  })

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

/*
 * Modal handlers
 */
const openProduct = product => {
  const productId = getCardId(product)

  if (!productId) {
    console.error('Cannot open card details modal: card ID is missing', product)

    return
  }

  /*
   * Save the complete collection response item.
   * The modal returns it again with the "sold" event.
   */
  selectedCollectionItem.value = product
  selectedProductId.value = productId
  isProductDetailsOpen.value = true
}

const closeProduct = () => {
  isProductDetailsOpen.value = false
  selectedProductId.value = null
  selectedCollectionItem.value = null
}

/*
 * Called by @sold on MyCardDetailsModal.
 */
const handleCardSold = async saleData => {
  try {
    /*
     * Refresh the current Bought collection.
     * Reserved cards should no longer be counted
     * as available for another sale.
     */
    await fetchCollectionProducts({
      debounced: false,
    })

    console.log('Card sale successfully created:', saleData)
  } catch (refreshError) {
    console.error(
      'Unable to refresh collection after selling card:',
      refreshError,
    )
  }
}

/*
 * Mobile filters
 */
const toggleFilters = () => {
  navigationStore.toggleFilters()
}

const closeFilters = () => {
  navigationStore.closeFilters()
}

/*
 * Close the filter drawer when leaving mobile size.
 */
watch(isFiltersMobile, isMobile => {
  if (!isMobile) {
    closeFilters()
  }
})

/*
 * Clear filters and close the modal when switching
 * between Bought and Rented collections.
 */
watch(collectionMode, () => {
  clearLocalFilters()
  closeProduct()
  closeFilters()
})

onBeforeUnmount(() => {
  closeProduct()
  closeFilters()
})
</script>

<style lang="scss" scoped>
.collection-page {
  @include adaptiveValue('margin-top', 77, 50, 1840, 1370, 1);
  @include adaptiveValue('padding-top', 20, 25);
  @include adaptiveValue('padding-bottom', 50, 25);

  position: relative;

  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  min-width: 0;
  min-height: 100vh;

  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;

    width: 100%;
    height: 80%;

    pointer-events: none;
  }

  &__inner {
    @include adaptiveValue('gap', 18, 10, 1840, 1370, 1);

    display: flex;

    width: 100%;
    min-width: 0;
  }

  &__aside {
    @include adaptiveValue('min-width', 328, 300, 1840, 1370, 1);
    @include adaptiveValue('max-width', 328, 300, 1840, 1370, 1);
    position: relative;
    z-index: 1;
  }

  &__content {
    flex: 1 1 auto;

    min-width: 0;
  }

  &__filters-toggle {
    position: fixed;
    top: 45%;
    right: 10px;
    z-index: 4;

    display: none;
    align-items: center;
    justify-content: center;

    width: 45px;
    height: 45px;

    padding: 0;

    border: 1px solid var(--border-priamry-color);
    border-radius: 4px;
    outline: none;
    background-color: var(--bg-secondary-color);
    box-shadow:
      0 6px 20px rgb(0 0 0 / 45%),
      inset 0 0 12px rgb(179 154 107 / 10%);

    color: var(--hint-primary-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease;

    &_open {
      border-color: var(--hint-primary-color);
      background: var(--hint-gradient);

      color: var(--bg-primary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-secondary-color);

        color: var(--hint-secondary-color);
      }

      &_open:hover {
        color: var(--bg-primary-color);
      }
    }

    @media (max-width: $md3) {
      display: flex;
    }
  }

  &__filters-toggle-icon {
    display: flex;

    width: 22px;
    height: 22px;

    color: inherit;

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__filters-overlay {
    position: fixed;
    inset: 50px 0 0;
    z-index: 3;

    display: none;

    width: 100%;
    height: calc(100dvh - 50px);

    padding: 0;

    border: 0;
    outline: none;
    background-color: rgb(0 0 0 / 72%);

    backdrop-filter: blur(3px);

    @media (max-width: $md3) {
      display: block;
    }
  }

  @media (max-width: $md3) {
    &__inner {
      display: block;
    }
  }
}

.collection-aside {
  height: fit-content;

  &__header {
    @include adaptiveValue('padding-left', 28, 15);
    @include adaptiveValue('padding-right', 28, 15);

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    min-height: 52px;
  }

  &__title {
    color: var(--hint-primary-color);
  }

  &__clear {
    color: var(--hint-secondary-color);
    font-size: 13px;
  }

  &__close {
    display: none;
  }

  &__wrapper {
    padding: 5px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 6px;
    background-color: var(--bg-fourth-color);
  }

  &__content {
    @include adaptiveValue('padding', 22, 15);

    min-height: 620px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 4px;
    background-color: var(--bg-fifth-color);
  }

  &__tabs {
    display: flex;

    width: 100%;

    margin-bottom: 28px;
    padding: 3px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 4px;
    background-color: var(--bg-primary-color);
  }

  &__tab {
    display: flex;
    flex: 1 1 50%;
    align-items: center;
    justify-content: center;

    min-height: 34px;

    padding: 5px 10px;

    border-radius: 3px;

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    text-transform: uppercase;

    transition:
      color 0.3s ease,
      background-color 0.3s ease;

    &_active {
      background: var(--hint-gradient);

      color: var(--bg-primary-color);

      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:not(&_active):hover {
        background-color: var(--border-fourth-color);

        color: var(--primary-color);
      }
    }
  }

  &__section {
    &:not(:last-child) {
      margin-bottom: 26px;
    }
  }

  &__apply {
    width: 100%;
  }

  @media (max-width: $md3) {
    position: fixed;
    top: 50px;
    bottom: auto;
    left: 0;
    z-index: 21;

    visibility: hidden;
    overflow-x: hidden;
    overflow-y: hidden;

    width: min(90vw, 360px);
    max-width: none;
    height: calc(100dvh - 50px);
    min-height: 0;
    max-height: calc(100dvh - 50px);

    padding: 12px;

    background-color: var(--bg-primary-color);
    box-shadow: 15px 0 40px rgb(0 0 0 / 50%);

    pointer-events: none;

    transform: translateX(-110%);
    transition:
      transform 0.3s ease,
      visibility 0.3s ease;

    overscroll-behavior: contain;
    scrollbar-color: var(--hint-primary-color) var(--bg-primary-color);
    scrollbar-width: thin;

    &_open {
      visibility: visible;
      overflow-y: auto;

      pointer-events: auto;

      transform: translateX(0);
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background-color: var(--bg-primary-color);
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background-color: var(--hint-primary-color);
    }

    &__header {
      padding: 0 0 12px;
    }

    &__close {
      display: flex;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;

      width: 38px;
      height: 38px;

      color: var(--hint-primary-color);
    }

    &__close-icon {
      width: 18px;
      height: 18px;
    }

    &__wrapper {
      min-height: 0;
    }

    &__content {
      min-height: 0;
    }
  }
}

.filter-group {
  &__title {
    margin-bottom: 9px;

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
  }

  &__dropdown {
    width: 100%;
  }
}

.collection-content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  min-width: 0;

  &__top {
    display: flex;
    justify-content: space-between;
    gap: 20px;

    margin-bottom: 21px;
  }

  &__sort {
    width: 100%;
    max-width: 205px;
  }

  &__search {
    width: min(100%, 350px);

    :deep(.base-input__control) {
      @media (any-hover: hover) {
        border-color: transparent;
        background-color: transparent;

        &::placeholder {
          opacity: 0;
        }

        &:hover,
        &:focus {
          border-color: var(--border-fourth-color);
          background-color: var(--bg-secondary-color);

          &::placeholder {
            opacity: 1;
          }
        }
      }
    }

    &_filled {
      :deep(.base-input__control) {
        border-color: var(--border-fourth-color);
        background-color: var(--bg-secondary-color);

        &::placeholder {
          opacity: 1;
        }
      }

      .collection-content__search-icon {
        color: var(--hint-secondary-color);
      }
    }
  }

  &__search-icon {
    display: block;

    width: 18px;
    height: 18px;

    color: var(--third-color);

    pointer-events: none;

    transition: color 0.3s ease;
  }

  &__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    min-height: 350px;

    margin-bottom: 50px;
  }

  &__loader {
    display: flex;

    margin: auto;
  }

  &__items {
    @include adaptiveValue('margin-left', -5, -2);
    @include adaptiveValue('margin-right', -5, -2);
    @include adaptiveValue('row-gap', 10, 4);

    display: flex;
    flex-wrap: wrap;
  }

  &__item {
    @include adaptiveValue('padding-left', 5, 2);
    @include adaptiveValue('padding-right', 5, 2);

    flex: 0 1 14.285%;

    min-width: 0;

    @media (max-width: $md1) {
      flex-basis: 16.666%;
    }

    @media (max-width: 1499.98px) {
      flex-basis: 20%;
    }

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

  @media (max-width: $md7) {
    &__top {
      flex-direction: column;
    }

    &__sort,
    &__search {
      width: 100%;
      max-width: none;
    }
  }
}

.collection-empty {
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  max-width: 480px;

  padding: 30px 15px;

  text-align: center;

  &__title {
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__description {
    margin-bottom: 18px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 150%;
  }

  &__button {
    width: min(100%, 250px);
  }
}

.collection-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  &__info {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
  }

  @media (max-width: $md4) {
    flex-direction: column;
    align-items: stretch;

    &__info {
      text-align: center;
    }

    &__component {
      align-self: center;
    }
  }
}

.dropdown-option {
  display: flex;
  align-items: center;

  width: 100%;
  min-height: 40px;

  padding: 10px 12px;

  border: 0;
  border-radius: 4px;
  outline: none;
  background-color: transparent;

  color: var(--secondary-color);
  font-family: var(--font-inter);
  font-size: 14px;
  text-align: left;
  text-transform: capitalize;
  white-space: nowrap;

  cursor: pointer;

  transition:
    color 0.3s ease,
    background-color 0.3s ease;

  &_selected {
    background-color: var(--hint-third-color);

    color: var(--primary-color);

    pointer-events: none;
  }

  @media (any-hover: hover) {
    &:not(&_selected):hover {
      background-color: var(--border-fourth-color);

      color: var(--hint-secondary-color);
    }
  }
}

.filters-overlay-enter-active,
.filters-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.filters-overlay-enter-from,
.filters-overlay-leave-to {
  opacity: 0;
}
</style>
