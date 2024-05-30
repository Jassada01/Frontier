<script setup>
import Navbar from '../../components/Navbar.vue';
import TruckCompanyIndex from '../../components/truckCompany/TruckCompanyIndex.vue';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumbs from '../../components/Breadcrumbs.vue';

const breadcrumbsData = [
    { name: "Home", icon: "fa-home", link: "/" },
    { name: "รายการบริษัทรถบรรทุก", icon: "fa-truck", link: "" },
];

const route = useRoute();
const isEditMode = ref(route.params.id !== undefined);
const companyId = computed(() => route.params.id ? Number(route.params.id) : null);
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Navbar />
        <Breadcrumbs :breadcrumbs="breadcrumbsData" />

        <div class="flex-grow flex justify-center p-4">
            <div class="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                <TruckCompanyIndex />
            </div>
        </div>
    </div>
</template>
