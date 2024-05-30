<script setup>
import Navbar from '../../components/Navbar.vue';
import ZoneForm from '../../components/zone/ZoneForm.vue';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumbs from '../../components/Breadcrumbs.vue';

const breadcrumbsData = [
    { name: "Home", icon: "fa-home", link: "/" },
    { name: "Zone List", icon: "fa-map-marked-alt", link: "/ZoneIndex" },
    { name: "Zone", icon: "fa-map-signs", link: "" },
];

const route = useRoute();
const isEditMode = ref(route.params.id !== undefined);
const zoneId = computed(() => route.params.id ? Number(route.params.id) : null);
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Navbar />
        <Breadcrumbs :breadcrumbs="breadcrumbsData" />
        <div class="flex-grow flex justify-center p-4">
            <div class="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                <ZoneForm :isEditMode="isEditMode" :zoneId="zoneId" />
            </div>
        </div>
    </div>
</template>
