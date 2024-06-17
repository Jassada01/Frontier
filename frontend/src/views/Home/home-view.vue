<script setup>
import Navbar from '../../components/Navbar.vue'
import AgentCard from '../../components/home/AgentCard.vue'
</script>

<template>
  <div>
    <Navbar />

    <div class="p-10">
      <h1 class="text-3xl font-bold mb-6">Welcome Home!</h1>
      <AgentCard />
    </div>
  </div>
</template>

<style scoped>
/* คุณสามารถเพิ่ม CSS ที่นี่หากต้องการปรับแต่งเพิ่มเติม */
</style>
