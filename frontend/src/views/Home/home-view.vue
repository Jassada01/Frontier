<template>
  <div>
    <Navbar />

    <div class="p-10" id="dashboard-content">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <div class="flex items-center">
          <div class="text-2xl font-bold antialiased mr-4">{{ currentTime }}</div>
        </div>
      </div>
      <div class="divider"></div>
      <AgentCard />

      <DetentionLogsTable class="mt-10" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '../../components/Navbar.vue'
import AgentCard from '../../components/home/AgentCard.vue'
import DetentionLogsTable from '../../components/home/DetentionLogsTable.vue' // Import the new component
import moment from 'moment'

// สร้างตัวแปรเพื่อเก็บเวลา
const currentTime = ref(moment().format('DD/MM/YYYY HH:mm:ss'));

// ฟังก์ชันในการอัปเดตเวลา
const updateTime = () => {
  currentTime.value = moment().format('DD/MM/YYYY HH:mm:ss');
}

// ตั้งค่าการอัปเดตเวลาเมื่อคอมโพเนนต์ถูกเมานท์
onMounted(() => {
  setInterval(updateTime, 1000);// อัปเดตทุก 1 วินาที
});
</script>

<style scoped>
/* คุณสามารถเพิ่ม CSS ที่นี่หากต้องการปรับแต่งเพิ่มเติม */
</style>
