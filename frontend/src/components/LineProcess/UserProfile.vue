<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import CONFIG from '../../config/config';
import ContainerReturnForm from './ContainerReturnForm.vue';
import ContainerReturnsTable from './ContainerReturnsTable.vue';
import ContainerReceiveForm from './ContainerReceiveForm.vue';
import ContainerReceivesTable from './ContainerReceivesTable.vue';

const route = useRoute();
const userData = ref(null);
const loading = ref(true);
const error = ref(null);
const showReturnForm = ref(false);
const showReceiveForm = ref(false);

const activeTab = ref('requestReturn');

const userType = computed(() => {
  return userData.value?.user_type === 'Client' ? 'ลูกค้า' : 'คนขับรถ';
});

const loadUserData = async () => {
  const userId = route.query.userId;
  if (typeof userId === 'string' && userId.trim() !== '') {
    try {
      const response = await axios.get(`${CONFIG.API_SERVER}/api/line_user_profiles/get`, {
        params: { line_user_id: userId }
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        userData.value = response.data[0];
      } else {
        error.value = 'ไม่พบข้อมูลผู้ใช้';
      }
    } catch (err) {
      console.error('Failed to load user data', err);
      error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้';
    } finally {
      loading.value = false;
    }
  } else {
    error.value = 'ไม่พบ User ID หรือ User ID ไม่ถูกต้อง';
    loading.value = false;
  }
};

const handleReturnContainer = () => {
  showReturnForm.value = true;
  showReceiveForm.value = false;
};

const handleReceiveContainer = () => {
  showReceiveForm.value = true;
  showReturnForm.value = false;
};

const handleReturnFormSubmit = (formData) => {
  console.log('Return form submitted:', formData);
  showReturnForm.value = false;
  activeTab.value = 'requestReturn';
};

const handleReceiveFormSubmit = (formData) => {
  console.log('Receive form submitted:', formData);
  showReceiveForm.value = false;
  activeTab.value = 'history';
};

const handleReturnFormCancel = () => {
  showReturnForm.value = false;
};

const handleReceiveFormCancel = () => {
  showReceiveForm.value = false;
};

onMounted(() => {
  loadUserData().catch(err => {
    console.error('Error in loadUserData:', err);
    error.value = 'เกิดข้อผิดพลาดที่ไม่คาดคิด';
    loading.value = false;
  });
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- Navbar -->
    <div class="navbar bg-base-100 shadow-lg">
      <div class="flex-1">
        <a class="btn btn-ghost normal-case text-xl">Giraffe Container</a>
      </div>
      <div class="flex-none">
        <button class="btn btn-square btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            class="inline-block w-5 h-5 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z">
            </path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow container mx-auto px-4 py-8">
      <div class="card bg-base-100 shadow-xl max-w-4xl mx-auto">
        <div class="card-body">
          <div v-if="loading" class="text-center">
            <span class="loading loading-spinner loading-lg"></span>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
          <div v-else-if="error" class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ error }}</span>
          </div>
          <template v-else-if="userData">
            <div v-if="!showReturnForm && !showReceiveForm" class="lg:flex lg:items-start lg:space-x-8">
              <div class="flex flex-col items-center lg:w-1/3">
                <div class="avatar">
                  <div class="w-24 lg:w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img :src="userData.picture_url" :alt="`รูปโปรไฟล์ของ ${userData.display_name}`" />
                  </div>
                </div>
                <h2 class="card-title mt-4">{{ userData.display_name }}</h2>
                <div class="badge badge-success mt-2">{{ userType }}</div>
              </div>
              <div class="lg:w-2/3 mt-6 lg:mt-0">
                <div class="space-y-2">
                  <p><strong>ชื่อ:</strong> {{ userData.name }}</p>
                  <p><strong>บริษัท:</strong> {{ userData.company_name }}</p>
                  <p><strong>วันที่ลงทะเบียน:</strong> {{ new Date(userData.created_at).toLocaleDateString('th-TH') }}
                  </p>
                </div>
                <div class="divider"></div>
                <div class="flex flex-row justify-between mt-4 gap-x-4">
                  <button @click="handleReturnContainer" class="btn btn-info flex-1">ขอคืนตู้</button>
                  <button @click="handleReceiveContainer" class="btn btn-secondary flex-1">ขอรับตู้</button>
                </div>
              </div>
            </div>

            <ContainerReturnForm v-if="showReturnForm" :line-user-id="userData.line_user_id"
              @submit="handleReturnFormSubmit" @cancel="handleReturnFormCancel" />

            <ContainerReceiveForm v-if="showReceiveForm" :line-user-id="userData.line_user_id"
              @submit="handleReceiveFormSubmit" @cancel="handleReceiveFormCancel" />

            <div v-if="!showReturnForm && !showReceiveForm" role="tablist" class="tabs tabs-boxed mt-10">
              <a role="tab" class="tab" :class="{ 'tab-active': activeTab === 'requestReturn' }"
                @click="activeTab = 'requestReturn'">
                ประวัติการคืนตู้
              </a>
              <a role="tab" class="tab" :class="{ 'tab-active': activeTab === 'history' }"
                @click="activeTab = 'history'">
                ประวัติการขอรับตู้
              </a>
            </div>

            <div v-if="!showReturnForm && !showReceiveForm && activeTab === 'requestReturn'">
              <ContainerReturnsTable :line-user-id="userData.line_user_id" />
            </div>
            <div v-if="!showReturnForm && !showReceiveForm && activeTab === 'history'">
              <ContainerReceivesTable :line-user-id="userData.line_user_id" />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer footer-center p-4 bg-base-300 text-base-content">
      <div>
        <p>Copyright © {{ new Date().getFullYear() }} - All rights reserved by JSolutionsNext</p>
      </div>
    </footer>
  </div>
</template>