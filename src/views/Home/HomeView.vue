<script setup>
import { ref, onMounted, watch } from 'vue'
import '@splidejs/splide/dist/css/splide.min.css'
import { useProductsStore } from '@/stores/products'
import { useGlobalStore } from '@/stores/global'
import { useLoginModalStore } from '@/stores/loginModal'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import { useTopUpStore } from '@/stores/topUp.js'
import CreditPackItem from '@/components/CreditPackItem.vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { useTopUpModalStore } from '@/stores/topUpModal.js'
import { storeToRefs } from 'pinia'
//import { useSettingsStore } from '@/stores/settings.js'
import { useCurrStore } from '@/stores/currencies.js'
import ProjectViewModal from '@/components/ProjectViewModal.vue'
import UiText, {
  TextSize,
  TextWeight,
  TextFont,
  TextTheme,
  TextAlign,
} from '@/components/shared/UiText.vue'
import UiLink, { LinkTheme } from '@/components/shared/UiLink.vue'
import UiButton, { ButtonThemes } from '@/components/shared/UiButton.vue'

import UiSvgIcon from '@/components/shared/UiSvgIcon.vue'
import TextureView from '@/components/create/TextureView.vue'

const globalStore = useGlobalStore()
const productsStore = useProductsStore()
const loginModalStore = useLoginModalStore()
const authStore = useAuthStore()
const topUpStore = useTopUpStore()
const topUpModalStore = useTopUpModalStore()
//const settingsStore = useSettingsStore()
const currStore = useCurrStore()

import Decimal from 'decimal.js'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css/navigation'
import 'swiper/css'
import HomeIdeasSection from './HomeIdeasSection.vue'
import HomeAdvantagesSection from './HomeAdvantagesSection.vue'
import HomeInstantlySection from './HomeInstantlySection.vue'
import HomeDiscoverSection from './HomeDiscoverSection.vue'
import PriceSection from '@/components/widgets/PriceSection.vue'

const customAmountSchema = yup.object({
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .positive('Amount must be greater than 0')
    .integer('Amount must be an integer')
    .required('Amount is required'),
})

function start() {
  if (authStore.isAuth) {
    router.push({ path: '/create/model' })
  } else {
    router.push({ path: '/sign-in' })
    // loginModalStore.openModal()
  }
}
const domain = ref('')
const modelUrl = ref(null)
const modelTitle = ref('')

function onOpenModel(url, title) {
  modelUrl.value = url
  modelTitle.value = title
}

watch(
  () => globalStore.languages,
  () => {
    productsStore.getNewProducts()
  },
)
onMounted(() => {
  domain.value = import.meta.env.VITE_APP_DOMAIN
  productsStore.getNewProducts()
})

function onSubmitCustomAmount(values) {
  if (authStore.isAuth) {
    const { amount } = storeToRefs(topUpModalStore)
    // Передаём исходное значение как количество кредитов, конвертация будет в модалке
    amount.value = values.amount
    topUpModalStore.setStep(2)
    topUpModalStore.openModal()
  } else {
    // loginModalStore.openModal()
    router.push('/sing-in')
  }
}
</script>

<template>
  <main class="main _cnt">
    <HomeIdeasSection :onStart="start" />
    <HomeAdvantagesSection />
    <HomeInstantlySection />
    <HomeDiscoverSection class="main__discover" :onStart="start" @open-model="onOpenModel" />
    <PriceSection
      :top-up-store="topUpStore"
      :on-submit-custom-amount="onSubmitCustomAmount"
      :custom-amount-schema="customAmountSchema"
    />
    <!--<section class="main__prices prices">
      <div class="prices__background _ibg-contain">
        <img src="@/static/images/backgrounds/3d-render-background.webp" />
      </div>
      <div class="prices__top">
        <UiText
          class="prices__title"
          :size="TextSize.H2"
          :font="TextFont.RED"
          :weight="TextWeight.BOLD"
          :align="TextAlign.CENTER"
          :title="$t('Our Prices')"
        />
        <UiText
          class="prices__text"
          :align="TextAlign.CENTER"
          :text="$t('Pick the credit pack that fits your needs')"
        />
      </div>
      <div class="prices__items">
        <CreditPackItem
          v-for="(pack, i) in topUpStore.creditPacks.slice(0, 3)"
          :key="pack.id"
          :pack="pack"
          :equivalent="i !== 0"
          :most-popular="i === 1"
        />
        <Form
          class="prices__item prices__item_form"
          v-slot="{ meta }"
          :validation-schema="customAmountSchema"
          @submit="onSubmitCustomAmount"
        >
          <div class="prices__item-inner">
            <UiText
              :size="TextSize.H4"
              :font="TextFont.RED"
              :weight="TextWeight.BOLD"
              :align="TextAlign.CENTER"
              class="prices__label"
              :title="$t('Custom Credits')"
            />
            <UiText
              :align="TextAlign.CENTER"
              class="prices__description"
              :title="$t('Choose the exact amount you need.')"
            />
            <div class="prices__amount">
              <UiText
                class="price__amount-value"
                :weight="TextWeight.BOLD"
                :size="TextSize.L"
                text="1€"
              />
              <UiText
                class="price__amount-equal"
                :weight="TextWeight.BOLD"
                :size="TextSize.L"
                text="="
              />
              <div class="prices__creadits">
                <div class="prices__creadits-icon _ibg-contain">
                  <img src="@/static/images/icons/creadit.webp" />
                </div>
                <UiText
                  class="prices__creadits-amout"
                  :weight="TextWeight.BOLD"
                  :size="TextSize.L"
                  text="1"
                />
                <UiText class="prices__creadits-text" :size="TextSize.L" text="credits" />
              </div>
            </div>
            <label class="prices__input">
              <Field
                class="prices__input-field _input"
                name="amount"
                type="text"
                :placeholder="$t('Enter amount')"
              />
              <div class="prices__input-icon">
                <img src="@/static/images/icons/creadit.webp" />
              </div>
            </label>
            <ErrorMessage class="prices__input-error" name="amount" />
          </div>
          <UiButton
            class="prices__button"
            :disabled="!meta.valid || !meta.touched"
            type="submit"
            :theme="ButtonThemes.SECONDARY"
            >{{ $t('By now') }}</UiButton
          >
        </Form>
      </div>
    </section>-->
    <ProjectViewModal
      @close="modelUrl = null"
      v-if="modelUrl"
      :model-url="modelUrl"
      :model-title="modelTitle"
    />
  </main>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/classes' as *;

.main {
  @include header-indent;
  &__discover {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 137, 25);
    }
  }
}
</style>
