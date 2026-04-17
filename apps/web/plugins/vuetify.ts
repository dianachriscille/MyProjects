import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components, directives,
    theme: { defaultTheme: 'light', themes: { light: { colors: { primary: '#1565C0', secondary: '#424242', accent: '#FF6F00' } } } },
  });
  nuxtApp.vueApp.use(vuetify);
});
