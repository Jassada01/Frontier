<template>
    <multiselect v-model="selectedYard" :options="yards" label="label" track-by="yard_id" @input="handleYardSelection"
        class="text-sm" placeholder="เลือกลานเดิม">
    </multiselect>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchYards } from '../../api';

const selectedYard = ref(null);
const yards = ref([]);

const handleYardSelection = (yard) => {
    // Logic สำหรับ handle yard selection
};

onMounted(async () => {
    try {
        yards.value = await fetchYards();
    } catch (error) {
        console.error('Error fetching yards data', error);
    }
});
</script>
