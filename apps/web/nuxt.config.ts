import vuetify from 'vite-plugin-vuetify';

export default defineNuxtConfig({
  ssr: true,
  modules: ['@nuxtjs/supabase'],
  css: ['vuetify/styles', '@mdi/font/css/materialdesignicons.css'],
  build: { transpile: ['vuetify'] },
  vite: { plugins: [vuetify({ autoImport: true })] },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
    },
  },
  supabase: { redirect: false },
});
