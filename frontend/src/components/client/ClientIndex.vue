<template>
  <div class="client-table p-4 overflow-x-auto">
    <div class="flex justify-between items-center mb-4">
      <div class="flex space-x-4 items-center">
        <h1 class="text-2xl font-bold">รายชื่อลูกค้า</h1>
        <div class="flex items-center space-x-2">
          <label for="statusFilter" class="font-medium">สถานะ:</label>
          <select id="statusFilter" v-model="statusFilter" @change="applyFilter" class="select select-bordered">
            <option value="">ทั้งหมด</option>
            <option value="ใช้งาน">ใช้งาน</option>
            <option value="ไม่ใช้งาน">ไม่ใช้งาน</option>
          </select>
        </div>
      </div>
      <router-link to="/client">
        <button class="btn btn-primary">
          <i class="fa fa-user-plus mr-2"></i> เพิ่มลูกค้า
        </button>
      </router-link>
    </div>
    <table id="clientTable" class="display table table-zebra">
      <thead>
        <tr>
          <th class="p-4">รหัสลูกค้า</th>
          <th class="p-4">ชื่อ</th>
          <th class="p-4">สาขา</th>
          <th class="p-4">ผู้ติดต่อ</th>
          <th class="p-4">โทรศัพท์</th>
          <th class="p-4">หมายเหตุ</th>
          <th class="p-4">สถานะ</th>
          <th class="p-4"></th>
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
            <div
              :class="client.is_active === 1 ? 'badge badge-primary badge-outline whitespace-nowrap' : 'badge badge-error badge-outline whitespace-nowrap'">
              {{ client.is_active === 1 ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
            </div>
          </td>
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
import 'datatables.net-dt';
import $ from 'jquery';
import 'datatables.net';
import CONFIG from '../../config/config';

const clients = ref([]);
const statusFilter = ref('ใช้งาน'); // ตั้งค่าเริ่มต้นให้เป็น "ใช้งาน"
let dataTable = null;

onMounted(async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/client/get`);
    clients.value = response.data;
    await nextTick();
    dataTable = $('#clientTable').DataTable({
      pageLength: 50,
    });
    applyFilter(); // เรียก filter ทันที เพื่อให้ default เป็น "ใช้งาน"
  } catch (error) {
    console.error('Error fetching clients:', error);
  }
});

function applyFilter() {
  if (dataTable) {
    dataTable.column(6).search(statusFilter.value).draw();
  }
}
</script>

<style scoped></style>
