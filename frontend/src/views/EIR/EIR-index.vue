<script setup>
import Navbar from '../../components/Navbar.vue';
import EIRIndex from '../../components/EIR/EIRIndex.vue';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumbs from '../../components/Breadcrumbs.vue';

const breadcrumbsData = [
    { name: "Home", icon: "fa-home", link: "/" },
    { name: "EIR List", icon: "fa-file", link: "" },
];

const route = useRoute();
const isEditMode = ref(route.params.id !== undefined);
const eirId = computed(() => route.params.id ? Number(route.params.id) : null);
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Navbar />
        <Breadcrumbs :breadcrumbs="breadcrumbsData" />

        <div class="flex-grow flex justify-center p-4">
            <div class="w-full md:w-5/6">
                <EIRIndex />
            </div>
        </div>
    </div>
</template>

<style scoped></style>
