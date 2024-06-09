<template>
    <multiselect v-model="selectedDriver" :options="drivers" label="label" track-by="id" @input="handleDriverSelection"
        class="text-sm" placeholder="เลือกคนขับ">
        <template #option="{ option }">
            <span><img :src="option.driver_image_path" class="inline-block w-6 h-6 rounded-full mr-2" /> {{ option.label
                }}</span>
        </template>
        <template #singleLabel="{ option }">
            <span><img :src="option.driver_image_path" class="inline-block w-6 h-6 rounded-full mr-2" /> {{ option.label
                }}</span>
        </template>
    </multiselect>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchDrivers } from '../../api';

const selectedDriver = ref(null);
const drivers = ref([]);

const handleDriverSelection = (driver) => {
    // Logic สำหรับ handle driver selection
};

onMounted(async () => {
    try {
        drivers.value = await fetchDrivers();
    } catch (error) {
        console.error('Error fetching drivers data', error);
    }
});
</script>
