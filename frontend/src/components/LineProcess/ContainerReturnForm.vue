<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import CONFIG from '../../config/config';

const formData = ref({
    agent: '',
    bl: '',
    containerImageUrls: [],
    returnDocumentUrls: [],
    containerSize: '',
    additionalNotes: ''
});

const containerSizes = CONFIG.CONTAINE_SIZE;
const agents = ref([]);
const isUploading = ref(false);

const emit = defineEmits(['submit', 'cancel']);

const loadAgents = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/agents/get`);
        agents.value = response.data;
    } catch (error) {
        console.error('Failed to load agents:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล Agent');
    }
};

const uploadFile = async (file, type) => {
    isUploading.value = true;
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
        const response = await axios.post(`${CONFIG.API_SERVER}/api/upload-to-subfolder`, uploadFormData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data && response.data.fileUrl) {
            if (type === 'image') {
                formData.value.containerImageUrls.push(response.data.fileUrl);
            } else {
                formData.value.returnDocumentUrls.push(response.data.fileUrl);
            }
        }
    } catch (error) {
        console.error('Failed to upload file:', error);
        alert('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
    } finally {
        isUploading.value = false;
    }
};

const handleFileUpload = async (event, type) => {
    const files = Array.from(event.target.files);
    for (const file of files) {
        await uploadFile(file, type);
    }
};

const handleRemoveFile = (type, index) => {
    if (type === 'image') {
        formData.value.containerImageUrls.splice(index, 1);
    } else {
        formData.value.returnDocumentUrls.splice(index, 1);
    }
};

const getFileNameFromUrl = (url) => {
    return url.split('/').pop();
};

const handleSubmit = () => {
    emit('submit', formData.value);
};

const handleCancel = () => {
    emit('cancel');
};

onMounted(() => {
    loadAgents();
});
</script>

<template>
    <div class="container-return-form">
        <h2 class="text-2xl font-bold mb-4">ขอคืนตู้</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="flex items-center">
                <label for="agent" class="w-1/4">Agent:</label>
                <select id="agent" v-model="formData.agent" required class="select select-bordered w-3/4">
                    <option value="" disabled>เลือก Agent</option>
                    <option v-for="agent in agents" :key="agent.agent_id" :value="agent.agent_id">
                        {{ agent.company_name }}
                    </option>
                </select>
            </div>

            <div class="flex items-center">
                <label for="bl" class="w-1/4">BL:</label>
                <input id="bl" v-model="formData.bl" type="text" required class="input input-bordered w-3/4" />
            </div>

            <div class="flex items-center">
                <label class="w-1/4">รูปตู้:</label>
                <div class="w-3/4">
                    <input type="file" ref="containerImageInput" @change="(e) => handleFileUpload(e, 'image')"
                        accept="image/*" multiple class="hidden" />
                    <button type="button" @click="$refs.containerImageInput.click()" class="btn btn-outline"
                        :disabled="isUploading">
                        <span v-if="!isUploading">เลือกรูปตู้</span>
                        <span v-else class="flex items-center">
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            กำลังอัปโหลด...
                        </span>
                    </button>
                    <div v-if="formData.containerImageUrls.length > 0" class="mt-2 flex flex-wrap gap-2">
                        <div v-for="(url, index) in formData.containerImageUrls" :key="index" class="relative">
                            <div class="avatar">
                                <div class="w-24 rounded">
                                    <img :src="url" :alt="`Container Image ${index + 1}`" />
                                </div>
                            </div>
                            <button type="button" @click="() => handleRemoveFile('image', index)"
                                class="absolute top-0 right-0 text-red-700 p-1 rounded-full text-xs">
                                X
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex items-center">
                <label class="w-1/4">ใบคืนตู้:</label>
                <div class="w-3/4">
                    <input type="file" ref="returnDocumentInput" @change="(e) => handleFileUpload(e, 'document')"
                        accept=".pdf,.doc,.docx" multiple class="hidden" />
                    <button type="button" @click="$refs.returnDocumentInput.click()" class="btn btn-outline"
                        :disabled="isUploading">
                        <span v-if="!isUploading">เลือกใบคืนตู้</span>
                        <span v-else class="flex items-center">
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            กำลังอัปโหลด...
                        </span>
                    </button>
                    <div v-if="formData.returnDocumentUrls.length > 0" class="mt-2">
                        <div v-for="(url, index) in formData.returnDocumentUrls" :key="index"
                            class="flex w-100 items-center justify-between bg-gray-100 p-2 rounded mt-1">
                            <span>{{ getFileNameFromUrl(url) }}</span>
                            <button type="button" @click="() => handleRemoveFile('document', index)"
                                class="text-red-500 hover:text-red-700">
                                ลบ
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex items-center">
                <label for="containerSize" class="w-1/4">ขนาดตู้:</label>
                <select id="containerSize" v-model="formData.containerSize" required
                    class="select select-bordered w-3/4">
                    <option value="" disabled>เลือกขนาดตู้</option>
                    <option v-for="size in containerSizes" :key="size" :value="size">{{ size }}</option>
                </select>
            </div>

            <div class="flex items-start">
                <label for="additionalNotes" class="w-1/4 pt-2">เพิ่มเติม:</label>
                <textarea id="additionalNotes" v-model="formData.additionalNotes" rows="3"
                    class="textarea textarea-bordered w-3/4" placeholder="กรอกข้อมูลเพิ่มเติม (ถ้ามี)"></textarea>
            </div>

            <div class="flex justify-between mt-6">
                <button type="button" @click="handleCancel" class="btn btn-outline">ยกเลิก</button>
                <button type="submit" class="btn btn-primary" :disabled="isUploading">ส่งข้อมูล</button>
            </div>
        </form>
    </div>
</template>