import './assets/styles/main.scss'
import 'flag-icons/css/flag-icons.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from './plugins/axios'
import VueAxios from 'vue-axios'
import i18n from './i18n'
import VueAwesomePaginate from 'vue-awesome-paginate'
import './validation'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(VueAxios, axios)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(VueAwesomePaginate)
app.provide('axios', app.config.globalProperties.axios)

app.mount('#app')
