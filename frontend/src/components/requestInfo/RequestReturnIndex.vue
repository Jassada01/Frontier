<template>
    <div class="container mx-auto px-4">
        <div class="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
            <h1 class="text-xl font-bold">รายการขอคืนตู้</h1>
            <div class="w-full sm:w-2/3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input v-model="searchQuery" @input="performSearch" type="text"
                    placeholder="ค้นหาด้วยเลข BL หรือ Container No." class="input input-bordered w-full sm:w-2/3" />
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
            <div v-for="return_request in filteredContainerReturns" :key="return_request.id"
                class="bg-white shadow rounded-lg overflow-hidden" :class="{
                    'bg-error/10 border border-error/20': !isRequestCompleteOrCancel(return_request.status)
                }">
                <div class="p-4">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center">
                            <div class="w-10 h-10 rounded-full overflow-hidden mr-3">
                                <img :src="return_request.user_profile.picture_url"
                                    :alt="return_request.user_profile.display_name" class="w-full h-full object-cover"
                                    @error="handleImageError" />
                            </div>
                            <div>
                                <h2 class="text-lg font-semibold">BL: {{ return_request.bl_number }}</h2>
                                <p class="text-sm text-gray-500">{{ return_request.user_profile.company_name }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-sm text-gray-600">Agent</span>
                            <div class="text-2xl font-bold text-gray-700">{{ return_request.agent_code }}</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-2 text-sm mb-2">
                        <!-- คอลัมป์ซ้าย -->
                        <div>
                            <div class="mb-2">
                                <span class="text-gray-600 font-semibold">Requester:</span>
                                <span class="ml-1">{{ return_request.user_profile.display_name }}</span>
                            </div>
                            <div>
                                <span class="text-gray-600 font-semibold">จำนวนตู้:</span>
                                <span class="ml-1">{{ return_request.container_details.length }}</span>
                            </div>
                        </div>

                        <!-- คอลัมป์กลาง -->
                        <div>
                            <div class="mb-2">
                                <span class="text-gray-600 font-semibold">Date:</span>
                                <span class="ml-1">{{ formatDate(return_request.created_at) }}</span>
                            </div>
                            <div>
                                <span class="text-gray-600 font-semibold">Status:</span>
                                <span :class="getStatusBadgeClass(return_request.status)" class="ml-1">
                                    {{ return_request.status }}
                                </span>
                            </div>
                        </div>

                        <!-- คอลัมป์ขวา -->
                        <div class="space-y-2">
                            <div v-if="return_request.additional_notes">
                                <span class="text-gray-600 font-semibold text-sm">Note:</span>
                                <span class="ml-1">{{ return_request.additional_notes }}</span>
                            </div>

                            <!-- BL Attachments -->
                            <div>
                                <h3 class="text-sm font-semibold mb-1">BL Attachments</h3>
                                <div class="flex flex-wrap gap-2">
                                    <div v-for="(doc, index) in return_request.return_documents" :key="index"
                                        class="w-20 h-20 rounded overflow-hidden border border-gray-200">
                                        <img v-if="isImageFile(doc)" :src="doc"
                                            @click="openGallery(return_request.return_documents, index)"
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
                        :open="!isRequestCompleteOrCancel(return_request.status)">
                        <summary class="collapse-title text-sm font-medium py-2">รายละเอียดตู้</summary>
                        <div class="collapse-content">
                            <div v-for="container in return_request.container_details" :key="container.id"
                                class="mb-4 p-3  bg-white rounded-lg shadow-sm ">
                                <div class="flex flex-wrap items-center mb-2 justify-between ">
                                    <div>
                                        <span class="badge badge-success mr-2">{{ container.container_size }}</span>
                                        <p class="text-lg font-bold text-mute">
                                            {{ container.container_number }}
                                        </p>
                                    </div>
                                    <!-- แสดง EIR information หรือปุ่มสร้าง EIR -->
                                    <div v-if="container.EIR_NO" class="text-right">
                                        <div class="text-sm">
                                            <span class="font-semibold text-gray-600">EIR No:</span>
                                            <router-link :to="`/EIR/${container.relate_EIR}`"
                                                class="ml-1 text-primary hover:underline cursor-pointer">
                                                {{ container.EIR_NO }}
                                            </router-link>
                                        </div>
                                        <div class="text-sm">
                                            <span class="font-semibold text-gray-600">วันที่:</span>
                                            <span class="ml-1">{{ formatThaiDate(container.EIR_date) }}</span>
                                        </div>
                                    </div>
                                    <div v-else-if="return_request.status.toLowerCase() !== 'cancel'"
                                        class="flex gap-2">
                                        <button v-if="container.relate_EIR === null"
                                            @click="createEIR(container, return_request)"
                                            class="btn btn-primary btn-sm">
                                            สร้าง EIR
                                        </button>
                                        <div v-if="container.relate_EIR !== -1" class="dropdown dropdown-end">
                                            <label tabindex="0" class="btn btn-sm btn-outline btn-error">
                                                <i class="fas fa-ellipsis-v"></i>
                                            </label>
                                            <ul tabindex="0"
                                                class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box">
                                                <li>
                                                    <a @click="cancelContainer(container.id, return_request.id)"
                                                        class="text-error hover:text-error">
                                                        <i class="fas fa-ban mr-2"></i>
                                                        ยกเลิกตู้
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                        <span v-else-if="container.relate_EIR === -1" class="text-sm text-error">
                                            ตู้นี้ถูกยกเลิกแล้ว
                                        </span>
                                    </div>
                                    <span v-else class="text-sm text-error">
                                        ไม่สามารถสร้าง EIR ได้เนื่องจากรายการถูกยกเลิก
                                    </span>
                                </div>
                                <!-- ส่วนที่แสดงรูปภาพตู้คอนเทนเนอร์ -->
                                <div class="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-2">
                                    <div v-for="(image, imageIndex) in container.container_images" :key="imageIndex"
                                        @click="openGallery(container.container_images, imageIndex)"
                                        class="aspect-square rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                                        <img :src="image" class="w-full h-full object-cover"
                                            :alt="`Container ${container.container_number} image ${imageIndex + 1}`" />
                                    </div>
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
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'
import moment from 'moment';
// เพิ่ม import สำหรับ sweetalert2
import Swal from 'sweetalert2';

// กำหนดให้ moment ใช้ภาษาไทย
moment.locale('th');

import axios from 'axios';
import CONFIG from '../../config/config';

const containerReturns = ref([]);
const filteredContainerReturns = ref([]);
const showGallery = ref(false);
const currentGalleryImages = ref([]);
const currentImageIndex = ref(0);
const searchQuery = ref('');
const statusFilter = ref('');
const router = useRouter()

// ฟังก์ชันแปลงวันที่เป็นภาษาไทย
const formatThaiDate = (dateString) => {
    if (!dateString) return '-';
    const date = moment(dateString);
    // format วันที่แบบภาษาไทย
    return date.format(`D/MM/YYYY เวลา HH:mm น.`);
};


// ฟังก์ชันตรวจสอบ status
const isRequestCompleteOrCancel = (status) => {
    return ['complete', 'cancel'].includes(status.toLowerCase());
};

const currentImage = computed(() => currentGalleryImages.value[currentImageIndex.value]);

onMounted(async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/container-returns/get`);
        containerReturns.value = response.data;
        filteredContainerReturns.value = response.data;
    } catch (error) {
        console.error('Error fetching container returns:', error);
    }
});

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
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

// อัพเดทฟังก์ชัน getStatusBadgeClass ให้มี style เพิ่มเติมสำหรับ status ที่ยังไม่เสร็จ
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
    event.target.src = 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/default_avatar_utg.png'; // ใส่ path ของรูปโปรไฟล์เริ่มต้น
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
    filteredContainerReturns.value = containerReturns.value.filter(item => {
        const containerNumbers = item.container_details.map(container => container.container_number.toLowerCase());
        const blNumber = item.bl_number.toLowerCase();
        const companyName = item.user_profile.company_name.toLowerCase();
        const status = item.status.toLowerCase();

        const matchesSearchQuery = containerNumbers.some(number => number.includes(query)) ||
            blNumber.includes(query) ||
            companyName.includes(query) ||
            status.includes(query);

        const matchesStatusFilter = !statusFilter.value || item.status === statusFilter.value;

        return matchesSearchQuery && matchesStatusFilter;
    });
};
const createEIR = (containerDetail, returnRequest) => {
    const initialData = {
        entry_type: 'IN',
        agent_id: returnRequest.agent_id,
        agent_code: returnRequest.agent_code,
        booking_bl: returnRequest.bl_number,
        container: containerDetail.container_number,
        size_type: containerDetail.container_size,
        request_id: returnRequest.id,
        request_detail_id: containerDetail.id,
        request_type: 'Return'
    };

    const encodedData = encodeURIComponent(JSON.stringify(initialData));

    router.push({
        path: '/EIR',
        query: {
            initialData: encodedData
        }
    });
};

// เพิ่มฟังก์ชันสำหรับการยกเลิก container
const cancelContainer = async (containerId, requestId) => {
    try {
        const result = await Swal.fire({
            title: 'ยืนยันการยกเลิก',
            text: "คุณต้องการยกเลิกการคืนตู้ใบนี้ใช่หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            await axios.patch(`${CONFIG.API_SERVER}/api/container-returns/${requestId}/details/${containerId}/eir`);

            // Refresh data
            const response = await axios.get(`${CONFIG.API_SERVER}/api/container-returns/get`);
            containerReturns.value = response.data;
            filteredContainerReturns.value = response.data;
            performSearch(); // เรียกใช้ฟังก์ชัน search เพื่อ update filtered results

            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                text: 'ยกเลิกการคืนตู้เรียบร้อยแล้ว',
                confirmButtonColor: '#3085d6',
            });
        }
    } catch (error) {
        console.error('Error cancelling container:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถยกเลิกการคืนตู้ได้',
            confirmButtonColor: '#3085d6',
        });
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