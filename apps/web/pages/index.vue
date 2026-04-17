<template>
  <div>
    <h1 class="text-h4 mb-4">Dashboard</h1>
    <v-row>
      <v-col cols="12" md="4"><v-card color="primary" dark class="pa-4"><v-card-title>Students</v-card-title><v-card-text class="text-h3">{{ stats.students }}</v-card-text></v-card></v-col>
      <v-col cols="12" md="4"><v-card color="orange" dark class="pa-4"><v-card-title>Pending Enrollments</v-card-title><v-card-text class="text-h3">{{ stats.pendingEnrollments }}</v-card-text></v-card></v-col>
      <v-col cols="12" md="4"><v-card color="green" dark class="pa-4"><v-card-title>Outstanding Balance</v-card-title><v-card-text class="text-h3">₱{{ stats.outstandingBalance?.toLocaleString() }}</v-card-text></v-card></v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
const { apiFetch } = useApi();
const stats = ref({ students: 0, pendingEnrollments: 0, outstandingBalance: 0 });
onMounted(async () => {
  try {
    const [students, enrollments, billing] = await Promise.all([
      apiFetch<any>('/api/v1/students?limit=1'),
      apiFetch<any>('/api/v1/enrollments?status=submitted&limit=1'),
      apiFetch<any>('/api/v1/billing?status=unpaid&limit=1'),
    ]);
    stats.value = { students: students.total || 0, pendingEnrollments: enrollments.total || 0, outstandingBalance: 0 };
  } catch {}
});
</script>
