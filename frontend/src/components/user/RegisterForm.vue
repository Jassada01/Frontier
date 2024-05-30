<template>
    <div class="flex items-center justify-center">
        <div class=" p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 class="text-2xl font-bold mb-4 text-center">สมัครสมาชิก</h2>
            <form @submit.prevent="registerUser">
                <div class="flex justify-center mb-4">
                    <div class="relative avatar" @click="triggerFileInput">
                        <div class="w-24 rounded-full cursor-pointer">
                            <img :src="form.location_image_url" alt="User Image" />
                            <div v-if="isUploading"
                                class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-full">
                                <span class="loading loading-spinner loading-md"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mb-4 text-center">
                    <label class="block text-sm font-medium text-gray-700" for="upload">เลือกรูปภาพ</label>
                    <input type="file" id="upload" @change="uploadImage" class="hidden" ref="fileInput" />
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700" for="username">ชื่อผู้ใช้</label>
                    <input type="text" v-model="form.username" id="username" class="input input-bordered w-full"
                        required />
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700" for="displayName">ชื่อที่แสดง</label>
                    <input type="text" v-model="form.displayName" id="displayName" class="input input-bordered w-full"
                        required />
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700" for="password">รหัสผ่าน</label>
                    <input type="password" v-model="form.password" id="password" class="input input-bordered w-full"
                        required />
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700" for="position">ตำแหน่ง</label>
                    <select v-model="form.position" id="position" class="input input-bordered w-full" required>
                        <option value="ผู้ดูแลระบบ">ผู้ดูแลระบบ</option>
                        <option value="ผู้ใช้ทั่วไป">ผู้ใช้ทั่วไป</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary w-full">สมัครสมาชิก</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import axios from 'axios';
import CONFIG from '../../config/config';

const form = reactive({
    username: '',
    displayName: '',
    password: '',
    position: '',
    location_image_url: 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/default_avatar_utg.png'
});

const fileInput = ref(null);
const isUploading = ref(false);

const triggerFileInput = () => {
    fileInput.value.click();
};

const uploadImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    isUploading.value = true;

    try {
        const response = await axios.post(`${CONFIG.API_SERVER}/api/upload`, formData);
        form.location_image_url = response.data.fileUrl;
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดระหว่างการอัปโหลดรูปภาพ');
    } finally {
        isUploading.value = false;
    }
};

const registerUser = async () => {
    try {
        const response = await axios.post(`${CONFIG.API_SERVER}/api/users/register`, form);
        alert('สมัครสมาชิกสำเร็จ');
    } catch (error) {
        console.error('Error:', error);
        alert(error.response?.data.message || 'การสมัครสมาชิกล้มเหลว');
    }
};
</script>

<style scoped>
/* คุณสามารถเพิ่มสไตล์เพิ่มเติมที่นี่ */
</style>