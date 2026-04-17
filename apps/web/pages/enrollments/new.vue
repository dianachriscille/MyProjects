<template>
  <div>
    <h1 class="text-h4 mb-4">New Enrollment</h1>
    <v-card>
      <v-stepper v-model="step" :items="['Student Info','Guardian Info','Academic','DPA Consent']">
        <template #item.1>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4"><v-text-field v-model="form.firstName" label="First Name *" :rules="[v => !!v || 'Required']" data-testid="enroll-firstname" /></v-col>
              <v-col cols="12" md="4"><v-text-field v-model="form.middleName" label="Middle Name" data-testid="enroll-middlename" /></v-col>
              <v-col cols="12" md="4"><v-text-field v-model="form.lastName" label="Last Name *" :rules="[v => !!v || 'Required']" data-testid="enroll-lastname" /></v-col>
              <v-col cols="12" md="4"><v-text-field v-model="form.dateOfBirth" label="Date of Birth *" type="date" data-testid="enroll-dob" /></v-col>
              <v-col cols="12" md="4"><v-select v-model="form.gender" :items="['male','female']" label="Gender *" data-testid="enroll-gender" /></v-col>
              <v-col cols="12" md="4"><v-text-field v-model="form.lrn" label="LRN (optional)" hint="12-digit number" data-testid="enroll-lrn" /></v-col>
            </v-row>
          </v-card-text>
        </template>
        <template #item.2>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6"><v-text-field v-model="form.guardianName" label="Guardian Name *" data-testid="enroll-guardian-name" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="form.guardianContact" label="Guardian Phone *" hint="09XXXXXXXXX" data-testid="enroll-guardian-phone" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="form.guardianEmail" label="Guardian Email" data-testid="enroll-guardian-email" /></v-col>
            </v-row>
          </v-card-text>
        </template>
        <template #item.3>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6"><v-select v-model="form.gradeLevel" :items="gradeLevels" label="Grade Level *" data-testid="enroll-grade" /></v-col>
              <v-col cols="12" md="6"><v-select v-model="form.schoolYearId" :items="schoolYears" item-title="name" item-value="id" label="School Year *" data-testid="enroll-sy" /></v-col>
            </v-row>
          </v-card-text>
        </template>
        <template #item.4>
          <v-card-text>
            <v-alert type="info" class="mb-4">I consent to the collection and processing of the above personal information in accordance with Republic Act No. 10173 (Data Privacy Act of 2012). This data will be used solely for enrollment and academic record-keeping purposes.</v-alert>
            <v-checkbox v-model="form.dpaConsent" label="I agree to the Data Privacy Act consent above *" :rules="[v => !!v || 'Consent is required']" data-testid="enroll-dpa-consent" />
            <v-btn color="primary" :loading="loading" :disabled="!form.dpaConsent" @click="submit" data-testid="enroll-submit">Submit Enrollment</v-btn>
          </v-card-text>
        </template>
      </v-stepper>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { apiFetch } = useApi();
const gradeLevels = ['K','G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12'];
const step = ref(1);
const loading = ref(false);
const schoolYears = ref<any[]>([]);
const form = ref({ firstName: '', middleName: '', lastName: '', dateOfBirth: '', gender: '', lrn: '', guardianName: '', guardianContact: '', guardianEmail: '', gradeLevel: '', schoolYearId: '', dpaConsent: false });

onMounted(async () => { /* TODO: fetch school years from API */ });

const submit = async () => {
  loading.value = true;
  try {
    const enrollment = await apiFetch<any>('/api/v1/enrollments', {
      method: 'POST',
      body: { schoolYearId: form.value.schoolYearId, gradeLevel: form.value.gradeLevel, dpaConsentGiven: form.value.dpaConsent, applicantData: { ...form.value } },
    });
    await apiFetch(`/api/v1/enrollments/${enrollment.id}/submit`, { method: 'PATCH' });
    navigateTo('/enrollments');
  } catch (e: any) { alert(e.data?.message || 'Error submitting enrollment'); }
  loading.value = false;
};
</script>
