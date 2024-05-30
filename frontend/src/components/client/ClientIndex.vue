<template>
  <div class="client-table p-4 overflow-x-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">รายชื่อลูกค้า</h1>
      <router-link to="/client">
        <button class="btn btn-primary">
          <i class="fa fa-user-plus mr-2"></i> เพิ่มลูกค้า
        </button>
      </router-link>
    </div>
    <table id="clientTable" class="display table table-zebra">
      <thead>
        <tr>
          <th class="p-4">Client Code</th>
          <th class="p-4">Name</th>
          <th class="p-4">Branch</th>
          <th class="p-4">Contact Person</th>
          <th class="p-4">Phone</th>
          <th class="p-4">Remark</th>
          <th class="p-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="client in clients" :key="client.client_id">
          <td class="p-4">{{ client.client_code }}</td>
          <td class="p-4">{{ client.name }}</td>
          <td class="p-4">{{ client.branch }}</td>
          <td class="p-4">{{ client.contact_person }}</td>
          <td class="p-4">{{ client.phone }}</td>
          <td class="p-4">{{ client.remark }}</td>
          <td class="p-4">
            <router-link :to="`/client/${client.client_id}`">
              <button class="btn btn-sm btn-circle">
                <i class="fa fa-pencil-alt"></i>
              </button>
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
// import '@/assets/datatables.css'; // import CSS ที่คุณสร้าง
// import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net-dt'

import $ from 'jquery';
import 'datatables.net';
import CONFIG from '../../config/config';
const clients = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/client/get`);
    clients.value = response.data;
    await nextTick();
    $('#clientTable').DataTable();
  } catch (error) {
    console.error('Error fetching clients:', error);
  }
});
</script>
<style scoped></style>
