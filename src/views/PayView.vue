<template>
  <main class="main">
    <div class="section breadcrumbs-section">
      <div class="wrapper"></div>
    </div>
    <div class="section static-section pay-section">
      <div class="wrapper">
        <Form
          :validation-schema="mergedSchema"
          @submit="onCardSubmit"
          :initial-values="{
            card_holdername:
              profileStore.profile?.name.toUpperCase() +
                ' ' +
                profileStore.profile?.surname.toUpperCase() || '',
            email: profileStore.profile?.email || '',
            terms: false,
          }"
          v-slot="{ meta }"
          ref="card_form"
        >
          <div class="form-fields-wrapper">
            <!-- ================= TOP-UP FIELDS ================= -->

            <!-- Amount -->
            <label class="label">
              <div class="desc">{{ $t('Enter the replenishment amount') }}:*</div>
              <div class="input-container">
                <div class="text text-18 text-purple-custom uppercase input-curr">
                  {{ currStore.currency.code }}
                </div>
                <Field name="amount" v-slot="{ field, errorMessage }">
                  <input
                    type="number"
                    v-bind="field"
                    :min="settingsStore.settings.min_order_amount"
                    :max="settingsStore.settings.max_order_amount"
                  />
                  <span v-if="errorMessage" class="error">{{ $t(errorMessage) }}</span>
                </Field>
              </div>
            </label>

            <!-- Email -->
            <label class="label flex items-center">
              <div class="desc">{{ $t('E-mail') }}:*</div>
              <div class="input-container">
                <Field name="email" v-slot="{ field }">
                  <input type="text" v-bind="field" readonly />
                </Field>
              </div>
            </label>

            <!-- ================= CARD FIELDS ================= -->

            <label class="label input-container">
              <div class="desc">{{ $t('Card number') }}</div>
              <Field name="formattedPan" v-slot="{ field, errorMessage }">
                <input
                  type="text"
                  :value="formattedPan"
                  @input="
                    (e) => {
                      const masked = formatCardNumber(e.target.value)
                      formattedPan = masked
                      field.onChange(masked)
                    }
                  "
                />
                <span v-if="errorMessage" class="error">{{ $t(errorMessage) }}</span>
              </Field>
            </label>

            <label class="label input-container">
              <div class="desc">{{ $t('Expiration Date') }} (MM/YY)</div>
              <Field name="expiration_date" v-slot="{ field, errorMessage }">
                <input
                  type="text"
                  :value="expiration_date"
                  @input="
                    (e) => {
                      expiration_date = formatExpirationDate(e.target.value)
                      field.onChange(e)
                    }
                  "
                />
                <span v-if="errorMessage" class="error">{{ $t(errorMessage) }}</span>
              </Field>
            </label>

            <label class="label input-container">
              <div class="desc">{{ $t('Card Holder Name') }}</div>
              <Field name="card_holdername" v-slot="{ field }">
                <input type="text" v-bind="field" readonly />
              </Field>
            </label>

            <label class="label input-container">
              <div class="desc">{{ $t('CVV') }}</div>
              <Field name="card_cvv" v-slot="{ field, errorMessage }">
                <input
                  type="password"
                  :value="card_cvv"
                  @input="
                    (e) => {
                      const masked = formatCardCvv(e.target.value)
                      card_cvv = masked
                      field.onChange(masked)
                    }
                  "
                />
                <span v-if="errorMessage" class="error">{{ $t(errorMessage) }}</span>
              </Field>
            </label>
            <!-- Terms -->
            <div class="label input-container">
              <label class="checkbox-label flex justify-center flex-wrap items-center">
                <Field type="checkbox" name="terms" v-slot="{ field }">
                  <input type="checkbox" v-bind="field" />
                </Field>
                <div class="dot"></div>
                <div class="text text-16" v-if="staticStore.static?.length">
                  {{ $t('I’ve read and agree with') }}
                  <RouterLink
                    :to="
                      '/static/' +
                      staticStore.static
                        .find((item) => item.is_terms)
                        .title.toLowerCase()
                        .replace(/ /g, '-')
                    "
                    class="text-purple-custom"
                  >
                    {{ $t('T&Cs') }}
                  </RouterLink>
                  {{ $t('and') }}
                  <RouterLink
                    :to="
                      '/static/' +
                      staticStore.static
                        .find((item) => item.is_privacy)
                        .title.toLowerCase()
                        .replace(/ /g, '-')
                    "
                    class="text-purple-custom"
                  >
                    {{ $t('Privacy Policy') }}
                  </RouterLink>
                </div>
              </label>
            </div>

            <!-- ================= SUBMIT ================= -->
            <div class="cart-bottom">
              <button type="submit" :disabled="!meta.valid" class="button w-132 blue">
                <span v-if="!loaded">{{ $t('Pay') }}</span>
                <span v-if="loaded" class="loader"></span>
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  </main>
</template>
<script setup>
import axios from '@/plugins/axios'
import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'
import { Field, Form } from 'vee-validate'
import { ref, watch } from 'vue'
import * as yup from 'yup'

