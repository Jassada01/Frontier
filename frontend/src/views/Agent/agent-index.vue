<script setup>
import Navbar from '../../components/Navbar.vue';
import AgentIndex from '../../components/agent/AgentIndex.vue';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumbs from '../../components/Breadcrumbs.vue';

const breadcrumbsData = [
    { name: "Home", icon: "fa-home", link: "/" },
    { name: "Agent List", icon: "fa-ferry", link: "" },
];

const route = useRoute();
const isEditMode = ref(route.params.id !== undefined);
const agentId = computed(() => route.params.id ? Number(route.params.id) : null);
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <Navbar />
        <Breadcrumbs :breadcrumbs="breadcrumbsData" />

        <div class="flex-grow flex justify-center p-4">
            <div class="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                <AgentIndex />
            </div>
        </div>
    </div>
</template>

