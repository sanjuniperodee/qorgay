import '@/assets/nullstyle.scss'
import '@/assets/fontstyle.scss'
import '@mdi/font/css/materialdesignicons.css'
import '@fortawesome/fontawesome-free/css/all.css'
import DateFnsAdapter from '@date-io/date-fns'
import enUS from 'date-fns/locale/en-US'
import ru from 'date-fns/locale/ru'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

// Vuetify 2 imports
import 'vuetify/dist/vuetify.min.css'
import Vuetify from 'vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import '@mdi/font/css/materialdesignicons.min.css'
// i18n
import { createI18n } from 'vue-i18n'
import enLocale from './locales/en.json'
import ruLocale from './locales/ru.json'
import kzLocale from './locales/kz.json'
import lazyLoad from '@/helpers/lazy-load'

const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'ru',
  messages: {
    en: enLocale,
    ru: ruLocale,
    kz: kzLocale
  }
})

const vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  lang: {
    t: (key, ...params) => i18n.global.t(key, params)
  },
  date: {
    adapter: DateFnsAdapter,
    locale: ru // Single locale for Vuetify 2
  }
})

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(i18n)
app.use(router)
app.use(vuetify as any)
app.directive('lazy', lazyLoad)

app.mount('#app')
