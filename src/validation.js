import { defineRule } from 'vee-validate'
import {
  required,
  email,
  confirmed,
  min,
  max,
  min_value,
  numeric,
  regex,
} from '@vee-validate/rules'

defineRule('required', required)
defineRule('email', email)
defineRule('confirmed', confirmed)
defineRule('min', min)
defineRule('max', max)
defineRule('min_value', min_value)
defineRule('numeric', numeric)
defineRule('regex', regex)

defineRule('decimal', (value, [decimals = 2] = []) => {
  if (!value) return true // Пропускаем, если значение пустое (required проверит отдельно)

  const regex = new RegExp(`^\\d+(\\.\\d{1,${decimals}})?$`)
  return regex.test(value)
})
