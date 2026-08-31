<template>
  <BaseModal
    :show="modelValue"
    size="medium"
    labelledby="avatar-picker-title"
    @update:show="handleModalUpdate"
    @close="close"
  >
    <div class="avatar-picker-modal">
      <div class="avatar-picker-modal__header">
        <h2 id="avatar-picker-title" class="avatar-picker-modal__title _h3">
          {{ $t('Choose Avatar') }}
        </h2>

        <p class="avatar-picker-modal__text">
          {{ $t('Select your avatar') }}
        </p>
      </div>

      <div v-if="userStore.isAvatarsLoading" class="avatar-picker-modal__state">
        <LoadingSpinner class="avatar-picker-modal__loader" />
      </div>

      <div
        v-else-if="userStore.avatars.length === 0"
        class="avatar-picker-modal__state"
      >
        <span>
          {{ $t('Failed to load avatars') }}
        </span>
      </div>

      <div v-else class="avatar-picker-modal__grid">
        <button
          v-for="avatar in userStore.avatars"
          :key="avatar.id"
          type="button"
          class="avatar-picker-modal__item"
          :class="{
            'avatar-picker-modal__item_active':
              String(selectedAvatar) === String(avatar.id),
          }"
          :aria-pressed="String(selectedAvatar) === String(avatar.id)"
          @click="selectAvatar(avatar.id)"
        >
          <img :src="avatar.url" :alt="`Avatar ${avatar.id}`" />

          <span
            v-if="String(selectedAvatar) === String(avatar.id)"
            class="avatar-picker-modal__selected"
            aria-hidden="true"
          >
            ✓
          </span>
        </button>
      </div>

      <div class="avatar-picker-modal__actions">
        <BaseButton
          type="button"
          variant="bordered"
          :disabled="userStore.isAvatarUpdating"
          @click="close"
        >
          {{ $t('Cancel') }}
        </BaseButton>

        <BaseButton
          type="button"
          :disabled="!selectedAvatar || userStore.isAvatarUpdating"
          @click="saveAvatar"
        >
          <LoadingSpinner
            v-if="userStore.isAvatarUpdating"
            class="avatar-picker-modal__save-loader"
          />

          <span v-else>
            {{ $t('Save Avatar') }}
          </span>
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'updated'])

const { t } = useI18n()
const toast = useToast()
const userStore = useUserStore()

const selectedAvatar = ref(null)

const handleModalUpdate = value => {
  emit('update:modelValue', value)
}

const close = () => {
  emit('update:modelValue', false)
}

const selectAvatar = avatarId => {
  selectedAvatar.value = avatarId
}

const loadAvatars = async () => {
  try {
    if (!userStore.avatars.length) {
      await userStore.fetchAvatars()
    }

    selectedAvatar.value =
      userStore.userAvatarId || userStore.avatars[0]?.id || 1
  } catch (error) {
    console.error('Failed to load avatars:', error)

    toast.error(t('Failed to load avatars'))
  }
}

const saveAvatar = async () => {
  if (!selectedAvatar.value || userStore.isAvatarUpdating) {
    return
  }

  try {
    await userStore.updateAvatar(selectedAvatar.value)

    toast.success(t('Avatar updated successfully'))

    emit('updated')

    close()
  } catch (error) {
    console.error('Failed to update avatar:', error)

    toast.error(t('Failed to update avatar'))
  }
}

watch(
  () => props.modelValue,
  async isOpen => {
    if (!isOpen) {
      return
    }

    await loadAvatars()
  },
)
</script>

<style lang="scss" scoped>
.avatar-picker-modal {
  display: flex;
  flex-direction: column;
  gap: 24px;

  width: 100%;

  &__header {
    padding-right: 40px;
    padding-bottom: 18px;

    border-bottom: 1px solid var(--border-secondary-color);
  }

  &__title {
    color: var(--primary-color);
    text-transform: uppercase;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__text {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 140%;
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 220px;

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
  }

  &__loader {
    width: 42px;
    height: 42px;
  }

  &__grid {
    display: grid;
    overflow-y: auto;
    gap: 14px;
    grid-template-columns: repeat(4, minmax(0, 1fr));

    max-height: 430px;

    padding: 4px;
  }

  &__item {
    position: relative;

    overflow: hidden;

    width: 100%;
    aspect-ratio: 1 / 1;

    padding: 4px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 10px;
    outline: none;
    background-color: var(--bg-fourth-color);

    cursor: pointer;

    transition:
      border-color 0.25s ease,
      background-color 0.25s ease,
      box-shadow 0.25s ease,
      transform 0.25s ease;

    img {
      display: block;

      width: 100%;
      height: 100%;

      border-radius: 7px;

      object-fit: cover;
      object-position: center top;
    }

    &:focus-visible {
      border-color: var(--hint-secondary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-secondary-color);

        transform: translateY(-2px);
      }
    }

    &_active {
      border-color: var(--hint-primary-color);
      background-color: rgb(179 154 107 / 8%);
      box-shadow:
        0 0 0 1px var(--hint-primary-color),
        inset 0 0 20px rgb(179 154 107 / 12%);
    }
  }

  &__selected {
    position: absolute;
    right: 8px;
    bottom: 8px;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 28px;
    height: 28px;

    border-radius: 50%;
    background: var(--hint-gradient);
    box-shadow: 0 4px 12px rgb(0 0 0 / 35%);

    color: var(--bg-primary-color);
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 700;
  }

  &__actions {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    padding-top: 18px;

    border-top: 1px solid var(--border-secondary-color);
  }

  &__save-loader {
    width: 20px;
    height: 20px;
  }

  @media (max-width: $md5) {
    gap: 18px;

    &__grid {
      gap: 10px;
      grid-template-columns: repeat(3, minmax(0, 1fr));

      max-height: 390px;
    }
  }

  @media (max-width: $md7) {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__actions {
      grid-template-columns: 1fr;
    }
  }
}
</style>
