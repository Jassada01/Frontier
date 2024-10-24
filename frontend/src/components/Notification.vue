<template>
    <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <div class="indicator">
                <i class="fas fa-bell text-lg"></i>
                <span v-if="totalCount > 0" class="badge badge-sm indicator-item bg-red-500 text-white border-none">
                    {{ totalCount }}
                </span>
            </div>
        </div>
        <div tabindex="0" class="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-72 shadow">
            <div class="card-body p-2">
                <ul class="menu menu-sm">
                    <li v-if="pendingCounts.cnt_pending_return > 0">
                        <router-link to="/RequestReturnIndex" class="flex items-center justify-between py-2">
                            <div class="flex items-center gap-2">
                                <i class="fa-solid fa-download"></i>
                                <span>ขอคืนตู้</span>
                            </div>
                            <span class="badge badge-sm bg-red-500 text-white border-none">
                                {{ pendingCounts.cnt_pending_return }}
                            </span>
                        </router-link>
                    </li>
                    <li v-if="pendingCounts.cnt_pending_receive > 0">
                        <router-link to="/RequestReceiveIndex" class="flex items-center justify-between py-2">
                            <div class="flex items-center gap-2">
                                <i class="fa-solid fa-upload"></i>
                                <span>ขอรับตู้</span>
                            </div>
                            <span class="badge badge-sm bg-red-500 text-white border-none">
                                {{ pendingCounts.cnt_pending_receive }}
                            </span>
                        </router-link>
                    </li>
                    <li v-if="totalCount === 0">
                        <div class="text-center py-2 text-gray-500">ไม่มีรายการที่รอดำเนินการ</div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import CONFIG from '../config/config';
import axios from 'axios'

// State for pending counts
const pendingCounts = ref({
    cnt_pending_return: 0,
    cnt_pending_receive: 0
})

// Computed total count for the notification badge
const totalCount = computed(() => {
    return pendingCounts.value.cnt_pending_return + pendingCounts.value.cnt_pending_receive
})

// Function to fetch pending counts
const fetchPendingCounts = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/common/getPendingContainerCounts`)
        pendingCounts.value = {
            cnt_pending_return: response.data.cnt_pending_return,
            cnt_pending_receive: response.data.cnt_pending_receive
        }
    } catch (error) {
        console.error('Error fetching pending counts:', error)
    }
}

const startAutoRefresh = () => {
    setInterval(() => {
        fetchPendingCounts()
    }, 60000) // Refresh every minute
}


// Fetch data when component mounts
onMounted(() => {
    fetchPendingCounts()
    startAutoRefresh()
})
</script>
