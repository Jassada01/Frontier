<script setup>
//clientFreeDropPeriod-Index.vue
import Navbar from '../../components/Navbar.vue';
import ClientDropIndex from '../../components/clientDrop/ClientDropIndex.vue';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumbs from '../../components/Breadcrumbs.vue';

const breadcrumbsData = [
    { name: "Home", icon: "fa-home", link: "/" },
    { name: "Client Free Drop Periods", icon: "fa-clock", link: "" }, // เปลี่ยนชื่อและไอคอนให้เหมาะสม
];

const route = useRoute();
const isEditMode = ref(route.params.id !== undefined);
const clientId = computed(() => route.params.id ? Number(route.params.id) : null);
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Navbar />
        <Breadcrumbs :breadcrumbs="breadcrumbsData" />

        <div class="flex-grow flex justify-center p-4">
            <div class="w-4/6">
                <ClientDropIndex />
            </div>
        </div>
    </div>
</template>
