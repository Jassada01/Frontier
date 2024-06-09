<template>
    <multiselect v-model="selectedAgent" :options="agents" label="label" track-by="agent_id" class="text-sm"
        placeholder="เลือกตัวแทน" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchAgents } from '../../api';

const selectedAgent = ref(null);
const agents = ref([]);

onMounted(async () => {
    try {
        agents.value = await fetchAgents();
    } catch (error) {
        console.error('Error fetching agents data', error);
    }
});
</script>
