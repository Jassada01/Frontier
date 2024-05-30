<template>
    <div class="truck-company-table p-4 overflow-x-auto">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">รายชื่อบริษัทรถบรรทุก</h1>
            <router-link to="/TruckCompany">
                <button class="btn btn-primary">
                    <i class="fa fa-plus-square mr-2"></i> เพิ่มบริษัทรถบรรทุก
                </button>
            </router-link>
        </div>
        <table class="table table-auto table-zebra">
            <thead>
                <tr>
                    <th class="p-4">ชื่อบริษัท</th>
                    <th class="p-4">ชื่อย่อ</th>
                    <th class="p-4">ที่อยู่</th>
                    <th class="p-4">ผู้ติดต่อ</th>
                    <th class="p-4">เบอร์โทร</th>
                    <th class="p-4">สถานะ</th>
                    <th class="p-4"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="company in truckCompanies" :key="company.id">
                    <td class="p-4">{{ company.company_name }}</td>
                    <td class="p-4">{{ company.short_name }}</td>
                    <td class="p-4">{{ company.address }}</td>
                    <td class="p-4">{{ company.contact_person }}</td>
                    <td class="p-4">{{ company.phone_number }}</td>
                    <td class="p-4">{{ company.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</td>
                    <td class="p-4 text-center">
                        <router-link :to="`/TruckCompany/${company.id}`">
                            <button class="btn btn-sm btn-circle">
                                <i class="fa fa-pencil"></i>
                            </button>
                        </router-link>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import CONFIG from '../../config/config';

const truckCompanies = ref([]);

onMounted(async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/truck_companies/get`);
        truckCompanies.value = response.data;
    } catch (error) {
        console.error('Error fetching truck companies:', error);
    }
});
</script>

<style scoped></style>
