<template>
    <div class="agent-table p-4 overflow-x-auto">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">รายชื่อเอเย่นต์</h1>
            <router-link to="/agent">
                <button class="btn btn-primary">
                    <i class="fa fa-user-plus mr-2"></i> เพิ่มเอเย่นต์
                </button>
            </router-link>
        </div>
        <table id="agentTable" class="display table table-auto">
            <thead>
                <tr>
                    <th class="p-4  justify-center"></th>
                    <th class="p-4">รหัสเอเย่นต์</th>
                    <th class="p-4">ชื่อบริษัท</th>
                    <th class="p-4">ชื่อผู้ติดต่อ</th>
                    <th class="p-4">เบอร์โทรศัพท์</th>
                    <th class="p-4">อีเมล</th>
                    <th class="p-4"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="agent in agents" :key="agent.agent_id">
                    <td class="p-4 justify-center">
                        <div class="avatar">
                            <div class="w-12 mask mask-squircle justify-center">
                                <img :src="agent.image_path || 'https://via.placeholder.com/150'" />
                            </div>
                        </div>
                    </td>
                    <td class="p-4">{{ agent.agent_code }}</td>
                    <td class="p-4">{{ agent.company_name }}</td>
                    <td class="p-4">{{ agent.contact_name }}</td>
                    <td class="p-4">{{ agent.phone_number }}</td>
                    <td class="p-4">{{ agent.email }}</td>
                    <td class="p-4 text-center">
                        <router-link :to="`/agent/${agent.agent_id}`">
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
import 'datatables.net-dt'

import $ from 'jquery';
import 'datatables.net';
import CONFIG from '../../config/config';

const agents = ref([]);

onMounted(async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/agents/get`);
        agents.value = response.data;
        await nextTick();
        $('#agentTable').DataTable();
    } catch (error) {
        console.error('Error fetching agents:', error);
    }
    
});
</script>

<style scoped></style>
