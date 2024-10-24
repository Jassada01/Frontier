<template>
    <div class="container mx-auto px-4">
        <div class="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
            <h1 class="text-xl font-bold">รายการรับตู้</h1>
            <div class="w-full sm:w-2/3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input v-model="searchQuery" @input="performSearch" type="text" placeholder="ค้นหาด้วยเลข Booking No."
                    class="input input-bordered w-full sm:w-2/3" />
                <select v-model="statusFilter" @change="performSearch" class="select select-bordered w-full sm:w-1/3">
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Complete">Complete</option>
                    <option value="Cancel">Cancel</option>
                </select>
            </div>
        </div>

        <div class="space-y-4">
            <div v-for="receive in filteredContainerReceives" :key="receive.id"
                class="bg-white shadow rounded-lg overflow-hidden"
                :class="{ 'bg-error/10 border border-error/20': !isRequestCompleteOrCancel(receive.status) }">
                <div class="p-4">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center">
                            <div class="w-10 h-10 rounded-full overflow-hidden mr-3">
                                <img :src="receive.user.picture_url" :alt="receive.user.display_name"
                                    class="w-full h-full object-cover" @error="handleImageError" />
                            </div>
                            <div>
                                <h2 class="text-lg font-semibold">Booking: {{ receive.booking_no }}</h2>
                                <p class="text-sm text-gray-500">{{ receive.user.company_name }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-sm text-gray-600">Agent</span>
                            <div class="text-2xl font-bold text-gray-700">{{ receive.agent_code }}</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-2 text-sm mb-2">
                        <!-- คอลัมป์ซ้าย -->
                        <div>
                            <div class="mb-2">
                                <span class="text-gray-600 font-semibold">Requester:</span>
                                <span class="ml-1">{{ receive.user.display_name }}</span>
                            </div>
                            <div>
                                <span class="text-gray-600 font-semibold">จำนวนตู้:</span>
                                <span class="ml-1">{{ receive.total_container }}</span>
                            </div>
                        </div>

                        <!-- คอลัมป์กลาง -->
                        <div>
                            <div class="mb-2">
                                <span class="text-gray-600 font-semibold">Request Date:</span>
                                <span class="ml-1">{{ formatDate(receive.request_date) }}</span>
                            </div>
                            <div>
                                <span class="text-gray-600 font-semibold">Status:</span>
                                <span :class="getStatusBadgeClass(receive.status)" class="ml-1">
                                    {{ receive.status }}
                                </span>
                            </div>
                        </div>

                        <!-- คอลัมป์ขวา -->
                        <div class="space-y-2">
                            <div v-if="receive.remark">
                                <span class="text-gray-600 font-semibold text-sm">Note:</span>
                                <span class="ml-1">{{ receive.remark }}</span>
                            </div>

                            <!-- Booking Documents -->
                            <div v-if="receive.booking_documents.length > 0">
                                <h3 class="text-sm font-semibold mb-1">Booking Documents</h3>
                                <div class="flex flex-wrap gap-2">
                                    <div v-for="(doc, index) in receive.booking_documents" :key="index"
                                        class="w-20 h-20 rounded overflow-hidden border border-gray-200">
                                        <img v-if="isImageFile(doc)" :src="doc"
                                            @click="openGallery(receive.booking_documents, index)"
                                            class="w-full h-full object-cover cursor-pointer" />
                                        <a v-else :href="doc" target="_blank"
                                            class="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-1 hover:bg-gray-200">
                                            <i :class="getFileIcon(doc)" class="text-xl mb-1"></i>
                                            <span class="text-xs text-center break-words w-full"
                                                :title="getFileName(doc)">
                                                {{ truncateFileName(getFileName(doc)) }}
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <details class="collapse collapse-plus bg-base-200"
                        :open="!isRequestCompleteOrCancel(receive.status)">
                        <summary class="collapse-title text-sm font-medium py-2">รายละเอียดตู้</summary>
                        <div class="collapse-content">
                            <div v-for="container in receive.containers" :key="container.id"
                                class="mb-4 p-3 bg-white rounded-lg shadow-sm">
                                <div class="flex flex-wrap items-center mb-2 justify-between">
                                    <div>
                                        <span class="badge badge-success mr-2">{{ container.container_size }}</span>
                                        <!-- ปรับเงื่อนไขการแสดงผลหมายเลขตู้ -->
                                        <p v-if="receive.status.toLowerCase() === 'cancel' || container.relate_EIR === -1"
                                            class="text-lg font-bold text-gray-300">
                                            {{ container.container || '-' }}
                                        </p>
                                        <p v-else class="text-lg font-bold text-mute">
                                            {{ container.container || 'รอกำหนดหมายเลขตู้' }}
                                        </p>
                                    </div>
                                    <div v-if="container.relate_EIR === -1" class="text-sm text-error font-medium">
                                        <i class="fas fa-ban mr-1"></i> ยกเลิกแล้ว
                                    </div>
                                    <div v-else-if="container.relate_EIR" class="text-right">
                                        <!-- ส่วนแสดง EIR information (คงเดิม) -->
                                        <router-link :to="`/EIR/${container.relate_EIR}`"
                                            class="block hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                                            <div class="text-sm">
                                                <span class="font-semibold text-gray-600">EIR No:</span>
                                                <span class="ml-1 text-primary underline">{{ container.receipt_no
                                                    }}</span>
                                            </div>
                                            <div class="text-sm">
                                                <span class="font-semibold text-gray-600">วันที่:</span>
                                                <span class="ml-1">{{ formatThaiDate(container.EIR_date) }}</span>
                                            </div>
                                        </router-link>
                                    </div>
                                    <div v-else-if="receive.status.toLowerCase() !== 'cancel'" class="flex gap-2">
                                        <button @click="createEIR(container, receive)" class="btn btn-primary btn-sm">
                                            สร้าง EIR
                                        </button>
                                        <div class="dropdown dropdown-end">
                                            <label tabindex="0" class="btn btn-sm btn-outline btn-error">
                                                <i class="fas fa-ellipsis-v"></i>
                                            </label>
                                            <ul tabindex="0"
                                                class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box">
                                                <li>
                                                    <a @click="cancelContainer(container, receive)"
                                                        class="text-error hover:text-error">
                                                        <i class="fas fa-ban mr-2"></i>
                                                        ยกเลิกตู้
                                                    </a>
                                                </li>
                                                <!-- สามารถเพิ่มตัวเลือกอื่นๆ ได้ในอนาคต -->
                                            </ul>
                                        </div>
                                    </div>
                                    <span v-else class="text-sm text-error">
                                        ไม่สามารถสร้าง EIR ได้เนื่องจากรายการถูกยกเลิก
                                    </span>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        </div>

        <!-- Image Gallery Modal -->
        <dialog :open="showGallery" class="modal">
            <div class="modal-box max-w-4xl">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        @click="closeGallery">✕</button>
                </form>
                <img :src="currentImage" class="max-h-[60vh] mx-auto mb-4" />
                <div class="flex justify-between">
                    <button @click="prevImage" class="btn btn-primary">ก่อนหน้า</button>
                    <button @click="nextImage" class="btn btn-primary">ถัดไป</button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="closeGallery">close</button>
            </form>
        </dialog>

        <!-- Container Selection Modal -->
        <dialog :open="showContainerModal" class="modal">
            <div class="modal-box max-w-4xl">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        @click="closeContainerModal">✕</button>
                </form>
                <h3 class="font-bold text-lg mb-4">เลือกตู้คอนเทนเนอร์</h3>

                <!-- Loading State -->
                <div v-if="isLoadingContainers" class="flex justify-center items-center p-8">
                    <span class="loading loading-spinner loading-lg text-primary"></span>
                </div>

                <!-- Error State -->
                <div v-else-if="containerError" class="alert alert-error">
                    <span>{{ containerError }}</span>
                </div>

                <!-- Empty State -->
                <div v-else-if="availableContainers.length === 0" class="alert alert-info">
                    <span>ไม่พบตู้คอนเทนเนอร์ที่ตรงตามเงื่อนไข</span>
                </div>

                <!-- Container List -->
                <div v-else class="overflow-x-auto">
                    <table class="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>เลขตู้</th>
                                <th>วันที่รับเข้า</th>
                                <th>Booking/BL</th>
                                <th>ลาน</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="container in availableContainers" :key="container.id">
                                <td>{{ container.container }}</td>
                                <td>{{ formatThaiDate(container.date) }}</td>
                                <td>{{ container.booking_bl }}</td>
                                <td>{{ container.yard }}</td>
                                <td>
                                    <button @click="selectContainer(container)" class="btn btn-primary btn-sm">
                                        เลือก
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="closeContainerModal">close</button>
            </form>
        </dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import moment from 'moment';
import axios from 'axios';
import CONFIG from '../../config/config';
import Swal from 'sweetalert2';


// กำหนดให้ moment ใช้ภาษาไทย
moment.locale('th');

const containerReceives = ref([]);
const filteredContainerReceives = ref([]);
const showGallery = ref(false);
const currentGalleryImages = ref([]);
const currentImageIndex = ref(0);
const searchQuery = ref('');
const statusFilter = ref('');
const router = useRouter();

const showContainerModal = ref(false);
const availableContainers = ref([]);
const isLoadingContainers = ref(false);
const containerError = ref('');
const selectedContainer = ref(null);
const currentContainerDetail = ref(null);
const currentReceive = ref(null);

const currentImage = computed(() => currentGalleryImages.value[currentImageIndex.value]);

onMounted(async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/container-receives/get`);
        containerReceives.value = response.data;
        filteredContainerReceives.value = response.data;
    } catch (error) {
        console.error('Error fetching container receives:', error);
    }
});

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatThaiDate = (dateString) => {
    if (!dateString) return '-';
    const date = moment(dateString);
    return date.format('D/MM/YYYY เวลา HH:mm น.');
};

const isRequestCompleteOrCancel = (status) => {
    return ['complete', 'cancel'].includes(status.toLowerCase());
};

const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
        case 'pending':
            return 'badge badge-warning font-semibold';
        case 'processing':
            return 'badge badge-info font-semibold';
        case 'complete':
            return 'badge badge-success font-semibold';
        case 'cancel':
            return 'badge badge-error font-semibold';
        default:
            return 'badge';
    }
};

const openGallery = (images, index) => {
    currentGalleryImages.value = images;
    currentImageIndex.value = index;
    showGallery.value = true;
};

const closeGallery = () => {
    showGallery.value = false;
};

const nextImage = () => {
    currentImageIndex.value = (currentImageIndex.value + 1) % currentGalleryImages.value.length;
};

const prevImage = () => {
    currentImageIndex.value = (currentImageIndex.value - 1 + currentGalleryImages.value.length) % currentGalleryImages.value.length;
};

const isImageFile = (url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

const getFileIcon = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'fas fa-file-pdf text-red-500';
        case 'xls':
        case 'xlsx':
            return 'fas fa-file-excel text-green-500';
        case 'doc':
        case 'docx':
            return 'fas fa-file-word text-blue-500';
        default:
            return 'fas fa-file text-gray-500';
    }
};

const handleImageError = (event) => {
    event.target.src = 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/default_avatar_utg.png';
};

const getFileName = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
};

const truncateFileName = (fileName, maxLength = 15) => {
    if (fileName.length <= maxLength) {
        return fileName;
    }
    const extension = fileName.split('.').pop();
    const nameWithoutExtension = fileName.slice(0, -(extension.length + 1));
    const truncatedName = nameWithoutExtension.slice(0, maxLength - 3) + '...';
    return `${truncatedName}.${extension}`;
};

const performSearch = () => {
    const query = searchQuery.value.toLowerCase();
    filteredContainerReceives.value = containerReceives.value.filter(item => {
        const bookingNo = item.booking_no.toLowerCase();
        const companyName = item.user.company_name.toLowerCase();
        const status = item.status.toLowerCase();

        const matchesSearchQuery = bookingNo.includes(query) ||
            companyName.includes(query) ||
            status.includes(query);

        const matchesStatusFilter = !statusFilter.value || item.status === statusFilter.value;

        return matchesSearchQuery && matchesStatusFilter;
    });
};


// เพิ่มฟังก์ชันสำหรับ Modal
const createEIR = async (containerDetail, receive) => {
    try {
        currentContainerDetail.value = containerDetail;
        currentReceive.value = receive;

        showContainerModal.value = true;
        isLoadingContainers.value = true;
        containerError.value = '';

        const response = await axios.get(`${CONFIG.API_SERVER}/api/EIR/getAvailableContainers`, {
            params: {
                agent_id: receive.agent_id,
                size_type: containerDetail.container_size
            }
        });

        if (response.data.success) {
            availableContainers.value = response.data.data;
        } else {
            throw new Error(response.data.message);
        }
    } catch (error) {
        containerError.value = error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลตู้';
    } finally {
        isLoadingContainers.value = false;
    }
};

const closeContainerModal = () => {
    showContainerModal.value = false;
    availableContainers.value = [];
    containerError.value = '';
    selectedContainer.value = null;
    currentContainerDetail.value = null;
    currentReceive.value = null;
};

const selectContainer = (container) => {
    selectedContainer.value = container;

    const initialData = {
        entry_type: 'OUT',
        agent_id: currentReceive.value.agent_id,
        agent_code: currentReceive.value.agent_code,
        booking_bl: currentReceive.value.booking_no,
        size_type: currentContainerDetail.value.container_size,
        request_id: currentReceive.value.id,
        request_detail_id: currentContainerDetail.value.id,
        request_type: 'Receive',
        // เพิ่มข้อมูลตู้ที่เลือก
        id: container.id,
        container: container.container,
        container_color: container.container_color,
        zone_id: container.zone_id,
        zone: container.zone
    };

    const encodedData = encodeURIComponent(JSON.stringify(initialData));
    router.push({
        path: '/EIR',
        query: {
            initialData: encodedData
        }
    });

    closeContainerModal();
};

const cancelContainer = async (container, receive) => {
    // แสดง SweetAlert confirmation
    const result = await Swal.fire({
        title: 'ยืนยันการยกเลิกตู้',
        text: `คุณต้องการยกเลิกตู้ขนาด ${container.container_size} ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่ ยกเลิกเลย',
        cancelButtonText: 'ไม่ยกเลิก'
    });

    if (result.isConfirmed) {
        try {
            // แสดง loading
            Swal.fire({
                title: 'กำลังดำเนินการ...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // เรียก API
            await axios.put(
                `${CONFIG.API_SERVER}/api/container-receives/${receive.id}/detail/${container.id}/cancel`
            );

            // Refresh data
            const response = await axios.get(`${CONFIG.API_SERVER}/api/container-receives/get`);
            containerReceives.value = response.data;
            filteredContainerReceives.value = response.data;

            // แสดง success message
            Swal.fire(
                'สำเร็จ!',
                'ยกเลิกตู้เรียบร้อยแล้ว',
                'success'
            );
        } catch (error) {
            console.error('Error cancelling container:', error);
            // แสดง error message
            Swal.fire(
                'เกิดข้อผิดพลาด!',
                error.response?.data?.message || 'ไม่สามารถยกเลิกตู้ได้',
                'error'
            );
        }
    }
};




</script>

<style scoped>
.bg-error\/10 {
    transition: background-color 0.3s ease;
}

.dropdown-content {
    min-width: 150px;
}

/* ปรับแต่ง hover effect ของ dropdown item */
.dropdown-content li a:hover {
    background-color: #FEE2E2;
    /* red-100 */
}

/* ทำให้ pointer เป็น cursor เมื่อ hover */
.dropdown-content li a {
    cursor: pointer;
}
</style>