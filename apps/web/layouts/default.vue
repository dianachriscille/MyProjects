<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/" data-testid="nav-dashboard" />
        <v-list-item v-if="canAccess(['registrar','admin'])" prepend-icon="mdi-account-group" title="Students" to="/students" data-testid="nav-students" />
        <v-list-item v-if="canAccess(['registrar','admin'])" prepend-icon="mdi-clipboard-text" title="Enrollment" to="/enrollments" data-testid="nav-enrollments" />
        <v-list-item v-if="canAccess(['finance','admin'])" prepend-icon="mdi-cash-multiple" title="Billing" to="/billing" data-testid="nav-billing" />
        <v-list-item v-if="canAccess(['admin'])" prepend-icon="mdi-account-cog" title="Users" to="/users" data-testid="nav-users" />
        <v-list-item v-if="canAccess(['admin'])" prepend-icon="mdi-history" title="Audit Logs" to="/audit-logs" data-testid="nav-audit" />
        <v-list-item v-if="canAccess(['admin'])" prepend-icon="mdi-file-chart" title="Reports" to="/reports" data-testid="nav-reports" />
        <v-list-item v-if="canAccess(['admin'])" prepend-icon="mdi-cog" title="Settings" to="/settings" data-testid="nav-settings" />
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" data-testid="menu-toggle" />
      <v-toolbar-title>EduCore ERP</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="logout" data-testid="logout-btn"><v-icon>mdi-logout</v-icon></v-btn>
    </v-app-bar>
    <v-main><v-container fluid><slot /></v-container></v-main>
  </v-app>
</template>

<script setup lang="ts">
const drawer = ref(true);
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const role = computed(() => user.value?.user_metadata?.role || 'admin');
const canAccess = (roles: string[]) => roles.includes(role.value);
const logout = async () => { await supabase.auth.signOut(); navigateTo('/login'); };
</script>
