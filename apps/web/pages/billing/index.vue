<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Billing</h1>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" to="/billing/new" class="mr-2" data-testid="billing-new">New Billing</v-btn>
      <v-btn color="secondary" prepend-icon="mdi-account-group" to="/billing/bulk" data-testid="billing-bulk">Bulk Billing</v-btn>
    </div>
    <v-card>
      <v-card-text>
        <v-row class="mb-2">
          <v-col cols="12" md="4"><v-select v-model="statusFilter" :items="['unpaid','partially_paid','fully_paid']" label="Status" clearable density="compact" data-testid="billing-status-filter" /></v-col>
        </v-row>
        <v-data-table-server v-model:items-per-page="limit" :headers="headers" :items="billings" :items-length="total" :loading="loading" @update:options="loadData" data-testid="billing-table">
          <template #item.totalAmount="{ item }">₱{{ Number(item.totalAmount).toLocaleString() }}</template>
          <template #item.balance="{ item }">₱{{ Number(item.balance).toLocaleString() }}</template>
          <template #item.status="{ item }">
            <v-chip :color="item.status === 'fully_paid' ? 'green' : item.status === 'partially_paid' ? 'orange' : 'red'" size="small">{{ item.status.replace('_',' ') }}</v-chip>
          </template>
          <template #item.actions="{ item }">
            <v-btn icon size="small" :to="`/billing/${item.id}`" data-testid="billing-view"><v-icon>mdi-eye</v-icon></v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { apiFetch } = useApi();
const headers = [
  { title: 'Student', key: 'studentName' }, { title: 'Total', key: 'totalAmount' },
  { title: 'Balance', key: 'balance' }, { title: 'Status', key: 'status' }, { title: '', key: 'actions', sortable: false },
];
const billings = ref<any[]>([]);
const total = ref(0);
const loading = ref(false);
const statusFilter = ref('');
const limit = ref(20);

const loadData = async ({ page, itemsPerPage }: any = { page: 1, itemsPerPage: 20 }) => {
  loading.value = true;
  const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage) });
  if (statusFilter.value) params.set('status', statusFilter.value);
  const res = await apiFetch<any>(`/api/v1/billing?${params}`);
  billings.value = res.data.map((b: any) => ({ ...b, studentName: `${b.student?.lastName}, ${b.student?.firstName}` }));
  total.value = res.total;
  loading.value = false;
};

watch(statusFilter, () => loadData());
</script>
