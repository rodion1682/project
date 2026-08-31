import { debounce } from 'lodash'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import axios from '@/plugins/axios'
import { useHeroesStore } from '@/stores/heroes'

const DEBOUNCE_DELAY = 400

const PRODUCT_ROUTE_NAMES = [
  'ProductListPage',
  'ProductListPageWithCategory',
  'SalePage',
  'NewItemsPage',
]

const COLLECTION_ROUTE_NAME = 'MyCardsPage'
const RENTED_COLLECTION_VALUE = 'rented'

export const CATALOG_SORT_OPTIONS = [
  {
    value: 'price_asc',
    label: 'Lowest price first',
  },
  {
    value: 'price_desc',
    label: 'Highest price first',
  },
]

export const SORT_OPTIONS = [
  {
    value: 'price_asc',
    label: 'Lowest price first',
  },
  {
    value: 'price_desc',
    label: 'Highest price first',
  },
  {
    value: 'date_asc',
    label: 'Newest first',
  },
  {
    value: 'date_desc',
    label: 'Oldest first',
  },
]

export const COLLECTION_SORT_OPTIONS = [
  {
    value: 'date_asc',
    label: 'Newest first',
  },
  {
    value: 'date_desc',
    label: 'Oldest first',
  },
]

export const DEFAULT_FILTERS = {
  search: '',
  sort: 'price_desc',

  priceRange: {
    min: null,
    max: null,
  },

  page: 1,
  perPage: 21,

  type: '',
  rarity: '',
  frameType: '',
  hero: '',

  exterior_name: [],
  class: [],

  sale: false,
  new: false,

  rentalStatus: '',
}

const createDefaultFilters = () => ({
  ...DEFAULT_FILTERS,

  priceRange: {
    ...DEFAULT_FILTERS.priceRange,
  },

  exterior_name: [],
  class: [],
})

const normalizeCollectionMode = value => {
  return value === RENTED_COLLECTION_VALUE ? RENTED_COLLECTION_VALUE : 'bought'
}

