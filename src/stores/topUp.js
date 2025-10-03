import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'
import axios from '@/plugins/axios'

export const useTopUpStore = defineStore('topUp', () => {
  const creditPacks = ref([])
  const creditPackId = ref(null)
  const error = ref('')

  const currStore = useCurrStore()
  const profileStore = useProfileStore()

  const fetchCreditPacks = async () => {
    try {
      const {data: {payload}} = await axios.get('/packs', {
        params: {
          currency: currStore.currency.code,
        }
      });
      creditPacks.value = payload;
    } catch (e) {
      console.error(e)
    }
  }

  const topUp = async (
    selectedMethodId,
    amount,
    country,
    city,
    address,
    postcode,
    name,
    surname,
    phone,
    email
  ) => {
    try {
      const data = {
        name: profileStore.profile.name || name,
        surname: profileStore.profile.surname || surname,
        phone: profileStore.profile.phone || phone,
        email: profileStore.profile.email || email,
        country,
        city,
        address,
        postCode: postcode,
        currency: currStore.currency.code,
        payment_method_id: selectedMethodId
      };

      if (creditPackId.value) {
        data['pack_id'] = creditPackId.value;
      } else {
        data['amount'] = parseFloat(amount);
      }

      const response = await axios.post(
        '/deposit/checkout',
          data
      )

      window.location = response.data.redirect_url
    } catch (err) {
      error.value = err.response?.data?.message || 'Unknown error'
      setTimeout(() => {
        error.value = ''
      }, 3000)
    }
  }

  function setCreditPackId(id) {
    creditPackId.value = id
  }

  function clearCreditPackId() {
    setCreditPackId(null);
  }

  watch(() => currStore.currency, async () => {
    await fetchCreditPacks();
  });

  return {
    creditPacks,
    error,
    creditPackId,
    topUp,
    fetchCreditPacks,
    setCreditPackId,
    clearCreditPackId
  }
})
