<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import CONFIG from '../../config/config';
import { uploadFile, isUploading, validateFile } from '../../service/imageUpload';
import Swal from 'sweetalert2';

const props = defineProps({
    lineUserId: {
        type: String,
        required: true
    }
});

const formData = ref({
    line_user_id: props.lineUserId,
    agent_id: '',
    booking_no: '',
    request_date: '',
    remark: '',
    booking_document_urls: [],
    containers: [
        {
            container_size: '',
            quantity: 1
        }
    ]
});

const containerSizes = CONFIG.CONTAINE_SIZE;
const agents = ref([]);
const isSubmitting = ref(false);

const emit = defineEmits(['submit', 'cancel']);

// Container summary computation
const containerSummary = computed(() => {
    const summary = {
        total: formData.value.containers.reduce((sum, container) => sum + (container.quantity || 0), 0),
        sizes: {}
    };

    formData.value.containers.forEach(container => {
        if (container.container_size) {
            summary.sizes[container.container_size] = (summary.sizes[container.container_size] || 0) + (container.quantity || 0);
        }
    });

    return summary;
});

// Load agents data
const loadAgents = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/agents/get`);
        agents.value = response.data;
    } catch (error) {
        console.error('Failed to load agents:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถโหลดข้อมูล Agent ได้'
        });
    }
};

// Container management
const addContainerType = () => {
    formData.value.containers.push({
        container_size: '',
        quantity: 1
    });
};

const removeContainerType = (index) => {
    formData.value.containers.splice(index, 1);
};

// File handling functions
const handleBookingDocumentUpload = async (event) => {
    const files = Array.from(event.target.files);
    for (const file of files) {
        try {
            const fileUrl = await uploadFile(file, 'return_document', null, formData.value, 'booking_document_urls');
            if (fileUrl) {
                formData.value.booking_document_urls.push(fileUrl);
            }
        } catch (error) {
            console.error('File upload failed:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error.message || 'ไม่สามารถอัพโหลดไฟล์ได้'
            });
        }
    }
};

const handleRemoveFile = (index) => {
    formData.value.booking_document_urls.splice(index, 1);
};

const isImageFile = (url) => {
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
};

const getFileIconClass = (url) => {
    if (/\.pdf$/i.test(url)) return 'fas fa-file-pdf text-red-500';
    if (/\.(xls|xlsx)$/i.test(url)) return 'fas fa-file-excel text-green-500';
    if (/\.(doc|docx)$/i.test(url)) return 'fas fa-file-word text-blue-500';
    if (isImageFile(url)) return 'fas fa-file-image text-purple-500';
    return 'fas fa-file text-gray-500';
};

const getFileName = (url) => {
    return url.split('/').pop();
};

// Form submission
const prepareSubmitData = () => {
    const expandedContainers = [];
    formData.value.containers.forEach(container => {
        for (let i = 0; i < container.quantity; i++) {
            expandedContainers.push({
                container_size: container.container_size,
                remark: ''
            });
        }
    });

    return {
        agent_id: formData.value.agent_id,
        booking_no: formData.value.booking_no,
        request_date: new Date(formData.value.request_date).toISOString(),
        create_line_id: formData.value.line_user_id,
        remark: formData.value.remark,
        status: 'Pending',
        containers: expandedContainers,
        booking_document_urls: formData.value.booking_document_urls
    };
};

const handleSubmit = async () => {
    // Validate required fields
    if (!formData.value.agent_id || !formData.value.request_date ||
        formData.value.containers.some(c => !c.container_size || !c.quantity)) {
        Swal.fire({
            icon: 'warning',
            title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
            text: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบทุกช่อง',
            confirmButtonText: 'ตกลง'
        });
        return;
    }

    isSubmitting.value = true;

    try {
        const submitData = prepareSubmitData();
        const response = await axios.post(`${CONFIG.API_SERVER}/api/container-receives/add`, submitData);

        if (response.data && response.data.message) {
            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                text: "บันทึกรายการขอรับตู้แล้ว",
                confirmButtonText: 'ตกลง'
            });

            emit('submit', response.data);
        }
    } catch (error) {
        console.error('Failed to submit container receive form:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
            confirmButtonText: 'ตกลง'
        });
    } finally {
        isSubmitting.value = false;
    }
};

const handleCancel = () => {
    emit('cancel');
};

onMounted(() => {
    loadAgents();
    // Set default request date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    formData.value.request_date = tomorrow.toISOString().split('T')[0];
});
</script>

<template>
    <div class="container-receive-form">
        <h2 class="text-2xl font-bold mb-4">ขอรับตู้</h2>

        <!-- Container Summary -->
        <div class="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 class="text-lg font-semibold mb-2">สรุปจำนวนตู้</h3>
            <p>จำนวนตู้ทั้งหมด: {{ containerSummary.total }}</p>
            <ul>
                <li v-for="(count, size) in containerSummary.sizes" :key="size">
                    {{ size }}: {{ count }} ตู้
                </li>
            </ul>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Agent Selection -->
            <div class="flex items-center">
                <label for="agent" class="w-1/4">Agent: <span class="text-red-500">*</span></label>
                <select id="agent" v-model="formData.agent_id" required class="select select-bordered w-3/4">
                    <option value="" disabled>เลือก Agent</option>
                    <option v-for="agent in agents" :key="agent.agent_id" :value="agent.agent_id">
                        {{ agent.company_name }}
                    </option>
                </select>
            </div>

            <!-- Booking Number -->
            <div class="flex items-center">
                <label for="booking_no" class="w-1/4">Booking No.:</label>
                <input id="booking_no" v-model="formData.booking_no" type="text" class="input input-bordered w-3/4" />
            </div>

            <!-- Request Date -->
            <div class="flex items-center">
                <label for="request_date" class="w-1/4">วันที่ต้องการ: <span class="text-red-500">*</span></label>
                <input id="request_date" v-model="formData.request_date" type="date" required
                    class="input input-bordered w-3/4" />
            </div>

            <!-- Booking Document Upload -->
            <div class="flex items-center">
                <label class="w-1/4">เอกสาร Booking:</label>
                <div class="w-3/4">
                    <input type="file" id="bookingDocumentInput" @change="handleBookingDocumentUpload"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,image/*" multiple class="hidden" />
                    <label for="bookingDocumentInput" class="btn btn-outline cursor-pointer"
                        :class="{ 'opacity-50 cursor-not-allowed': isUploading }">
                        <span v-if="!isUploading">เลือกไฟล์ Booking</span>
                        <span v-else>
                            <span class="loading loading-spinner loading-sm"></span>
                            กำลังอัปโหลด...
                        </span>
                    </label>

                    <!-- Uploaded Files Display -->
                    <div v-if="formData.booking_document_urls.length > 0" class="mt-2 flex flex-wrap gap-2">
                        <div v-for="(url, index) in formData.booking_document_urls" :key="index" class="relative group">
                            <div v-if="isImageFile(url)" class="w-24 h-24 rounded overflow-hidden hover:opacity-75">
                                <img :src="url" :alt="`Booking Document ${index + 1}`"
                                    class="w-full h-full object-cover" />
                            </div>
                            <div v-else
                                class="w-24 h-24 bg-gray-100 rounded flex flex-col items-center justify-center p-2 hover:bg-gray-200">
                                <i :class="getFileIconClass(url)" class="text-3xl mb-2"></i>
                                <span class="text-xs text-center truncate w-full">{{ getFileName(url) }}</span>
                            </div>
                            <button type="button" @click="() => handleRemoveFile(index)" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 
                                           opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                           hover:bg-red-600">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Container Types -->
            <div v-for="(container, index) in formData.containers" :key="index"
                class="border p-4 rounded-lg mb-4 bg-gray-100">
                <h3 class="text-lg font-semibold mb-2">ประเภทตู้ที่ {{ index + 1 }}</h3>
                <div class="flex items-center mb-2">
                    <label :for="'containerSize' + index" class="w-1/4">ขนาดตู้: <span
                            class="text-red-500">*</span></label>
                    <select :id="'containerSize' + index" v-model="container.container_size" required
                        class="select select-bordered w-3/4">
                        <option value="" disabled>เลือกขนาดตู้</option>
                        <option v-for="size in containerSizes" :key="size" :value="size">{{ size }}</option>
                    </select>
                </div>
                <div class="flex items-center mb-2">
                    <label :for="'quantity' + index" class="w-1/4">จำนวน: <span class="text-red-500">*</span></label>
                    <input :id="'quantity' + index" v-model.number="container.quantity" type="number" min="1" required
                        class="input input-bordered w-3/4" />
                </div>
                <button type="button" @click="removeContainerType(index)" class="btn btn-error btn-sm mt-2"
                    v-if="formData.containers.length > 1">
                    ลบประเภทตู้นี้
                </button>
            </div>

            <!-- Add Container Type Button -->
            <button type="button" @click="addContainerType" class="btn btn-secondary btn-sm mb-4">
                เพิ่มประเภทตู้
            </button>

            <!-- Remarks -->
            <div class="flex items-start">
                <label for="remark" class="w-1/4 pt-2">หมายเหตุ:</label>
                <textarea id="remark" v-model="formData.remark" rows="3" class="textarea textarea-bordered w-3/4"
                    placeholder="กรอกข้อมูลเพิ่มเติม (ถ้ามี)"></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-between mt-6">
                <button type="button" @click="handleCancel" class="btn btn-outline"
                    :disabled="isSubmitting || isUploading">ยกเลิก</button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting || isUploading">
                    <span v-if="isSubmitting">กำลังส่งข้อมูล...</span>
                    <span v-else>ส่งข้อมูล</span>
                </button>
            </div>
        </form>
    </div>
</template>