export function useProductList() {
  const route = useRoute()
  const router = useRouter()
  const heroesStore = useHeroesStore()

  const products = ref([])
  const packs = ref([])

  const myProducts = ref([])
  const myRentProducts = ref([])
  const myPacks = ref([])

  const loading = ref(true)
  const error = ref(null)
  const initialized = ref(false)
  const isUpdatingFilters = ref(false)

  /*
   * Marketplace Buy/Rent state.
   *
   * This is separate from the collection Bought/Rented
   * state used on MyCardsPage.
   */
  const marketMode = ref(route.query.mode === 'rent' ? 'rent' : 'buy')

  /*
   * Player collection mode:
   *
   * /my-cards
   * /my-cards?collection=rented
   */
  const collectionMode = computed(() => {
    if (route.name !== COLLECTION_ROUTE_NAME) {
      return 'bought'
    }

    return normalizeCollectionMode(route.query.collection)
  })

  const isRentedCollection = computed(() => {
    return collectionMode.value === RENTED_COLLECTION_VALUE
  })

  /*
   * The page can render this one computed value instead
   * of deciding between myProducts and myRentProducts.
   */
  const collectionProducts = computed(() => {
    return isRentedCollection.value ? myRentProducts.value : myProducts.value
  })

  const availableFilters = reactive({
    types: [],
    rarities: [],
    frameTypes: [],
    hero: [],
    exterior_names: [],
    classes: [],
    subcategories: [],
  })

  const pagination = reactive({
    total: 0,
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
  })

  const initializeFilters = () => {
    const query = route.query

    const selectedHero = heroesStore.heroes?.find(hero => {
      return hero.slug === query.hero
    })

    return {
      ...createDefaultFilters(),

      search: typeof query.search === 'string' ? query.search : '',

      sort: typeof query.sort === 'string' ? query.sort : DEFAULT_FILTERS.sort,

      page: query.page ? Math.max(Number(query.page) || 1, 1) : 1,

      priceRange: {
        min: query.min_price !== undefined ? Number(query.min_price) : null,

        max: query.max_price !== undefined ? Number(query.max_price) : null,
      },

      type: typeof query.type === 'string' ? query.type : '',

      rarity: typeof query.rarity === 'string' ? query.rarity : '',

      frameType: typeof query.frame_type === 'string' ? query.frame_type : '',

      hero: selectedHero?.id || '',

      exterior_name:
        typeof query.exterior_names === 'string'
          ? query.exterior_names.split(',')
          : [],

      class:
        typeof query.item_class === 'string' ? query.item_class.split(',') : [],

      sale: route.name === 'SalePage' || query.sale === 'true',

      new: route.name === 'NewItemsPage' || query.new === 'true',

      rentalStatus: typeof query.status === 'string' ? query.status : '',
    }
  }

  const filters = reactive(initializeFilters())

  /*
   * Every request group has its own identifier.
   *
   * Incrementing an identifier invalidates older
   * responses from that group.
   */
  const requestIds = reactive({
    products: 0,
    packs: 0,
    myProducts: 0,
    myRentProducts: 0,
    myPacks: 0,
  })

  const resetPagination = () => {
    pagination.total = 0
    pagination.currentPage = 1
    pagination.lastPage = 1
    pagination.from = 0
    pagination.to = 0
  }

  const updatePagination = (meta = {}, items = []) => {
    const total = Number(meta?.total ?? meta?.pagination?.total ?? items.length)

    const currentPage = Number(
      meta?.current_page ??
        meta?.currentPage ??
        meta?.pagination?.current_page ??
        filters.page,
    )

    const lastPage = Number(
      meta?.last_page ??
        meta?.lastPage ??
        meta?.pagination?.last_page ??
        Math.max(Math.ceil(total / filters.perPage), 1),
    )

    pagination.total = total
    pagination.currentPage = currentPage
    pagination.lastPage = lastPage

    if (total === 0) {
      pagination.from = 0
      pagination.to = 0
      return
    }

    pagination.from = Number(
      meta?.from ??
        meta?.pagination?.from ??
        (currentPage - 1) * filters.perPage + 1,
    )

    pagination.to = Number(
      meta?.to ??
        meta?.pagination?.to ??
        Math.min(currentPage * filters.perPage, total),
    )
  }

  const getResponseItems = (data, preferredKey = 'data') => {
    if (Array.isArray(data?.[preferredKey])) {
      return data[preferredKey]
    }

    if (Array.isArray(data?.data)) {
      return data.data
    }

    if (Array.isArray(data?.payload)) {
      return data.payload
    }

    if (Array.isArray(data?.payload?.data)) {
      return data.payload.data
    }

    return []
  }

  const getResponseMeta = data => {
    return data?.meta ?? data?.payload?.meta ?? data?.pagination ?? {}
  }

  /*
   * GET /catalog/cards
   */
  const getCatalogCardParams = () => ({
    page: filters.page,
    per_page: filters.perPage,

    sort: filters.sort,

    name: filters.search || undefined,

    min_price: filters.priceRange.min ?? undefined,

    max_price: filters.priceRange.max ?? undefined,

    hero_id: filters.hero || undefined,

    type: filters.type || undefined,

    rarity: filters.rarity || undefined,

    card_frame_set_id: filters.frameType || undefined,
  })

  /*
   * GET /catalog/packs
   */
  const getCatalogPackParams = () => ({
    page: filters.page,
    per_page: filters.perPage,

    sort: filters.sort,

    name: filters.search || undefined,

    min_price: filters.priceRange.min ?? undefined,

    max_price: filters.priceRange.max ?? undefined,
  })

  /*
   * GET /players/me/cards
   * GET /players/me/packs
   *
   * The supplied backend store currently supports
   * pagination and sorting for inventory requests.
   */
  const getInventoryParams = () => ({
    page: filters.page,
    per_page: filters.perPage,
    sort: filters.sort,
  })

  /*
   * GET /rentals
   *
   * The server uses its own page size, so per_page
   * is intentionally not supplied.
   */
  const getMyRentalParams = () => ({
    page: filters.page,

    status: filters.rentalStatus || undefined,
  })

  const fetchFilterData = async () => {
    const requests = [
      axios.get('/card-rarities').then(({ data }) => {
        const values = data?.payload ?? data?.data ?? []

        availableFilters.rarities = Array.isArray(values)
          ? values.map(value => ({
              label: typeof value === 'object' ? value.name : value,

              value:
                typeof value === 'object'
                  ? (value.value ?? value.slug ?? value.name)
                  : value,
            }))
          : []
      }),

      axios.get('/card-types').then(({ data }) => {
        const values = data?.payload ?? data?.data ?? []

        availableFilters.types = Array.isArray(values)
          ? values.map(value => ({
              label: typeof value === 'object' ? value.name : value,

              value:
                typeof value === 'object'
                  ? (value.value ?? value.slug ?? value.name)
                  : value,
            }))
          : []
      }),

      axios.get('/card-frame-types').then(({ data }) => {
        const values = data?.payload ?? data?.data ?? []

        availableFilters.frameTypes = Array.isArray(values)
          ? values.map(item => ({
              label: item.name,
              value: String(item.id),
            }))
          : []
      }),
    ]

    const results = await Promise.allSettled(requests)

    results.forEach(result => {
      if (result.status === 'rejected') {
        console.error('Failed to load filter data:', result.reason)
      }
    })
  }

  const fetchProducts = async () => {
    if (!initialized.value) {
      return
    }

    const requestId = ++requestIds.products

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/catalog/cards', {
        params: getCatalogCardParams(),
      })

      if (requestId !== requestIds.products) {
        return
      }

      const receivedProducts = getResponseItems(data, 'data')

      products.value = receivedProducts

      updatePagination(getResponseMeta(data), receivedProducts)
    } catch (requestError) {
      if (requestId !== requestIds.products) {
        return
      }

      console.error('Failed to load card catalog:', requestError)

      error.value =
        requestError.response?.data?.message || 'Failed to load products'

      products.value = []
      resetPagination()
    } finally {
      if (requestId === requestIds.products) {
        loading.value = false
      }
    }
  }

  const fetchPacks = async () => {
    if (!initialized.value) {
      return
    }

    const requestId = ++requestIds.packs

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/catalog/packs', {
        params: getCatalogPackParams(),
      })

      if (requestId !== requestIds.packs) {
        return
      }

      const receivedPacks = getResponseItems(data, 'data')

      packs.value = receivedPacks

      updatePagination(getResponseMeta(data), receivedPacks)
    } catch (requestError) {
      if (requestId !== requestIds.packs) {
        return
      }

      console.error('Failed to load pack catalog:', requestError)

      error.value =
        requestError.response?.data?.message || 'Failed to load packs'

      packs.value = []
      resetPagination()
    } finally {
      if (requestId === requestIds.packs) {
        loading.value = false
      }
    }
  }

  const fetchMyProducts = async () => {
    if (!initialized.value) {
      return
    }

    const requestId = ++requestIds.myProducts

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/players/me/cards', {
        params: getInventoryParams(),
      })

      if (requestId !== requestIds.myProducts) {
        return
      }

      const receivedProducts = getResponseItems(data, 'data')

      myProducts.value = receivedProducts

      updatePagination(getResponseMeta(data), receivedProducts)
    } catch (requestError) {
      if (requestId !== requestIds.myProducts) {
        return
      }

      console.error('Failed to load owned cards:', requestError)

      error.value =
        requestError.response?.data?.message || 'Failed to load owned cards'

      myProducts.value = []
      resetPagination()
    } finally {
      if (requestId === requestIds.myProducts) {
        loading.value = false
      }
    }
  }

  const fetchMyRentProducts = async () => {
    if (!initialized.value) {
      return
    }

    const requestId = ++requestIds.myRentProducts

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/rentals', {
        params: getMyRentalParams(),
      })

      if (requestId !== requestIds.myRentProducts) {
        return
      }

      const receivedRentals = getResponseItems(data, 'payload')

      myRentProducts.value = receivedRentals

      updatePagination(getResponseMeta(data), receivedRentals)
    } catch (requestError) {
      if (requestId !== requestIds.myRentProducts) {
        return
      }

      console.error('Failed to load rentals:', requestError)

      error.value =
        requestError.response?.data?.message || 'Failed to load rentals'

      myRentProducts.value = []
      resetPagination()
    } finally {
      if (requestId === requestIds.myRentProducts) {
        loading.value = false
      }
    }
  }

  const fetchMyPacks = async () => {
    if (!initialized.value) {
      return
    }

    const requestId = ++requestIds.myPacks

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/players/me/packs', {
        params: getInventoryParams(),
      })

      if (requestId !== requestIds.myPacks) {
        return
      }

      const receivedPacks = getResponseItems(data, 'data')

      myPacks.value = receivedPacks

      updatePagination(getResponseMeta(data), receivedPacks)
    } catch (requestError) {
      if (requestId !== requestIds.myPacks) {
        return
      }

      console.error('Failed to load owned packs:', requestError)

      error.value =
        requestError.response?.data?.message || 'Failed to load owned packs'

      myPacks.value = []
      resetPagination()
    } finally {
      if (requestId === requestIds.myPacks) {
        loading.value = false
      }
    }
  }

  const debouncedFetchProducts = debounce(fetchProducts, DEBOUNCE_DELAY)

  const debouncedFetchPacks = debounce(fetchPacks, DEBOUNCE_DELAY)

  const debouncedFetchMyProducts = debounce(fetchMyProducts, DEBOUNCE_DELAY)

  const debouncedFetchMyRentProducts = debounce(
    fetchMyRentProducts,
    DEBOUNCE_DELAY,
  )

  const debouncedFetchMyPacks = debounce(fetchMyPacks, DEBOUNCE_DELAY)

  const cancelDebouncedRequests = () => {
    debouncedFetchProducts.cancel()
    debouncedFetchPacks.cancel()
    debouncedFetchMyProducts.cancel()
    debouncedFetchMyRentProducts.cancel()
    debouncedFetchMyPacks.cancel()
  }

  const invalidateAllRequests = () => {
    requestIds.products += 1
    requestIds.packs += 1
    requestIds.myProducts += 1
    requestIds.myRentProducts += 1
    requestIds.myPacks += 1
  }

  /*
   * Prevent a bought request from changing loading or
   * pagination after the user switches to Rented, and
   * vice versa.
   */
  const invalidateInactiveCollectionRequest = () => {
    if (isRentedCollection.value) {
      debouncedFetchMyProducts.cancel()
      requestIds.myProducts += 1
      return
    }

    debouncedFetchMyRentProducts.cancel()
    requestIds.myRentProducts += 1
  }

  const fetchCollectionProducts = ({ debounced = true } = {}) => {
    invalidateInactiveCollectionRequest()

    if (isRentedCollection.value) {
      if (debounced) {
        debouncedFetchMyRentProducts()
        return
      }

      return fetchMyRentProducts()
    }

    if (debounced) {
      debouncedFetchMyProducts()
      return
    }

    return fetchMyProducts()
  }

  const createQuery = () => {
    const selectedHero = heroesStore.heroes?.find(hero => {
      return hero.id == filters.hero
    })

    const isCatalogRoute = PRODUCT_ROUTE_NAMES.includes(route.name)

    return {
      /*
       * Preserve collection state while changing
       * filters, sorting, or pagination.
       */
      ...(route.name === COLLECTION_ROUTE_NAME &&
        isRentedCollection.value && {
          collection: RENTED_COLLECTION_VALUE,
        }),

      /*
       * Marketplace Buy/Rent mode should only exist
       * on card catalog routes.
       */
      ...(isCatalogRoute &&
        marketMode.value === 'rent' && {
          mode: 'rent',
        }),

      ...(filters.sort !== DEFAULT_FILTERS.sort && {
        sort: filters.sort,
      }),

      ...(filters.priceRange.min !== null &&
        filters.priceRange.min > 0 && {
          min_price: filters.priceRange.min,
        }),

      ...(filters.priceRange.max !== null && {
        max_price: filters.priceRange.max,
      }),

      ...(filters.type && {
        type: filters.type,
      }),

      ...(filters.rarity && {
        rarity: filters.rarity,
      }),

      ...(filters.frameType && {
        frame_type: filters.frameType,
      }),

      ...(selectedHero?.slug && {
        hero: selectedHero.slug,
      }),

      ...(filters.page > 1 && {
        page: String(filters.page),
      }),

      ...(filters.search && {
        search: filters.search,
      }),

      ...(filters.new && {
        new: 'true',
      }),

      ...(filters.sale && {
        sale: 'true',
      }),

      ...(filters.rentalStatus && {
        status: filters.rentalStatus,
      }),
    }
  }

  const updateURL = async () => {
    await router.replace({
      name: route.name,
      params: route.params,
      query: createQuery(),
    })
  }

  const fetchForCurrentRoute = ({ debounced = true } = {}) => {
    const routeName = route.name

    if (PRODUCT_ROUTE_NAMES.includes(routeName)) {
      if (debounced) {
        debouncedFetchProducts()
        return
      }

      return fetchProducts()
    }

    if (routeName === 'PackListPage') {
      if (debounced) {
        debouncedFetchPacks()
        return
      }

      return fetchPacks()
    }

    if (routeName === COLLECTION_ROUTE_NAME) {
      return fetchCollectionProducts({
        debounced,
      })
    }

    if (routeName === 'ProductDetailsPage') {
      if (debounced) {
        debouncedFetchMyProducts()
        return
      }

      return fetchMyProducts()
    }

    if (routeName === 'MyPacksPage' || routeName === 'PackDetailsPage') {
      if (debounced) {
        debouncedFetchMyPacks()
        return
      }

      return fetchMyPacks()
    }

    return Promise.resolve()
  }

  const updateFilters = async (newFilters = {}) => {
    isUpdatingFilters.value = true

    try {
      const hasPage = Object.prototype.hasOwnProperty.call(newFilters, 'page')

      if (!hasPage) {
        filters.page = 1
      }

      const preservedSpecialFilters = {
        sale: filters.sale,
        new: filters.new,
      }

      if (newFilters.priceRange) {
        Object.assign(filters.priceRange, newFilters.priceRange)

        const filtersWithoutPrice = {
          ...newFilters,
        }

        delete filtersWithoutPrice.priceRange

        Object.assign(filters, filtersWithoutPrice, preservedSpecialFilters)
      } else {
        Object.assign(filters, newFilters, preservedSpecialFilters)
      }

      await updateURL()

      fetchForCurrentRoute({
        debounced: true,
      })
    } catch (updateError) {
      console.error('Failed to update filters:', updateError)

      error.value = 'Failed to update filters'
    } finally {
      isUpdatingFilters.value = false
    }
  }

  const setMarketMode = async mode => {
    if (!['buy', 'rent'].includes(mode) || marketMode.value === mode) {
      return
    }

    marketMode.value = mode
    filters.page = 1

    error.value = null
    loading.value = true

    await updateURL()

    debouncedFetchProducts.cancel()
    requestIds.products += 1

    await fetchProducts()
  }

  const resetFilters = async () => {
    const nextFilters = createDefaultFilters()

    nextFilters.sale = route.name === 'SalePage'

    nextFilters.new = route.name === 'NewItemsPage'

    /*
     * Collection sorting should not fall back to
     * price sorting because collection cards do not
     * display prices.
     */
    if (route.name === COLLECTION_ROUTE_NAME) {
      nextFilters.sort = COLLECTION_SORT_OPTIONS[0].value
    }

    Object.assign(filters, nextFilters)

    await updateFilters({
      page: 1,
    })
  }

  /*
   * Marketplace mode navigation.
   */
  watch(
    () => route.query.mode,
    mode => {
      marketMode.value = mode === 'rent' ? 'rent' : 'buy'
    },
  )

  /*
   * Bought/Rented collection navigation.
   *
   * The route name remains MyCardsPage, so this
   * watcher is required. A route.name watcher alone
   * will not detect the tab change.
   */
  watch(
    () => route.query.collection,
    async (collection, previousCollection) => {
      if (
        !initialized.value ||
        route.name !== COLLECTION_ROUTE_NAME ||
        collection === previousCollection
      ) {
        return
      }

      filters.page = 1
      filters.rentalStatus =
        typeof route.query.status === 'string' ? route.query.status : ''

      error.value = null
      loading.value = true

      /*
       * Cancel both delayed collection requests.
       * fetchCollectionProducts will start the correct
       * immediate request.
       */
      debouncedFetchMyProducts.cancel()
      debouncedFetchMyRentProducts.cancel()

      requestIds.myProducts += 1
      requestIds.myRentProducts += 1

      resetPagination()

      await fetchCollectionProducts({
        debounced: false,
      })
    },
  )

  /*
   * Component route changes.
   */
  watch(
    () => route.name,
    async (routeName, previousRouteName) => {
      if (!initialized.value || routeName === previousRouteName) {
        return
      }

      filters.sale = routeName === 'SalePage'

      filters.new = routeName === 'NewItemsPage'

      filters.page = 1

      /*
       * Use date sorting when entering My Cards.
       */
      if (routeName === COLLECTION_ROUTE_NAME) {
        const requestedSort =
          typeof route.query.sort === 'string' ? route.query.sort : ''

        filters.sort = COLLECTION_SORT_OPTIONS.some(option => {
          return option.value === requestedSort
        })
          ? requestedSort
          : COLLECTION_SORT_OPTIONS[0].value
      }

      error.value = null
      loading.value = true

      cancelDebouncedRequests()
      invalidateAllRequests()
      resetPagination()

      await fetchForCurrentRoute({
        debounced: false,
      })
    },
  )

  watch(
    () => route.params.category,
    (category, previousCategory) => {
      if (!initialized.value || category === previousCategory) {
        return
      }

      filters.page = 1
      loading.value = true

      debouncedFetchProducts()
    },
  )

  /*
   * Resolve the hero slug after the hero store
   * finishes loading.
   */
  watch(
    () => heroesStore.heroes,
    heroes => {
      if (filters.hero || !route.query.hero || !heroes?.length) {
        return
      }

      const selectedHero = heroes.find(hero => {
        return hero.slug === route.query.hero
      })

      if (selectedHero) {
        filters.hero = selectedHero.id
      }
    },
    {
      deep: true,
    },
  )

  onMounted(async () => {
    initialized.value = true
    loading.value = true

    /*
     * Collection pages use date sorting by default.
     */
    if (route.name === COLLECTION_ROUTE_NAME) {
      const requestedSort =
        typeof route.query.sort === 'string' ? route.query.sort : ''

      filters.sort = COLLECTION_SORT_OPTIONS.some(option => {
        return option.value === requestedSort
      })
        ? requestedSort
        : COLLECTION_SORT_OPTIONS[0].value
    }

    try {
      await Promise.all([
        fetchFilterData(),

        fetchForCurrentRoute({
          debounced: false,
        }),
      ])
    } finally {
      /*
       * The active request normally controls loading.
       * This is a fallback for routes without a fetch.
       */
      loading.value = false
    }
  })

  onBeforeUnmount(() => {
    initialized.value = false

    cancelDebouncedRequests()
    invalidateAllRequests()
  })

  return {
    SORT_OPTIONS,
    CATALOG_SORT_OPTIONS,
    COLLECTION_SORT_OPTIONS,

    marketMode,
    setMarketMode,

    collectionMode,
    isRentedCollection,
    collectionProducts,

    products,
    packs,

    myProducts,
    myRentProducts,
    myPacks,

    loading,
    error,
    initialized,
    isUpdatingFilters,

    filters,
    availableFilters,
    pagination,

    updateFilters,
    resetFilters,

    fetchFilterData,

    fetchProducts: debouncedFetchProducts,
    fetchPacks: debouncedFetchPacks,

    fetchMyProducts: debouncedFetchMyProducts,
    fetchMyRentProducts: debouncedFetchMyRentProducts,

    fetchCollectionProducts,

    fetchMyPacks: debouncedFetchMyPacks,
  }
}
