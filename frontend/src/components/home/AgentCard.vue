<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
      <div
        v-for="agent in agents"
        :key="agent.agent_id"
        class="card card-side bg-base-100 shadow-xl"
      >
        <figure class="w-1/3">
          <img
            :src="agent.image_path || 'https://via.placeholder.com/150'"
            alt="Agent Image"
            class="w-full h-full object-contain"
          />
        </figure>
        <div class="card-body w-2/3">
          <h2 class="card-title text-xl font-bold">{{ agent.agent_code }}</h2>
          <ul class="list-disc list-inside">
            <div v-for="size in agent.size_types" :key="size.size_type">
              <a v-if="size.size_type" class="text-xl font-semibold">
                <span class="font-bold">Size:</span> {{ size.size_type || 'N/A' }} -
                <span class="font-bold ">จำนวน:</span> <span class="text-black antialiased">{{ size.CNT }}</span>
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

const agents = ref([])

onMounted(async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/common/agentEirCount`)
    agents.value = response.data
  } catch (error) {
    console.error('Error fetching agent EIR count:', error)
  }
})
</script>

<style scoped>
.card {
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}

figure img {
  max-height: 200px;
}
</style>
