<script setup>
import * as yup from 'yup'
import { storeToRefs } from 'pinia'
import { useTopUpModalStore } from '@/stores/topUpModal'
import { useProfileStore } from '@/stores/profile'
import UiSvgIcon from '@/components/shared/UiSvgIcon.vue'
import ProfileIcon from '@/static/images/icons/profile.svg'
import PlusIcon from '@/static/images/icons/action/plus.svg'
import UiText, { TextFont, TextSize, TextTheme, TextWeight } from '@/components/shared/UiText.vue'
import UiButton from '@/components/shared/UiButton.vue'
import PriceForm from '@/components/price/PriceForm.vue'

const props = defineProps({
  className: {
    type: String,
    default: '',
  },
})
const profileStore = useProfileStore()
const topUpModalStore = useTopUpModalStore()

const customAmountSchema = yup.object({
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .positive('Amount must be greater than 0')
    .integer('Amount must be an integer')
    .required('Amount is required'),
})

function onSubmitCustomAmount(values) {
  const { amount } = storeToRefs(topUpModalStore)
  // Передаём исходное значение как количество кредитов, конвертация будет в модалке
  amount.value = values.amount
  topUpModalStore.setStep(2)
  topUpModalStore.openModal()
}
</script>

<template>
  <div :class="['main__card', props.className]">
    <div class="main__info info">
      <div class="info__profile">
        <UiSvgIcon class="info__icon"><ProfileIcon /></UiSvgIcon>
      </div>
      <div class="info__about">
        <UiText
          class="info__name"
          :weight="TextWeight.BOLD"
          :text="`${profileStore.profile.name} ${profileStore.profile.surname}`"
        />
        <UiText class="info__email" :theme="TextTheme.EMAIL" :text="profileStore.profile.email" />
      </div>
    </div>
    <UiButton class="main__balance balance" @click="topUpModalStore.openModal()">
      <UiText class="balance__label" :theme="TextTheme.SECONDARY" :text="$t('My balance')" />
      <div class="balance__bottom">
        <div class="balance__value">
          <div class="balance__icon _ibg-contain">
            <img src="@/static/images/icons/creadit.webp" />
          </div>
          <UiText
            :weight="TextWeight.BOLD"
            :font="TextFont.RED"
            :size="TextSize.H4"
            :title="String(profileStore.profile.balance)"
          />
        </div>
        <div class="balance__button">
          <UiText :weight="TextWeight.BOLD" :font="TextFont.ROBOTO" :title="$t('Top up')" />
          <UiSvgIcon class="balance__plus"><PlusIcon /></UiSvgIcon>
        </div>
      </div>
    </UiButton>
    <PriceForm
      className="main__form"
      :custom-amount-schema="customAmountSchema"
      :on-submit-custom-amount="onSubmitCustomAmount"
      :title="false"
      :description="$t('Fast TOP UP')"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;
.main {
  &__card {
    background-color: var(--bg-secondary-color);
    border-radius: var(--border-radius);
    @include adaptiveValue('padding-top', 20, 15, 1470, 992, 1);
    @include adaptiveValue('padding-left', 20, 15, 1470, 992, 1);
    @include adaptiveValue('padding-bottom', 35, 15, 1470, 992, 1);
    @include adaptiveValue('padding-right', 20, 15, 1470, 992, 1);
  }
  &__info {
    &:not(:last-child) {
      @include adaptiveValue(' margin-bottom', 35, 15, 1470, 992, 1);
    }
  }
  &__balance {
    &:not(:last-child) {
      @include adaptiveValue(' margin-bottom', 97, 15, 1470, 992, 1);
    }
  }
  &__form {
    padding: 0px !important;
  }
}

.info {
  display: flex;
  gap: 20px;
  align-items: center;
  &__profile {
  }
  &__icon {
    background-color: var(--seventh-color);
    @include adaptiveValue('min-width', 103, 40);
    @include adaptiveValue('min-height', 103, 40);
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    svg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 43px;
      height: 43px;
      fill: var(--sixth-color);
      @include adaptiveValue('width', 43, 23);
      @include adaptiveValue('height', 43, 23);
    }
  }
  &__about {
  }
  &__name {
    &:not(:last-child) {
      margin-bottom: 5px;
    }
  }
  &__email {
  }
}

.balance {
  border-radius: var(--border-radius);
  background-color: var(--bg-primary-color);
  border: 1px solid var(--bg-fifth-color);
  width: 100%;
  padding: 15px;
  @media (any-hover: hover) {
    &:hover {
      .balance__plus {
        background-color: transparent;
        svg {
          fill: var(--primary-color);
        }
      }
    }
  }
  &__label {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }
  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
  &__value {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  &__icon {
    width: 24px;
    height: 24px;
  }
  &__button {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  &__plus {
    min-width: 26px;
    min-height: 26px;
    border: 1px solid var(--bg-primary-color-inverted);
    background-color: var(--bg-primary-color-inverted);
    transition: background-color 0.3s ease 0s;
    border-radius: var(--border-radius);
    position: relative;
    svg {
      width: 20px;
      height: 20px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      fill: var(--secondary-color-inverted);
      transition: fill 0.3s ease 0s;
    }
  }
}
</style>
