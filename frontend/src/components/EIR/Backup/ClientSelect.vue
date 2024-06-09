<template>
    <multiselect v-model="selectedClient" :options="clients" label="label" track-by="client_id"
        class="text-sm" placeholder="เลือกลูกค้า" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchClients } from '../../api';

const selectedClient = ref(null);
const clients = ref([]);

onMounted(async () => {
    try {
        clients.value = await fetchClients();
    } catch (error) {
        console.error('Error fetching clients data', error);
    }
});
</script>
