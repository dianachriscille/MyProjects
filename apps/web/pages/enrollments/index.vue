<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Enrollments</h1>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" to="/enrollments/new" data-testid="enrollment-new">New Enrollment</v-btn>
    </div>
    <v-card>
      <v-card-text>
        <v-row class="mb-2">
          <v-col cols="12" md="4"><v-select v-model="statusFilter" :items="['draft','submitted','approved','rejected','enrolled']" label="Status" clearable density="compact" data-testid="enrollment-status-filter" /></v-col>
        </v-row>
        <v-data-table-server v-model:items-per-page="limit" :headers="headers" :items="enrollments" :items-length="total" :loading="loading" @update:options="loadData" data-testid="enrollment-table">
          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" size="small">{{ item.status }}</v-chip>
          </template>
          <template #item.actions="{ item }">
            <v-btn icon size="small" :to="`/enrollments/${item.id}`" data-testid="enrollment-view"><v-icon>mdi-eye</v-icon></v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { apiFetch } = useApi();
const headers = [
  { title: 'Applicant', key: 'applicantName' }, { title: 'Grade', key: 'gradeLevel' },
  { title: 'Status', key: 'status' }, { title: 'Submitted', key: 'submittedAt' }, { title: '', key: 'actions', sortable: false },
];
const enrollments = ref<any[]>([]);
const total = ref(0);
const loading = ref(false);
const statusFilter = ref('');
const limit = ref(20);

const statusColor = (s: string) => ({ draft: 'grey', submitted: 'orange', approved: 'blue', rejected: 'red', enrolled: 'green' }[s] || 'grey');

const loadData = async ({ page, itemsPerPage }: any = { page: 1, itemsPerPage: 20 }) => {
  loading.value = true;
  const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage) });
  if (statusFilter.value) params.set('status', statusFilter.value);
  const res = await apiFetch<any>(`/api/v1/enrollments?${params}`);
  enrollments.value = res.data.map((e: any) => ({ ...e, applicantName: `${(e.applicantData as any)?.lastName}, ${(e.applicantData as any)?.firstName}` }));
  total.value = res.total;
  loading.value = false;
};

watch(statusFilter, () => loadData());
</script>
