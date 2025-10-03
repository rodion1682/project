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
import { useSettingsStore } from '@/stores/settings.js'
import { useCurrStore } from '@/stores/currencies.js'
import ProjectViewModal from '@/components/ProjectViewModal.vue'

const globalStore = useGlobalStore()
const productsStore = useProductsStore()
const loginModalStore = useLoginModalStore()
const authStore = useAuthStore()
const topUpStore = useTopUpStore()
const topUpModalStore = useTopUpModalStore()
const settingsStore = useSettingsStore()
const currStore = useCurrStore()

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
    loginModalStore.openModal()
  }
}
const domain = ref('')
const modelUrl = ref(null)

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
    amount.value = values.amount
    topUpModalStore.setStep(2)
    topUpModalStore.openModal()
  } else {
    loginModalStore.openModal()
  }
}
</script>

<template>
  <main class="main">
    <section class="section hero-section">
      <img class="img" src="@/assets/imgs/hero.webp" />
      <div class="wrapper">
        <div class="text text-82">
          <b>{{ $t('Turn Words and Images into 3D Reality') }}</b>
        </div>
        <div class="text text-14 text-inter">
          {{
            $t(
              'With SculptaDot, you can bring your ideas to life in 3D — just describe it or upload a picture. Our AI handles the rest.',
            )
          }}
        </div>
        <button class="button w-184 big" @click="start()">
          {{ $t('Start Creating Now') }}
        </button>
      </div>
    </section>
    <section class="section why-section">
      <div class="wrapper">
        <div class="text text-18 text-inter text-blue">{{ $t('Why SculptaDot?') }}</div>
        <div class="text text-48">
          <b>{{ $t('Shape Ideas. Instantly.') }}</b>
        </div>
        <div class="text text-14 text-inter">
          {{
            $t(
              'SculptaDot transforms your creative process with fast, intuitive, and precise 3D modeling — no experience required.',
            )
          }}
        </div>
        <div class="list-container">
          <img class="img" src="@/assets/imgs/whyBg.webp" />
          <div class="flex list justify-between flex-wrap">
            <div class="item">
              <div class="item-wrapper">
                <div class="text text-32">
                  <b>{{ $t('Instant Generation') }}</b>
                </div>
                <div class="text text-14 text-inter">
                  {{
                    $t('From concept to 3D in a matter of seconds — powered by cutting-edge AI.')
                  }}
                </div>
              </div>
            </div>
            <div class="item">
              <div class="item-wrapper">
                <div class="text text-32">
                  <b>{{ $t('Professional-Grade Results') }}</b>
                </div>
                <div class="text text-14 text-inter">
                  {{
                    $t(
                      'Perfect for games, animations, product design, or rapid prototyping — no compromises in detail.',
                    )
                  }}
                </div>
              </div>
            </div>
            <div class="item">
              <div class="item-wrapper">
                <div class="text text-32">
                  <b>{{ $t('Easy Exports') }}</b>
                </div>
                <div class="text text-14 text-inter">
                  {{
                    $t(
                      'Download your model in .obj, .fbx, or .gltf formats — ready for your workflow.',
                    )
                  }}
                </div>
              </div>
            </div>
            <div class="item">
              <div class="item-wrapper">
                <div class="text text-32">
                  <b>{{ $t('For All Skill Levels') }}</b>
                </div>
                <div class="text text-14 text-inter">
                  {{
                    $t(
                      'Whether you’re an indie dev, an architect, or just experimenting — SculptaDot is built for you.',
                    )
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section how-section">
      <img class="bg" src="@/assets/imgs/howBg.webp" />
      <div class="wrapper">
        <div class="left">
          <div class="text text-18 text-inter text-blue">{{ $t('How It Works') }}</div>
          <div class="text text-64">
            <b>{{ $t('Get a Custom 3D Model in 3 Simple Steps ') }}</b>
          </div>
          <button class="button w-184 big" @click="start()">
            {{ $t('Start Creating Now') }}
          </button>
        </div>

        <div class="right">
          <div class="list">
            <div class="item">
              <img class="img" src="@/assets/imgs/how/1.png" />
              <div class="item-text">
                <div class="text text-24">
                  <b>{{ $t('Describe or Upload') }}</b>
                </div>
                <div class="text text-14">
                  {{
                    $t(
                      'Write a short prompt like “floating robot companion” or upload a reference image.',
                    )
                  }}
                </div>
              </div>
            </div>
            <div class="item">
              <img class="img" src="@/assets/imgs/how/2.png" />
              <div class="item-text">
                <div class="text text-24">
                  <b>{{ $t('AI Builds Your Model') }}</b>
                </div>
                <div class="text text-14">
                  {{ $t('Our AI interprets your input and generates a 3D model in seconds.') }}
                </div>
              </div>
            </div>
            <div class="item">
              <img class="img" src="@/assets/imgs/how/3.png" />
              <div class="item-text">
                <div class="text text-24">
                  <b>{{ $t('Download and Use') }}</b>
                </div>
                <div class="text text-14">
                  {{
                    $t(
                      'Export the model and drop it straight into your favorite software or engine.',
                    )
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section explore-section">
      <div class="wrapper">
        <div class="text text-18 text-inter text-blue">{{ $t('Explore the Gallery') }}</div>
        <div class="text text-48">
          <b>{{ $t('Discover What Others Are Creating') }}</b>
        </div>
        <div class="text text-14 text-inter">
          {{ $t('Browse inspiring models made by our community of creators.') }}
        </div>
        <div class="list flex flex-wrap">
          <div class="item">
            <button class="button" @click="modelUrl = '/models/1.glb'">
              <img class="img" src="@/assets/imgs/exploreRotateIcon.svg" />
            </button>
            <div class="img-container">
              <img class="img" src="@/assets/models/preview/1.webp" />
            </div>
            <div class="text text-14 text-inter">Cartoon fox</div>
          </div>
          <div class="item">
            <button class="button" @click="modelUrl = '/models/2.glb'">
              <img class="img" src="@/assets/imgs/exploreRotateIcon.svg" />
            </button>
            <div class="img-container">
              <img class="img" src="@/assets/models/preview/2.webp" />
            </div>
            <div class="text text-14 text-inter">Dog toy figurine</div>
          </div>
          <div class="item">
            <button class="button" @click="modelUrl = '/models/3.glb'">
              <img class="img" src="@/assets/imgs/exploreRotateIcon.svg" />
            </button>
            <div class="img-container">
              <img class="img" src="@/assets/models/preview/3.webp" />
            </div>
            <div class="text text-14 text-inter">Cute girl meditation</div>
          </div>
          <div class="item">
            <button class="button" @click="modelUrl = '/models/4.glb'">
              <img class="img" src="@/assets/imgs/exploreRotateIcon.svg" />
            </button>
            <div class="img-container">
              <img class="img" src="@/assets/models/preview/4.webp" />
            </div>
            <div class="text text-14 text-inter">Ice cream</div>
          </div>
        </div>
        <button class="button w-184 big" @click="start()">
          {{ $t('Generate 3D Now') }}
        </button>
      </div>
    </section>
    <section class="section pricing-section" id="pricing">
      <div class="wrapper">
        <div class="text text-18 text-inter text-blue">{{ $t('Pricing') }}</div>
        <div class="text main-text-48 text-48">
          <b>{{ $t('Pick the Credit Pack That Fits Your Needs') }}</b>
        </div>
        <div class="text main-text-14 text-14 text-inter">
          {{ $t('SculptaDot uses credits') }}
        </div>

        <div class="list flex flex-wrap">
          <CreditPackItem
            v-for="(pack, i) in topUpStore.creditPacks"
            :key="pack.id"
            :pack="pack"
            :equivalent="i !== 0"
            :most-popular="i === 1"
          />
          <Form
            v-slot="{ meta }"
            class="item is-auth"
            :validation-schema="customAmountSchema"
            @submit="onSubmitCustomAmount"
          >
            <div class="text text-24">
              <b>{{ $t('Custom Credits') }}</b>
            </div>
            <div class="text text-14 text-inter">
              {{ $t('Choose the exact amount you need.') }}
            </div>
            <div class="flex items-center justify-center">
              <div class="text text-18 text-inter">
                <b>1 {{ currStore.currency.symbol }}</b>
              </div>
              <div class="text text-18 text-inter">
                <b>=</b>
              </div>
              <img class="coin" src="@/assets/imgs/coin.svg" />
              <div class="text text-18 text-inter"><b>1</b> {{ $t('credit') }}</div>
            </div>
            <label class="label">
              <Field name="amount" type="text" :placeholder="$t('Enter amount')" />
              <img class="coin" src="@/assets/imgs/coin.svg" />
            </label>
            <ErrorMessage name="amount" class="text text-14 text-inter text-red" />

            <button
              :disabled="!meta.valid || !meta.touched"
              class="button stroke w-145"
              type="submit"
            >
              {{ $t('Buy Now') }}
            </button>
          </Form>
        </div>
      </div>
    </section>
    <ProjectViewModal @close="modelUrl = null" v-if="modelUrl" :model-url="modelUrl" />
  </main>
</template>
