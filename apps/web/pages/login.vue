<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh">
      <v-card width="400" class="pa-6">
        <v-card-title class="text-h5 text-center">EduCore ERP</v-card-title>
        <v-card-subtitle class="text-center">Sign in to continue</v-card-subtitle>
        <v-form @submit.prevent="login" class="mt-4">
          <v-text-field v-model="email" label="Email" type="email" prepend-icon="mdi-email" :rules="[v => !!v || 'Email is required']" data-testid="login-email" />
          <v-text-field v-model="password" label="Password" type="password" prepend-icon="mdi-lock" :rules="[v => !!v || 'Password is required']" data-testid="login-password" />
          <v-alert v-if="error" type="error" class="mb-4" data-testid="login-error">{{ error }}</v-alert>
          <v-btn type="submit" color="primary" block :loading="loading" data-testid="login-submit">Sign In</v-btn>
        </v-form>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });
const supabase = useSupabaseClient();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const login = async () => {
  loading.value = true;
  error.value = '';
  const { error: err } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value });
  loading.value = false;
  if (err) { error.value = 'Invalid email or password'; return; }
  navigateTo('/');
};
</script>
