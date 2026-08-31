<template>
  <BaseModal
    :show="show"
    :persistent="isUnpacking"
    class="unpack-pack-modal"
    content-class="unpack-pack-modal__content"
    :labelledby="titleId"
    @close="handleClose"
    @update:show="handleShowUpdate"
  >
    <!-- Confirmation -->
    <div v-if="step === 'confirm'" class="unpack-pack">
      <h2 :id="titleId" class="unpack-pack__title _h2">
        {{ packName }}
      </h2>

      <div class="unpack-pack__confirmation">
        <div class="unpack-pack__pack">
          <div class="unpack-pack__pack-glow" />

          <img
            v-if="packImage"
            :src="packImage"
            :alt="packName"
            class="unpack-pack__pack-image"
          />
        </div>

        <div class="unpack-pack__confirmation-content">
          <h3 class="unpack-pack__confirmation-title _h3">
            {{ $t('Open this card pack?') }}
          </h3>

          <p class="unpack-pack__confirmation-text">
            {{
              $t(
                'The pack will be opened and all received cards will be added to your collection automatically.',
              )
            }}
          </p>

          <div v-if="availableQuantity > 0" class="unpack-pack__quantity">
            <span class="unpack-pack__quantity-label">
              {{ $t('Packs available') }}:
            </span>

            <span class="unpack-pack__quantity-value">
              {{ availableQuantity }}
            </span>
          </div>

          <p v-if="error" class="unpack-pack__error" role="alert">
            {{ error }}
          </p>

          <div class="unpack-pack__actions">
            <BaseButton
              type="button"
              variant="bordered"
              class="unpack-pack__button"
              :disabled="isUnpacking"
              @click="handleClose"
            >
              {{ $t('Cancel') }}
            </BaseButton>

            <BaseButton
              type="button"
              variant="primary"
              class="unpack-pack__button"
              :disabled="isUnpacking || !packId"
              @click="unpackPack"
            >
              {{ $t('Unpack') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Opening animation -->
    <div
      v-else-if="step === 'opening'"
      class="unpack-pack unpack-pack_opening"
      aria-live="polite"
    >
      <h2 :id="titleId" class="unpack-pack__title _h2">
        {{ packName }}
      </h2>

      <div class="unpack-pack__opening">
        <div class="unpack-pack__opening-rays" />
        <div class="unpack-pack__opening-glow" />

        <img
          v-if="packImage"
          :src="packImage"
          :alt="packName"
          class="unpack-pack__opening-image"
        />

        <div class="unpack-pack__opening-particles" aria-hidden="true">
          <span
            v-for="particle in 12"
            :key="particle"
            class="unpack-pack__particle"
            :style="{ '--particle-index': particle }"
          />
        </div>
      </div>

      <p class="unpack-pack__opening-text">
        {{ $t('Opening your pack...') }}
      </p>

      <span class="unpack-pack__loader" aria-hidden="true" />
    </div>

    <!-- Revealed cards -->
    <div
      v-else-if="step === 'revealed'"
      class="unpack-pack unpack-pack_revealed"
    >
      <h2 :id="titleId" class="unpack-pack__title _h2">
        {{ packName }}
      </h2>

      <div v-if="revealedCards.length" class="unpack-pack__cards">
        <article
          v-for="(instance, index) in revealedCards"
          :key="getCardKey(instance, index)"
          class="unpack-pack__card-item"
          :class="getRarityClass(instance)"
          :style="{ '--reveal-index': index }"
        >
          <div class="unpack-pack__card-glow" />

          <div class="unpack-pack__card">
            <img
              v-if="getCard(instance).image_2"
              :src="resolveImageUrl(getCard(instance).image_2)"
              :alt="getCard(instance).name"
              class="unpack-pack__card-frame"
            />

            <img
              v-if="getCard(instance).image"
              :src="resolveImageUrl(getCard(instance).image)"
              alt=""
              class="unpack-pack__card-image"
            />

            <div
              v-if="getCard(instance).description"
              class="unpack-pack__card-description"
              v-html="getCard(instance).description"
            />

            <span
              v-if="hasValue(getCard(instance).mana_cost)"
              class="unpack-pack__card-stat unpack-pack__card-stat_mana"
            >
              {{ getCard(instance).mana_cost }}
            </span>

            <span
              v-if="hasValue(getCard(instance).attack)"
              class="unpack-pack__card-stat unpack-pack__card-stat_attack"
            >
              {{ getCard(instance).attack }}
            </span>

            <span
              v-if="hasValue(getCard(instance).health)"
              class="unpack-pack__card-stat unpack-pack__card-stat_health"
            >
              {{ getCard(instance).health }}
            </span>
          </div>

          <div class="unpack-pack__card-information">
            <h3 class="unpack-pack__card-name">
              {{ getCard(instance).name || $t('Card') }}
            </h3>
          </div>
        </article>
      </div>

      <div v-else class="unpack-pack__empty">
        <h3 class="unpack-pack__empty-title _h3">
          {{ $t('The pack was opened') }}
        </h3>

        <p class="unpack-pack__empty-text">
          {{
            $t(
              'Your cards were added to your collection, but no card information was returned.',
            )
          }}
        </p>
      </div>

      <div class="unpack-pack__revealed-actions">
        <BaseButton
          type="button"
          variant="primary"
          class="unpack-pack__continue"
          @click="handleContinue"
        >
          {{ $t('Continue') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import defaultImage from '@/assets/images/default-image.png'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import axios from '@/plugins/axios'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  packId: {
    type: [String, Number],
    default: null,
  },

  pack: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'update:show', 'opened'])

const STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''
const MINIMUM_OPENING_DURATION = 1800

const step = ref('confirm')
const isUnpacking = ref(false)
const error = ref('')
const revealedCards = ref([])

const titleId = computed(() => {
  return props.packId
    ? `unpack-pack-title-${props.packId}`
    : 'unpack-pack-title'
})

const packName = computed(() => {
  return (
    props.pack?.pack?.name ??
    props.pack?.product?.name ??
    props.pack?.name ??
    props.pack?.title ??
    'Card Pack'
  )
})

const availableQuantity = computed(() => {
  const value =
    props.pack?.quantity ??
    props.pack?.count ??
    props.pack?.amount ??
    props.pack?.instances?.length ??
    1

  return Math.max(0, Number(value) || 0)
})

const packImage = computed(() => {
  const image =
    props.pack?.image_details ??
    props.pack?.pack?.image_details ??
    props.pack?.product?.image_details ??
    props.pack?.image ??
    props.pack?.pack?.image ??
    props.pack?.product?.image ??
    props.pack?.image_2 ??
    props.pack?.pack?.image_2 ??
    props.pack?.product?.image_2 ??
    props.pack?.img_url ??
    ''

  return resolveImageUrl(image)
})

const wait = duration => {
  return new Promise(resolve => {
    window.setTimeout(resolve, duration)
  })
}

const getResponseCards = response => {
  const data = response?.data

  const possibleCards = [
    data?.data,
    data?.payload,
    data?.cards,
    data?.payload?.cards,
    data?.data?.cards,
  ]

  return possibleCards.find(Array.isArray) || []
}

const getCard = instance => {
  return instance?.card ?? instance?.product ?? instance ?? {}
}

const getCardKey = (instance, index) => {
  return (
    instance?.instance_uuid ??
    instance?.id ??
    getCard(instance)?.id ??
    `revealed-card-${index}`
  )
}

const getRarityClass = instance => {
  const rarity = String(getCard(instance)?.rarity || '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '-')
    .replaceAll('_', '-')

  return rarity ? `unpack-pack__card-item_${rarity}` : ''
}

const hasValue = value => {
  return value !== null && value !== undefined && value !== ''
}

const formatValue = value => {
  if (!hasValue(value)) {
    return ''
  }

  const normalized = String(value).replaceAll('_', ' ')

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
}

function resolveImageUrl(image) {
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

const resetModal = () => {
  step.value = 'confirm'
  isUnpacking.value = false
  error.value = ''
  revealedCards.value = []
}

const unpackPack = async () => {
  if (!props.packId || isUnpacking.value) {
    return
  }

  isUnpacking.value = true
  error.value = ''
  step.value = 'opening'

  try {
    const [response] = await Promise.all([
      axios.post(`/packs/${props.packId}/open`),
      wait(MINIMUM_OPENING_DURATION),
    ])

    revealedCards.value = getResponseCards(response)
    step.value = 'revealed'

    emit('opened', {
      packId: props.packId,
      cards: revealedCards.value,
      response: response.data,
    })
  } catch (requestError) {
    console.error('Unable to open pack:', requestError)

    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Unable to open the pack'

    step.value = 'confirm'
  } finally {
    isUnpacking.value = false
  }
}

const handleContinue = () => {
  handleClose()
}

const handleClose = () => {
  if (isUnpacking.value) {
    return
  }

  emit('update:show', false)
  emit('close')
}

const handleShowUpdate = value => {
  if (!value && isUnpacking.value) {
    return
  }

  emit('update:show', value)

  if (!value) {
    emit('close')
  }
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      resetModal()
    }
  },
)

watch(
  () => props.packId,
  () => {
    if (props.show) {
      resetModal()
    }
  },
)
</script>

<style lang="scss" scoped>
.unpack-pack {
  width: 100%;
  min-width: 0;

  &__title {
    color: var(--primary-color);
    letter-spacing: 0.08em;
    text-align: center;
    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 54, 28);
    }
  }

  &__confirmation {
    display: grid;
    align-items: center;
    gap: clamp(30px, 6vw, 90px);
    grid-template-columns: minmax(260px, 44%) minmax(0, 1fr);
  }

  &__pack {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 0;
    min-height: 430px;
  }

  &__pack-glow,
  &__opening-glow {
    position: absolute;
    top: 50%;
    left: 50%;

    width: 75%;
    aspect-ratio: 1;

    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgb(188 148 76 / 32%) 0%,
      rgb(188 148 76 / 12%) 38%,
      transparent 72%
    );

    pointer-events: none;

    transform: translate(-50%, -50%);

    filter: blur(20px);
  }

  &__pack-image {
    position: relative;
    z-index: 1;

    display: block;

    width: min(100%, 430px);
    max-height: 480px;

    object-fit: contain;

    filter: drop-shadow(0 25px 25px rgb(0 0 0 / 45%));
  }

  &__confirmation-content {
    min-width: 0;
  }

  &__confirmation-title {
    color: var(--primary-color);

    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }

  &__confirmation-text {
    max-width: 520px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 15px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 25px;
    }
  }

  &__quantity {
    display: flex;
    align-items: center;
    gap: 12px;

    font-family: var(--font-inter);
    font-size: 14px;

    &:not(:last-child) {
      margin-bottom: 30px;
    }
  }

  &__quantity-label {
    color: var(--hint-primary-color);
  }

  &__quantity-value {
    color: var(--primary-color);
    font-size: 18px;
    font-weight: 600;
  }

  &__actions {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 180px));
  }

  &__button {
    width: 100%;
    min-height: 44px;
  }

  &__error {
    margin-bottom: 20px;

    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 140%;
  }

  /*
   * Opening state
   */
  &_opening {
    display: flex;
    flex-direction: column;
    align-items: center;

    min-height: 600px;
  }

  &__opening {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: min(100%, 520px);
    min-height: 420px;
  }

  &__opening-rays {
    position: absolute;
    top: 50%;
    left: 50%;

    width: 620px;
    max-width: 95vw;
    aspect-ratio: 1;

    border-radius: 50%;
    background: repeating-conic-gradient(
      from 0deg,
      rgb(201 164 91 / 0%) 0deg 10deg,
      rgb(201 164 91 / 12%) 10deg 16deg,
      rgb(201 164 91 / 0%) 16deg 30deg
    );

    pointer-events: none;

    transform: translate(-50%, -50%);
    animation: unpack-rays 8s linear infinite;

    mask-image: radial-gradient(circle, #000 0%, transparent 68%);
  }

  &__opening-image {
    position: relative;
    z-index: 2;

    width: min(82%, 380px);
    max-height: 420px;

    object-fit: contain;

    animation: unpack-pack-opening 1.15s ease-in-out infinite alternate;

    filter: drop-shadow(0 0 15px rgb(193 153 76 / 45%))
      drop-shadow(0 24px 28px rgb(0 0 0 / 55%));
  }

  &__opening-particles {
    position: absolute;
    inset: 0;
    z-index: 3;

    overflow: hidden;

    pointer-events: none;
  }

  &__particle {
    --particle-angle: calc(var(--particle-index) * 30deg);
    --particle-distance: calc(90px + var(--particle-index) * 7px);
    --particle-delay: calc(var(--particle-index) * -0.12s);

    position: absolute;
    top: 50%;
    left: 50%;

    width: 5px;
    height: 5px;

    border-radius: 50%;
    background-color: var(--hint-primary-color);
    box-shadow: 0 0 10px var(--hint-primary-color);

    animation: unpack-particle 1.8s ease-out infinite;
    animation-delay: var(--particle-delay);
  }

  &__opening-text {
    position: relative;
    z-index: 4;

    margin-top: 12px;

    color: var(--hint-primary-color);
    font-family: var(--font-spectral-sc);
    font-size: 18px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__loader {
    width: 24px;
    height: 24px;

    margin-top: 18px;

    border: 2px solid rgb(255 255 255 / 18%);
    border-radius: 50%;

    animation: unpack-spin 0.75s linear infinite;

    border-top-color: var(--hint-primary-color);
  }

  /*
   * Revealed state
   */
  &_revealed {
    min-height: 650px;
  }

  &__cards {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 1.4vw, 22px);

    width: 100%;

    perspective: 1400px;
  }

  &__card-item {
    --rarity-glow: rgb(255 255 255 / 14%);

    position: relative;

    flex: 0 1 300px;

    min-width: 0;

    opacity: 0;

    animation: unpack-card-reveal 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    animation-delay: calc(var(--reveal-index) * 0.18s);

    &_common {
      --rarity-glow: rgb(190 190 190 / 24%);
    }

    &_uncommon {
      --rarity-glow: rgb(83 196 113 / 36%);
    }

    &_rare {
      --rarity-glow: rgb(41 151 255 / 42%);
    }

    &_epic {
      --rarity-glow: rgb(166 78 255 / 46%);
    }

    &_legendary {
      --rarity-glow: rgb(255 183 55 / 55%);
    }
  }

  &__card-glow {
    position: absolute;
    inset: 12% 9%;
    z-index: -1;

    border-radius: 50%;
    background-color: var(--rarity-glow);

    pointer-events: none;

    filter: blur(30px);
  }

  &__card {
    position: relative;

    width: 100%;
    aspect-ratio: 0.69;

    container-type: inline-size;
  }

  &__card-frame {
    position: absolute;
    inset: 50% auto auto 50%;
    z-index: 2;

    width: 100%;
    height: 100%;

    object-fit: contain;

    transform: translate(-50%, -50%);
  }

  &__card-image {
    position: absolute;
    top: 13%;
    left: 50%;
    z-index: 3;

    width: 55%;
    height: 45%;

    object-fit: cover;

    transform: translateX(-50%);
  }

  &__card-description {
    position: absolute;
    bottom: 22%;
    left: 50%;
    z-index: 3;

    display: -webkit-box;
    overflow: hidden;

    width: 48%;
    max-height: 17%;

    color: #411e00;
    font-family: var(--font-pt-serif);
    font-size: clamp(5px, 4.3cqi, 13px);
    font-weight: 500;
    line-height: 112%;
    text-align: center;

    pointer-events: none;

    transform: translateX(-50%);

    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;

    :deep(p) {
      margin: 0;
    }

    :deep(br) {
      display: none;
    }
  }

  &__card-stat {
    position: absolute;
    z-index: 4;

    color: var(--primary-color);
    font-family: var(--font-pt-serif);
    font-size: clamp(12px, 10cqi, 30px);
    font-weight: 700;
    line-height: 1;

    paint-order: stroke fill;

    &_mana {
      top: 12%;
      left: 19%;

      -webkit-text-stroke: clamp(1px, 0.8cqi, 2px) #01588a;
    }

    &_attack {
      bottom: 12%;
      left: 19%;

      -webkit-text-stroke: clamp(1px, 0.8cqi, 2px) #066508;
    }

    &_health {
      right: 19%;
      bottom: 12%;

      -webkit-text-stroke: clamp(1px, 0.8cqi, 2px) #7a0102;
    }
  }

  &__card-information {
    margin-top: 6px;

    text-align: center;
  }

  &__card-name {
    overflow: hidden;

    color: var(--primary-color);
    font-family: var(--font-spectral-sc);
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__card-rarity {
    display: block;

    margin-top: 4px;

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 12px;
  }

  &__success {
    margin-top: 34px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    text-align: center;
  }

  &__revealed-actions {
    display: flex;
    justify-content: center;

    margin-top: 20px;
  }

  &__continue {
    width: min(100%, 370px);
    min-height: 56px;

    font-family: var(--font-spectral-sc);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  &__empty {
    max-width: 540px;

    margin: 100px auto 0;

    text-align: center;
  }

  &__empty-title {
    color: var(--primary-color);

    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__empty-text {
    color: var(--secondary-color);
    line-height: 150%;
  }

  @media (max-width: $md3) {
    &__cards {
      flex-wrap: wrap;
    }

    &__card-item {
      flex-basis: calc(33.333% - 16px);

      max-width: 250px;
    }
  }

  @media (max-width: $md4) {
    &__confirmation {
      grid-template-columns: 1fr;
    }

    &__pack {
      min-height: 300px;
    }

    &__pack-image {
      width: min(75vw, 330px);
      max-height: 330px;
    }

    &__confirmation-content {
      text-align: center;
    }

    &__confirmation-text {
      margin-right: auto;
      margin-left: auto;
    }

    &__quantity,
    &__actions {
      justify-content: center;
    }

    &__actions {
      margin-right: auto;
      margin-left: auto;
    }

    &__card-item {
      flex-basis: calc(50% - 12px);

      max-width: 230px;
    }
  }

  @media (max-width: $md6) {
    &__actions {
      grid-template-columns: 1fr;
    }

    &__card-item {
      flex-basis: calc(50% - 6px);
    }

    &__card-name {
      font-size: 12px;
    }
  }
}

@keyframes unpack-pack-opening {
  0% {
    transform: translateY(-6px) scale(0.98) rotate(-1deg);
  }

  100% {
    transform: translateY(7px) scale(1.035) rotate(1deg);
  }
}

@keyframes unpack-rays {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes unpack-particle {
  0% {
    opacity: 0;

    transform: translate(-50%, -50%) rotate(var(--particle-angle))
      translateX(20px) scale(0.4);
  }

  30% {
    opacity: 1;
  }

  100% {
    opacity: 0;

    transform: translate(-50%, -50%) rotate(var(--particle-angle))
      translateX(var(--particle-distance)) scale(1);
  }
}

@keyframes unpack-card-reveal {
  0% {
    opacity: 0;

    transform: translateY(70px) rotateY(90deg) scale(0.78);
  }

  65% {
    opacity: 1;

    transform: translateY(-10px) rotateY(-5deg) scale(1.025);
  }

  100% {
    opacity: 1;

    transform: translateY(0) rotateY(0deg) scale(1);
  }
}

@keyframes unpack-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(.unpack-pack-modal) {
  max-width: 1540px;
}

:global(.unpack-pack-modal .base-modal__frame) {
  padding: clamp(36px, 4vw, 70px) clamp(16px, 4vw, 64px);

  background-color: var(--bg-fifth-color);
}

:global(.unpack-pack-modal__content) {
  width: 100%;
}
</style>
