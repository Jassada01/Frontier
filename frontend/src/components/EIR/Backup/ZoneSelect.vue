<template>
    <multiselect v-model="selectedZone" :options="zones" label="label" track-by="zone_id" @input="handleZoneSelection"
        class=" text-sm" placeholder="เลือกโซน">
    </multiselect>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchZones } from '../../api';

const selectedZone = ref(null);
const zones = ref([]);

const handleZoneSelection = (zone) => {
    // Logic สำหรับ handle zone selection
};

onMounted(async () => {
    try {
        zones.value = await fetchZones();
    } catch (error) {
        console.error('Error fetching zones data', error);
    }
});
</script>
