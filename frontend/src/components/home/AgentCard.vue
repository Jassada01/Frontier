<template>
    <div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
            <div v-for="agent in agents" :key="agent.agent_id" class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title text-xl font-bold">{{ agent.agent_code }}</h2>
                    <ul class="list-disc list-inside">
                        <div v-for="size in agent.size_types" :key="size.size_type">
                            <a v-if="size.size_type">
                                <span class="font-medium">Size:</span> {{ size.size_type || 'N/A' }} -
                                <span class="font-medium">จำนวน:</span> {{ size.CNT }}
                            </a>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import CONFIG from '../../config/config'

const agents = ref([]);

onMounted(async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/common/agentEirCount`);
        agents.value = response.data;
    } catch (error) {
        console.error('Error fetching agent EIR count:', error);
    }
});
</script>

<style scoped>
.card {
    transition: transform 0.3s;
}

.card:hover {
    transform: translateY(-5px);
}
</style>