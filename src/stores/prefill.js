import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'user-prefill'

const DEFAULT_DATA = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  phoneCountry: '',
  country: '',
  city: '',
  address: '',
  zip: '',
}

const normalizePhone = (value) => {
  return String(value || '').replace(/\D/g, '')
}

const normalizeCountry = (value) => {
  return String(value || '').toUpperCase()
}

const normalizeString = (value) => {
  return String(value ?? '').trim()
}

const getLocalData = () => {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_DATA }
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return { ...DEFAULT_DATA }
    }

    const parsed = JSON.parse(stored)

    return {
      ...DEFAULT_DATA,
      ...(parsed && typeof parsed === 'object' ? parsed : {}),
    }
  } catch (error) {
    console.error('Failed to read prefill data:', error)

    return { ...DEFAULT_DATA }
  }
}

export const usePrefillStore = defineStore('prefill', () => {
  const data = ref({
    ...DEFAULT_DATA,
  })

  const initialized = ref(false)

  const save = () => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const nextValue = JSON.stringify(data.value)
      const currentValue = window.localStorage.getItem(STORAGE_KEY)

      if (currentValue === nextValue) {
        return
      }

      window.localStorage.setItem(STORAGE_KEY, nextValue)
    } catch (error) {
      console.error('Failed to save prefill data:', error)
    }
  }

  const setField = (field, value) => {
    if (!(field in DEFAULT_DATA)) {
      return
    }

    const normalizedValue = value ?? ''

    if (data.value[field] === normalizedValue) {
      return
    }

    data.value[field] = normalizedValue

    save()
  }

  const setData = (values = {}) => {
    let changed = false

    Object.keys(DEFAULT_DATA).forEach((field) => {
      if (!(field in values)) {
        return
      }

      const value = values[field] ?? ''

      if (data.value[field] === value) {
        return
      }

      data.value[field] = value
      changed = true
    })

    if (changed) {
      save()
    }
  }

  const getProfileData = (profile = {}) => {
    return {
      firstName: normalizeString(profile.name),
      lastName: normalizeString(profile.surname),
      email: normalizeString(profile.email),
      phone: normalizePhone(profile.phone),
      phoneCountry: normalizeCountry(profile.phone_country),
      country: normalizeCountry(profile.country?.iso || profile.country_iso || profile.country),
      city: normalizeString(profile.city),
      address: normalizeString(profile.address),
      zip: normalizeString(profile.zip),
    }
  }

  const initialize = (profile = {}) => {
    const localData = getLocalData()
    const profileData = getProfileData(profile)

    const nextData = {}

    Object.keys(DEFAULT_DATA).forEach((field) => {
      nextData[field] = profileData[field] || localData[field] || DEFAULT_DATA[field]
    })

    data.value = nextData
    initialized.value = true

    save()

    return {
      ...data.value,
    }
  }

  return {
    data,
    initialized,
    initialize,
    setField,
    setData,
    save,
  }
})
