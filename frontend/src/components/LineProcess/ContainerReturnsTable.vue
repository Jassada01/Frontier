<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import CONFIG from '../../config/config';
import Swal from 'sweetalert2';

const props = defineProps({
    lineUserId: {
        type: String,
        required: true
    }
});

const containerReturns = ref([]);
const loading = ref(true);
const error = ref(null);
const searchTerm = ref('');
const selectedStatus = ref('');

// เพิ่ม ref สำหรับ Modal
const selectedContainer = ref(null);
const isModalOpen = ref(false);

// เพิ่มฟังก์ชันสำหรับแสดง Modal
const showContainerDetails = (container) => {
    if (container.EIR_NO || container.EIR_date) {
        selectedContainer.value = container;
        isModalOpen.value = true;
    }
};

// เพิ่มฟังก์ชันสำหรับปิด Modal
const closeModal = () => {
    //selectedContainer.value = null;
    isModalOpen.value = false;
};



const statusOptions = [
    { label: 'ทั้งหมด', value: '' },
    { label: 'รอดำเนินการ', value: 'Pending' },
    { label: 'กำลังดำเนินการ', value: 'Processing' },
    { label: 'เสร็จสิ้น', value: 'Complete' },
    { label: 'ยกเลิก', value: 'Cancel' }
];

