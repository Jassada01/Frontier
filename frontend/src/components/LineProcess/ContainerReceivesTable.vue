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

const containerReceives = ref([]);
const loading = ref(true);
const error = ref(null);
const searchTerm = ref('');
const selectedStatus = ref('');
const isModalOpen = ref(false);
const selectedContainer = ref(null);

const statusOptions = [
    { label: 'ทั้งหมด', value: '' },
    { label: 'รอดำเนินการ', value: 'Pending' },
    { label: 'กำลังดำเนินการ', value: 'Processing' },
    { label: 'เสร็จสิ้น', value: 'Complete' },
    { label: 'ยกเลิก', value: 'Cancel' }
];

const showContainerDetails = (container) => {
    if (container.relate_EIR || container.EIR_date) {
        selectedContainer.value = container;
        isModalOpen.value = true;
    }
};

const closeModal = () => {
    isModalOpen.value = false;
};

const fetchContainerReceives = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/container-receives/get`, {
            params: { line_user_id: props.lineUserId }
        });
        containerReceives.value = response.data;
    } catch (err) {
        console.error('Failed to fetch container receives', err);
        error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูลการขอรับตู้';
    } finally {
        loading.value = false;
    }
};

const filteredContainerReceives = computed(() => {
    return containerReceives.value.filter(item => {
        const statusMatch = !selectedStatus.value || item.status === selectedStatus.value;
        const searchLower = searchTerm.value.toLowerCase();
        const bookingMatch = item.booking_no.toLowerCase().includes(searchLower);
        const containerMatch = item.containers.some(container =>
            container.container?.toLowerCase().includes(searchLower)
        );
        return statusMatch && (bookingMatch || containerMatch);
    });
});

onMounted(fetchContainerReceives);

watch(() => props.lineUserId, fetchContainerReceives);

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
        text: 'คุณต้องการยกเลิกการขอรับตู้นี้ใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ยกเลิก',
        cancelButtonText: 'ไม่'
    });

    if (result.isConfirmed) {
        try {
            // สร้าง request body ตามรูปแบบที่ API ต้องการ
            const requestBody = {
                agent_id: item.agent_id,
                booking_no: item.booking_no,
                request_date: item.request_date,
                create_line_id: item.create_line_id,
                remark: item.remark,
                status: "Cancel", // เปลี่ยนสถานะเป็น Cancel
                containers: item.containers.map(container => ({
                    container_size: container.container_size,
                    relate_EIR: container.relate_EIR,
                    remark: container.remark
                }))
            };

            // ใช้ PUT method กับ endpoint ใหม่
            await axios.put(
                `${CONFIG.API_SERVER}/api/container-receives/update/${item.id}`,
                requestBody
            );

            await Swal.fire(
                'ยกเลิกสำเร็จ',
                'การขอรับตู้ถูกยกเลิกแล้ว',
                'success'
            );

            // โหลดข้อมูลใหม่
            await fetchContainerReceives();
        } catch (error) {
            console.error('Error cancelling container receive:', error);
            await Swal.fire(
                'เกิดข้อผิดพลาด',
                'ไม่สามารถยกเลิกการขอรับตู้ได้ กรุณาลองใหม่อีกครั้ง',
                'error'
            );
        }
    }
};
</script>

<template>
    <div class="container-receives-table">
        <h3 class="text-lg font-semibold mb-4">ประวัติการขอรับตู้</h3>

        <!-- Search and Filter Section -->
        <div class="mb-4 flex flex-row gap-4">
            <div class="flex-1">
                <div class="form-control">
                    <div class="input-group">
                        <input type="text" v-model="searchTerm" placeholder="ค้นหา Booking No. หรือ Container No."
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
                            <th>Booking No.</th>
                            <th>Agent</th>
                            <th>สถานะ</th>
                            <th>จำนวนตู้</th>
                            <th>รายการ Container</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in filteredContainerReceives" :key="item.id">
                            <td>{{ formatDate(item.request_date) }}</td>
                            <td>{{ item.booking_no }}</td>
                            <td>{{ item.agent_code }}</td>
                            <td>
                                <span class="badge" :class="getStatusClass(item.status)">
                                    {{ item.status }}
                                </span>
                            </td>
                            <td>{{ item.total_container }}</td>
                            <td>
                                <div class="space-y-1">
                                    <div v-for="container in item.containers" :key="container.id">
                                        <!-- กรณียกเลิก -->
                                        <div v-if="container.relate_EIR === -1" class="text-error text-sm">
                                            {{ container.container_size }} <span class="text-error">(ยกเลิก)</span>
                                        </div>
                                        <!-- กรณีมี EIR -->
                                        <button v-else
                                            @click="container.relate_EIR || container.EIR_date ? showContainerDetails(container) : null"
                                            :class="{
                                                'text-primary cursor-pointer hover:underline': container.relate_EIR || container.EIR_date,
                                                'cursor-default': !container.relate_EIR && !container.EIR_date
                                            }">
                                            {{ container.container || (item.status !== 'Cancel' ?
                                                `${container.container_size} (รอกำหนด)` : container.container_size) }}
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
                <div v-for="item in filteredContainerReceives" :key="item.id" class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <h2 class="card-title">Booking No: {{ item.booking_no }}</h2>
                        <p><strong>วันที่ Request:</strong> {{ formatDate(item.request_date) }}</p>
                        <p><strong>Agent:</strong> {{ item.agent_code }}</p>
                        <p>
                            <strong>สถานะ:</strong>
                            <span class="badge ml-2" :class="getStatusClass(item.status)">
                                {{ item.status }}
                            </span>
                        </p>
                        <p><strong>จำนวนตู้:</strong> {{ item.total_container }}</p>
                        <div>
                            <strong>รายการ Container:</strong>
                            <ul class="list-disc list-inside mt-1">
                                <li v-for="container in item.containers" :key="container.id"
                                    :class="{ 'text-gray-500': container.relate_EIR === -1 }">
                                    <!-- กรณียกเลิก -->
                                    <span v-if="container.relate_EIR === -1">
                                        {{ container.container_size }}
                                        <span class="text-error font-medium">(ยกเลิก)</span>
                                    </span>
                                    <!-- กรณีอื่นๆ -->
                                    <button v-else
                                        @click="container.relate_EIR || container.EIR_date ? showContainerDetails(container) : null"
                                        :class="{
                                            'text-primary cursor-pointer hover:underline': container.relate_EIR || container.EIR_date,
                                            'cursor-default': !container.relate_EIR && !container.EIR_date
                                        }">
                                        {{ container.container || (item.status !== 'Cancel' ?
                                            `${container.container_size} (รอกำหนด)` : container.container_size) }}
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
            <div v-if="filteredContainerReceives.length === 0" class="text-center py-4">
                <p v-if="searchTerm || selectedStatus">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
                <p v-else>ไม่พบข้อมูลการขอรับตู้</p>
            </div>
        </div>

        <!-- Modal -->
        <input type="checkbox" id="eir_modal_receive" class="modal-toggle" v-model="isModalOpen" />
        <div class="modal" role="dialog">
            <div class="modal-box">
                <h3 class="text-lg font-bold">รายละเอียด Container</h3>
                <div class="py-4" v-if="selectedContainer">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="font-semibold">Container No:</p>
                            <p>{{ selectedContainer.container || '-' }}</p>
                        </div>
                        <div>
                            <p class="font-semibold">Container Size:</p>
                            <p>{{ selectedContainer.container_size }}</p>
                        </div>
                        <div>
                            <p class="font-semibold">Receipt No:</p>
                            <p>{{ selectedContainer.receipt_no || '-' }}</p>
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
            <label class="modal-backdrop" for="eir_modal_receive" @click="closeModal">Close</label>
        </div>
    </div>
</template>

<style scoped>
.container-receives-table {
    width: 100%;
    overflow-x: auto;
}

@media (max-width: 768px) {
    .container-receives-table {
        overflow-x: visible;
    }
}

.text-error {
    transition: color 0.3s ease;
}

/* ปรับ bullet point ให้มีสีจางลงสำหรับรายการที่ยกเลิก */
li.text-gray-500::marker {
    color: #9CA3AF;
}
</style>