const currStore = useCurrStore()
const settingsStore = useSettingsStore()
const staticStore = useStaticStore()
const profileStore = useProfileStore()

// Step control

// Form refs and fields
const card_form = ref(null)
const formattedPan = ref('')
const expiration_date = ref('')
const card_cvv = ref('')

const loaded = ref(false)

// Validation schema
const mergedSchema = yup.object({
  // Card validation
  formattedPan: yup
    .string()
    .required('Card number is required')
    .matches(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'Card number must be 16 digits formatted'),
  expiration_date: yup
    .string()
    .required('Expiration date is required')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiration date'),
  card_holdername: yup.string().required('Card holder name is required'),
  card_cvv: yup
    .string()
    .required('CVV is required')
    .matches(/^\d{3}$/, 'CVV must be exactly 3 digits'),

  // Top-up validation
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .when([], {
      is: () => !!settingsStore.settings.min_order_amount,
      then: (schema) =>
        schema.min(
          Number(settingsStore.settings.min_order_amount),
          `Minimum amount is ${settingsStore.settings.min_order_amount} ${currStore.currency.code}`,
        ),
    })
    .when([], {
      is: () => !!settingsStore.settings.max_order_amount,
      then: (schema) =>
        schema.max(
          Number(settingsStore.settings.max_order_amount),
          `Maximum amount is ${settingsStore.settings.max_order_amount} ${currStore.currency.code}`,
        ),
    }),
  terms: yup.boolean().oneOf([true], 'You must accept terms'),
})

// =======================
// Format/Sanitize Helpers
// =======================
function formatCardCvv(value) {
  value = value.replace(/\D/g, '')
  return value.slice(0, 3)
}

function formatCardNumber(value) {
  value = value.replace(/\D/g, '')
  if (value.length > 16) value = value.slice(0, 16)
  return value.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpirationDate(value) {
  value = value.replace(/\D/g, '')
  if (value.length > 4) value = value.slice(0, 4)
  if (value.length > 2) {
    value = value.slice(0, 2) + '/' + value.slice(2)
  }
  const [month] = value.split('/')
  if (month && parseInt(month, 10) > 12) {
    value = '12' + value.slice(2)
  }
  return value
}

async function onCardSubmit(values) {
  try {
    const [expiry_month, expiry_year] = values.expiration_date.split('/')

    const formData = {
      amount: values.amount,
      email: values.email,
      card_number: values.formattedPan.replace(/\s+/g, ''),
      expiry_month,
      expiry_year,
      cardholder_name: values.card_holdername,
      cvv: values.card_cvv,
      name: profileStore.profile?.name,
      surname: profileStore.profile?.surname,
      currency: currStore.currency.code,
    }

    const combinedData = formData

    loaded.value = true
    const res = await axios.post(
      `deposit/checkout/execute`,
      combinedData,
    )

    if (res.data.status === 'ERROR' && res.data.message) {
      loaded.value = false
      card_form.value.setErrors({ card_cvv: res.data.message })
    } else {
      loaded.value = false
      window.location = res.data.redirect_url
    }
  } catch (error) {
    loaded.value = false
    if (error.response) {
      if (error.response.data.errors) {
        card_form.value.setErrors(error.response.data.errors)
      } else if (error.response.data.status === 'ERROR' && error.response.data.message) {
        card_form.value.setErrors({ card_cvv: error.response.data.message })
      } else {
        card_form.value.setErrors({ card_cvv: error.response.data.message })
      }
    }
  }
}
watch(
  () => profileStore.profile,
  (newProfile) => {
    if (newProfile && card_form.value) {
      card_form.value.setValues({
        card_holdername:
          newProfile.name.toUpperCase() + ' ' + newProfile.surname.toUpperCase() || '',
        email: newProfile.email || '',
      })
    }
  },
  { immediate: true },
)
</script>
