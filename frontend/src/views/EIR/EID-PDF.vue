<script setup>
import Navbar from '../../components/Navbar.vue';
import ExportToPdf from '../../components/EIR/ExportToPdf.vue'
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumbs from '../../components/Breadcrumbs.vue';

const breadcrumbsData = [
    { name: "Home", icon: "fa-home", link: "/" },
    { name: "Equipment Interchange Receipt List", icon: "fa-file", link: "/" },
    { name: "Equipment Interchange Receipt", icon: "fa-receipt", link: "" },
];

const route = useRoute();
const isEditMode = ref(route.params.id !== undefined);
const receiptId = computed(() => route.params.id ? Number(route.params.id) : null);
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Navbar />
        <Breadcrumbs :breadcrumbs="breadcrumbsData" />
        <div class="flex-grow flex justify-center p-4">
            <div class="w-full md:w-5/6">
                <ExportToPdf  />
            </div>
        </div>
    </div>
</template>
