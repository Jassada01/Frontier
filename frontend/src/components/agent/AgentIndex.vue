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
                    <th class="p-4">Agent Code</th>
                    <th class="p-4">Company Name</th>
                    <th class="p-4">Contact Name</th>
                    <th class="p-4">Phone</th>
                    <th class="p-4">Email</th>
                    <th class="p-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="agent in agents" :key="agent.agent_id">
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