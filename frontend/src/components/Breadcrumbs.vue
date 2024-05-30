<template>
    <div class="p-4">
        <div class="text-sm breadcrumbs">
            <ul>
                <li v-for="(crumb, index) in breadcrumbs" :key="index">
                    <router-link v-if="crumb.link" :to="crumb.link">
                        <i :class="`fas ${crumb.icon} w-4 h-4 mr-2`"></i>
                        {{ crumb.name }}
                    </router-link>
                    <span v-else class="inline-flex gap-2 items-center">
                        <i :class="`fas ${crumb.icon} w-4 h-4 mr-2`"></i>
                        {{ crumb.name }}
                    </span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>

const props = defineProps({
    breadcrumbs: {
        type: Array,
        required: true
    }
});
</script>

<style scoped>
</style>