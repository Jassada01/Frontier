<script setup>
import Navbar from '../../components/Navbar.vue';
import YardIndex from '../../components/yard/YardIndex.vue'; // ตรวจสอบให้แน่ใจว่าทางเข้าถูกต้อง
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumbs from '../../components/Breadcrumbs.vue';

const breadcrumbsData = [
    { name: "Home", icon: "fa-home", link: "/" },
    { name: "Yard List", icon: "fa-warehouse", link: "" }, // แก้ไข icon และข้อความให้เหมาะสม
];

const route = useRoute();
const isEditMode = ref(route.params.id !== undefined);
const yardId = computed(() => route.params.id ? Number(route.params.id) : null);
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Navbar />
        <Breadcrumbs :breadcrumbs="breadcrumbsData" />

        <div class="flex-grow flex justify-center p-4">
            <div class="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                <YardIndex />
            </div>
        </div>
    </div>
</template>
