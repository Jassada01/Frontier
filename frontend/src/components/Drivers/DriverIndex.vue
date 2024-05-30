<template>
    <div class="driver-table p-4 overflow-x-auto">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">รายชื่อคนขับ</h1>
            <router-link to="/driver">
                <button class="btn btn-primary">
                    <i class="fa fa-user-plus mr-2"></i> เพิ่มคนขับ
                </button>
            </router-link>
        </div>
        <table id="driverTable" class="display table table-auto">
            <thead>
                <tr>
                    <th class="p-4">Company Name</th>
                    <th class="p-4">Driver Image</th>
                    <th class="p-4">Driver Name</th>
                    <th class="p-4">License Plate & Province</th>
                    <th class="p-4">Active Status</th>
                    <th class="p-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="driver in drivers" :key="driver.id">
                    <td class="p-4">{{ driver.truck_company_name }}</td>
                    <td class="p-4 "><img :src="driver.driver_image_path" alt="Driver Image"
                            class="w-12 h-12 object-cover text-center rounded-full"></td>
                    <td class="p-4">{{ driver.driver_name }}</td>
                    <td class="p-4">{{ driver.license_plate }} - {{ driver.province }}</td>
                    <td class="p-4 text-center">
                        <span :class="driver.is_active ? 'text-green-500' : 'text-red-500'">
                            {{ driver.is_active ? 'Active' : 'Inactive' }}
                        </span>
                    </td>
                    <td class="p-4 text-center">
                        <router-link :to="`/driver/${driver.id}`">
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
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net-dt';

import $ from 'jquery';
import 'datatables.net';
import CONFIG from '../../config/config';

const drivers = ref([]);

onMounted(async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/drivers/get`);
        drivers.value = response.data;
        await nextTick();
        $('#driverTable').DataTable();
    } catch (error) {
        console.error('Error fetching drivers:', error);
    }
});
</script>

<style scoped></style>
