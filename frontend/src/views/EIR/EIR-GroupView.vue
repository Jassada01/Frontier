<template>
    <div class="flex flex-col min-h-screen">
      <Navbar />
      <Breadcrumbs :breadcrumbs="breadcrumbsData" />
      <div class="flex-grow flex justify-center p-4 bg-gray-50">
        <div class="w-full md:w-5/6">
          <div class="mb-4 flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-800"> Group EIR</h1>
            <button @click="$router.push('/EIRIndex')" class="btn btn-outline btn-sm">
              <i class="fas fa-arrow-left mr-2"></i>Back to List
            </button>
          </div>
          <EIRGroupView v-if="groupId" :groupId="groupId"></EIRGroupView>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import Navbar from '../../components/Navbar.vue'
  import { ref, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import Breadcrumbs from '../../components/Breadcrumbs.vue'
  import EIRGroupView from '../../components/EIR/EIRGroupView.vue'
  
  const route = useRoute()
  const groupId = computed(() => route.params.id ? Number(route.params.id) : null)
  
  const breadcrumbsData = [
    { name: "Home", icon: "fa-home", link: "/" },
    { name: "EIR List", icon: "fa-file", link: "/EIRIndex" },
    { name: "EIR Group", icon: "fa-receipt", link: "" }
  ]
  </script>