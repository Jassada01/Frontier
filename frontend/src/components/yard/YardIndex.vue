<template>
    <div class="yard-table p-4 overflow-x-auto">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">รายชื่อลาน</h1>
            <router-link to="/yard">
                <button class="btn btn-primary">
                    <i class="fa fa-plus-square mr-2"></i> เพิ่มลาน
                </button>
            </router-link>
        </div>
        <table class="table table-auto table-zebra">
            <thead>
                <tr>
                    <th class="p-4">ชื่อย่อ</th>
                    <th class="p-4">ชื่อลาน</th>
                    <th class="p-4">ผู้ดูแล/ติดต่อ</th>
                    <th class="p-4">เบอร์โทร</th>
                    <th class="p-4">Website</th>
                    <th class="p-4">สถานะ</th>
                    <th class="p-4"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="yard in yards" :key="yard.id">
                    <td class="p-4">{{ yard.short_name }}</td>
                    <td class="p-4">{{ yard.yard_name }}</td>
                    <td class="p-4">{{ yard.contact_person }}</td>
                    <td class="p-4">{{ yard.phone_number }}</td>
                    <td class="p-4">{{ yard.website }}</td>
                    <td class="p-4">
                        <span :class="yard.active ? 'text-green-500' : 'text-red-500'">
                            {{ yard.active ? 'Active' : 'Inactive' }}
                        </span>
                    </td>
                    <td class="p-4 text-center">
                        <router-link :to="`/yard/${yard.id}`">
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

const yards = ref([]);

onMounted(async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/yards/get`);
        yards.value = response.data;
    } catch (error) {
        console.error('Error fetching yards:', error);
    }
});
</script>

<style scoped></style>
