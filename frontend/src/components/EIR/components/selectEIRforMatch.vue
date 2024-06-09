<template>
  <div>
    <multiselect v-model="selectedEIR" :options="options" :searchable="true" :close-on-select="true"
      :clear-on-select="true" :preserve-search="true" placeholder="Select EIR" label="displayLabel" track-by="id"
      :custom-label="customLabel">
      <template #option="props">
        <div>
          <span>{{ props.option.receipt_no }} - {{ props.option.container }}</span>
        </div>
      </template>
    </multiselect>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Multiselect from 'vue-multiselect';
import CONFIG from '../../../config/config';

const props = defineProps({
  entry_type: {
    type: String,
    required: true
  },
  drop_container: {
    type: Boolean,
    required: true
  }
});

const options = ref([]);
const selectedEIR = ref(null);

const fetchFilteredEIRs = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/EIR/getFiltered`, {
      params: {
        entry_type: props.entry_type,
        drop_container: props.drop_container
      }
    });
    options.value = response.data;
  } catch (error) {
    console.error('Error fetching filtered EIRs:', error);
  }
};

const customLabel = (option) => {
  return `${option.receipt_no} : ${option.container}`;
};

const formatDate = (date) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(date).toLocaleDateString(undefined, options);
};

onMounted(() => {
  fetchFilteredEIRs();
});
</script>

<style scoped>
/* Add your styles here */
</style>
