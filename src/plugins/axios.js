import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_API,
  timeout: 50000,
  withCredentials: true,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
})

// Подхватить токен из localStorage
const token = localStorage.getItem('access_token')
if (token) {
  instance.defaults.headers.common['Authorization'] = token
}

// Вспомогательная функция для установки токена
export function setAuthToken(token) {
  localStorage.setItem('access_token', token)
  instance.defaults.headers.common['Authorization'] = token
}

// Вспомогательная функция для удаления токена
export function clearAuthToken() {
  localStorage.removeItem('access_token')
  delete instance.defaults.headers.common['Authorization']
}

export default instance