const fetchContainerReturns = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/container-returns/get`, {
            params: { line_user_id: props.lineUserId }
        });
        containerReturns.value = response.data.map(item => ({
            ...item,
            containerCount: item.container_details.length,
            requesterName: item.user_profile?.name || item.user_profile?.display_name || 'ไม่ระบุ',
            containerList: item.container_details.map(container => container.container_number).join(', ')
        }));
    } catch (err) {
        console.error('Failed to fetch container returns', err);
        error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูลการคืนตู้';
    } finally {
        loading.value = false;
    }
};

const filteredContainerReturns = computed(() => {
    return containerReturns.value.filter(item => {
        // กรองตาม status ถ้ามีการเลือก
        const statusMatch = !selectedStatus.value || item.status === selectedStatus.value;

        // กรองตามคำค้นหา
        const searchLower = searchTerm.value.toLowerCase();
        const blMatch = item.bl_number.toLowerCase().includes(searchLower);
        const containerMatch = item.container_details.some(container =>
            container.container_number.toLowerCase().includes(searchLower)
        );

        return statusMatch && (blMatch || containerMatch);
    });
});

onMounted(fetchContainerReturns);

watch(() => props.lineUserId, fetchContainerReturns);

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const getStatusClass = (status) => {
    switch (status) {
        case 'Pending': return 'badge-warning';
        case 'Processing': return 'badge-info';
        case 'Complete': return 'badge-success';
        case 'Cancel': return 'badge-error';
        default: return 'badge-info';
    }
};

const handleCancel = async (item) => {
    const result = await Swal.fire({
        title: 'ยืนยันการยกเลิก',
        text: 'คุณต้องการยกเลิกการขอคืนตู้นี้ใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ยกเลิก',
        cancelButtonText: 'ไม่'
    });

    if (result.isConfirmed) {
        try {
            await axios.put(`${CONFIG.API_SERVER}/api/container-returns/cancel/${item.id}`, {
                line_user_id: props.lineUserId
            });

            Swal.fire(
                'ยกเลิกสำเร็จ',
                'การขอคืนตู้ถูกยกเลิกแล้ว',
                'success'
            );

            // Refresh the data
            await fetchContainerReturns();
        } catch (error) {
            console.error('Error cancelling container return:', error);
            Swal.fire(
                'เกิดข้อผิดพลาด',
                'ไม่สามารถยกเลิกการขอคืนตู้ได้ กรุณาลองใหม่อีกครั้ง',
                'error'
            );
        }
    }
};
</script>

<template>
    <div class="container-returns-table">
        <h3 class="text-lg font-semibold mb-4">ประวัติการคืนตู้</h3>

        <!-- Search and Filter Section -->
        <div class="mb-4 flex flex-row gap-4">
            <div class="flex-1">
                <div class="form-control">
                    <div class="input-group">
                        <input type="text" v-model="searchTerm" placeholder="ค้นหา BL หรือ Container No."
                            class="input input-bordered w-full input-sm" />
                    </div>
                </div>
            </div>
            <div class="w-32">
                <select v-model="selectedStatus" class="select select-sm select-bordered w-full">
                    <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-4">
            <span class="loading loading-spinner loading-lg"></span>
            <p>กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ error }}</span>
        </div>

        <!-- Data Display -->
        <div v-else>
            <!-- Desktop view -->
            <div class="overflow-x-auto hidden md:block">
                <table class="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th>วันที่ Request</th>
                            <th>ผู้ Request</th>
                            <th>เลข BL</th>
                            <th>สถานะ</th>
                            <th>จำนวนตู้</th>
                            <th>รายการ Container No.</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in filteredContainerReturns" :key="item.id">
                            <td>{{ formatDate(item.created_at) }}</td>
                            <td>{{ item.requesterName }}</td>
                            <td>{{ item.bl_number }}</td>
                            <td>
                                <span class="badge" :class="getStatusClass(item.status)">
                                    {{ item.status }}
                                </span>
                            </td>
                            <td>{{ item.containerCount }}</td>
                            <td>
                                <div class="space-y-1">
                                    <div v-for="container in item.container_details" :key="container.id">
                                        <button v-if="container.relate_EIR === -1" class="text-error">
                                            {{ container.container_number }} (ยกเลิก)
                                        </button>
                                        <button v-else @click="showContainerDetails(container)"
                                            :class="{ 'text-primary cursor-pointer hover:underline': container.EIR_NO || container.EIR_date }">
                                            {{ container.container_number }}
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <button v-if="item.status === 'Pending'" @click="handleCancel(item)"
                                    class="btn btn-sm btn-error">
                                    ยกเลิก
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Mobile view -->
            <div class="grid gap-4 md:hidden">
                <div v-for="item in filteredContainerReturns" :key="item.id" class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <h2 class="card-title">เลข BL: {{ item.bl_number }}</h2>
                        <p><strong>วันที่ Request:</strong> {{ formatDate(item.created_at) }}</p>
                        <p><strong>ผู้ Request:</strong> {{ item.requesterName }}</p>
                        <p>
                            <strong>สถานะ:</strong>
                            <span class="badge ml-2" :class="getStatusClass(item.status)">
                                {{ item.status }}
                            </span>
                        </p>
                        <p><strong>จำนวนตู้ Container:</strong> {{ item.containerCount }}</p>
                        <div>
                            <strong>รายการ Container:</strong>
                            <ul class="list-disc list-inside mt-1">
                                <li v-for="container in item.container_details" :key="container.id">
                                    <button v-if="container.relate_EIR === -1" class="text-error">
                                        {{ container.container_number }} (ยกเลิก)
                                    </button>
                                    <button v-else @click="showContainerDetails(container)"
                                        :class="{ 'text-primary cursor-pointer hover:underline': container.EIR_NO || container.EIR_date }">
                                        {{ container.container_number }}
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div class="card-actions justify-end mt-4">
                            <button v-if="item.status === 'Pending'" @click="handleCancel(item)"
                                class="btn btn-sm btn-error">
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- No Results Message -->
            <div v-if="filteredContainerReturns.length === 0" class="text-center py-4">
                <p v-if="searchTerm || selectedStatus">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
                <p v-else>ไม่พบข้อมูลการคืนตู้</p>
            </div>
        </div>

        <!-- Modal -->
        <input type="checkbox" id="eir_modal" class="modal-toggle" v-model="isModalOpen" />
        <div class="modal" role="dialog">
            <div class="modal-box">
                <h3 class="text-lg font-bold">รายละเอียด Container</h3>
                <div class="py-4" v-if="selectedContainer">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="font-semibold">Container No:</p>
                            <p>{{ selectedContainer.container_number }}</p>
                        </div>
                        <div>
                            <p class="font-semibold">Container Size:</p>
                            <p>{{ selectedContainer.container_size }}</p>
                        </div>
                        <div>
                            <p class="font-semibold">EIR No:</p>
                            <p>{{ selectedContainer.EIR_NO || '-' }}</p>
                        </div>
                        <div>
                            <p class="font-semibold">วันที่:</p>
                            <p>{{ selectedContainer.EIR_date ? formatDate(selectedContainer.EIR_date) : '-' }}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-action">
                    <button @click="closeModal" class="btn">ปิด</button>
                </div>
            </div>
            <label class="modal-backdrop" for="eir_modal" @click="closeModal">Close</label>
        </div>
    </div>
</template>

<style scoped>
.container-returns-table {
    width: 100%;
    overflow-x: auto;
}

@media (max-width: 768px) {
    .container-returns-table {
        overflow-x: visible;
    }
}
</style>