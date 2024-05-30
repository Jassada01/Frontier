<template>
    <div class="zone-table p-4 overflow-x-auto">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">รายชื่อโซน</h1>
            <router-link to="/zone">
                <button class="btn btn-primary">
                    <i class="fa fa-plus-square mr-2"></i> เพิ่มโซน
                </button>
            </router-link>
        </div>
        <table class="table table-auto  table-zebra">
            <thead>
                <tr>
                    <th class="p-4">ลาน</th>
                    <th class="p-4">Zone</th>
                    <th class="p-4">รายละเอียด</th>
                    <th class="p-4">ผู้ดูแล/ติดต่อ</th>
                    <th class="p-4"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="zone in zones" :key="zone.id">
                    <td class="p-4">{{ zone.yard_name }}</td>
                    <td class="p-4">{{ zone.zone }}</td>
                    <td class="p-4">{{ zone.details }}</td>
                    <td class="p-4">{{ zone.contact }}</td>
                    <td class="p-4 text-center">
                        <router-link :to="`/zone/${zone.id}`">
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

const zones = ref([]);

onMounted(async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/zones/get`);
        zones.value = response.data;
    } catch (error) {
        console.error('Error fetching zones:', error);
    }
});
</script>

<style scoped></style>
