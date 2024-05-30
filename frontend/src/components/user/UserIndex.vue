<template>
    <div class="user-table p-4 overflow-x-auto">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">รายชื่อผู้ใช้งานระบบ</h1>
            <router-link to="/user"> <button class="btn btn-primary">
                    <i class="fa fa-user-plus mr-2"></i> เพิ่มผู้ใช้
                </button></router-link>
        </div>
        <table class="table table-zebra">
            <thead >
                <tr>
                    <th class="p-4">Avatar</th>
                    <th class="p-4">Username</th>
                    <th class="p-4">Display Name</th>
                    <th class="p-4">Position</th>
                    <th class="p-4">Status</th>
                    <th class="p-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.id" >
                    <td class="p-4">
                        <div class="avatar">
                            <div class="w-10 rounded-full">
                                <img :src="user.location_image_url" alt="Avatar" />
                            </div>
                        </div>
                    </td>
                    <td class="p-4"><router-link :to="`/user/${user.id}`">{{ user.username }}</router-link></td>
                    <td class="p-4">{{ user.display_name }}</td>
                    <td class="p-4">{{ user.position }}</td>
                    <td class="p-4">
                        <span :class="{ 'text-green-500': user.active === 1, 'text-red-500': user.active === 0 }">
                            {{ user.active === 1 ? 'Active' : 'Inactive' }}
                        </span>
                    </td>
                    <td class="p-4">
                        <router-link :to="`/user/${user.id}`">
                            <button class="btn btn-circle">
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
import { ref, onMounted } from 'vue';
import axios from 'axios';
import CONFIG from '../../config/config';

const users = ref([]);

onMounted(async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/users/getAllUsers`);
        users.value = response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
    }
});
</script>

<style scoped>

</style>
