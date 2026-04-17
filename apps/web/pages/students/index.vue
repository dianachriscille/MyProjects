<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Students</h1>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-download" @click="exportCsv" data-testid="students-export">Export CSV</v-btn>
    </div>
    <v-card>
      <v-card-text>
        <v-row class="mb-2">
          <v-col cols="12" md="4"><v-text-field v-model="search" label="Search by name or LRN" prepend-icon="mdi-magnify" clearable density="compact" data-testid="students-search" /></v-col>
          <v-col cols="12" md="3"><v-select v-model="gradeFilter" :items="gradeLevels" label="Grade Level" clearable density="compact" data-testid="students-grade-filter" /></v-col>
          <v-col cols="12" md="3"><v-select v-model="statusFilter" :items="['applicant','enrolled','withdrawn','graduated']" label="Status" clearable density="compact" data-testid="students-status-filter" /></v-col>
        </v-row>
        <v-data-table-server v-model:items-per-page="limit" :headers="headers" :items="students" :items-length="total" :loading="loading" @update:options="loadData" data-testid="students-table">
          <template #item.actions="{ item }">
            <v-btn icon size="small" :to="`/students/${item.id}`" data-testid="student-view"><v-icon>mdi-eye</v-icon></v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { apiFetch } = useApi();
const gradeLevels = ['K','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12'];
const headers = [
  { title: 'LRN', key: 'lrn' }, { title: 'Last Name', key: 'lastName' }, { title: 'First Name', key: 'firstName' },
  { title: 'Grade', key: 'gradeLevel' }, { title: 'Status', key: 'status' }, { title: '', key: 'actions', sortable: false },
];
const students = ref<any[]>([]);
const total = ref(0);
const loading = ref(false);
const search = ref('');
const gradeFilter = ref('');
const statusFilter = ref('');
const limit = ref(20);

const loadData = async ({ page, itemsPerPage }: any = { page: 1, itemsPerPage: 20 }) => {
  loading.value = true;
  const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage) });
  if (search.value) params.set('search', search.value);
  if (gradeFilter.value) params.set('gradeLevel', gradeFilter.value);
  if (statusFilter.value) params.set('status', statusFilter.value);
  const res = await apiFetch<any>(`/api/v1/students?${params}`);
  students.value = res.data;
  total.value = res.total;
  loading.value = false;
};

const exportCsv = () => { window.open('/api/v1/reports/students', '_blank'); };
watch([search, gradeFilter, statusFilter], () => loadData());
</script>
