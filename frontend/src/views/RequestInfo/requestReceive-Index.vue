<script setup>
import Navbar from '../../components/Navbar.vue';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumbs from '../../components/Breadcrumbs.vue';
import RequestReceiveIndex from '../../components/requestInfo/RequestReceiveIndex.vue';

const breadcrumbsData = [
    { name: "Home", icon: "fa-home", link: "/" },
    { name: "รายการขอรับตู้", icon: "fa-solid fa-download", link: "" },
];

const route = useRoute();
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Navbar />
        <Breadcrumbs :breadcrumbs="breadcrumbsData" />

        <div class="flex-grow flex justify-center p-4">
            <div class="w-full">
                <RequestReceiveIndex />
            </div>
        </div>
    </div>
</template>
