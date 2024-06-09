<template>
    <div class="flex items-center justify-center">
        <div class="p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 class="text-2xl font-bold mb-4 text-center">แก้ไขข้อมูลผู้ใช้</h2>
            <form @submit.prevent="updateUser">
                <div class="flex justify-center mb-4">
                    <div class="relative avatar" @click="triggerFileInput">
                        <div class="w-24 h-24 rounded-full overflow-hidden cursor-pointer">
                            <img :src="form.location_image_url" alt="User Image" class="w-full h-full object-cover" />
                            <div v-if="isUploading"
                                class="absolute inset-0  bg-opacity-75 flex items-center justify-center rounded-full">
                                <span class="loading loading-spinner loading-md"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mb-4 text-center">
                    <label class="block text-sm font-medium text-gray-700" for="upload">เลือกรูปภาพ</label>
                    <input type="file" id="upload" @change="uploadImage" class="hidden" ref="fileInput" />
                </div>
                <div class="mb-4 relative">
                    <label class="block text-sm font-medium text-gray-700" for="username">ชื่อผู้ใช้</label>
                    <div class="flex items-center">
                        <input type="text" v-model="form.username" id="username"
                            class="input input-bordered w-full mr-2" required disabled />
                        <button type="button" class="btn btn-secondary" @click="openResetPasswordModal">Reset
                            Password</button>
                    </div>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700" for="display_name">ชื่อที่แสดง</label>
                    <input type="text" v-model="form.display_name" id="display_name" class="input input-bordered w-full"
                        required />
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700" for="position">ตำแหน่ง</label>
                    <select v-model="form.position" id="position" class="input input-bordered w-full" required>
                        <option value="ผู้ดูแลระบบ">ผู้ดูแลระบบ</option>
                        <option value="ผู้ใช้ทั่วไป">ผู้ใช้ทั่วไป</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700" for="sign_img_upload">ลายเซ็น</label>
                    <div class="flex justify-center avatar mb-5">
                        <div class="w-50 rounded">
                            <img v-if="form.sign_img_path" :src="form.sign_img_path" alt="Signature Image"
                                class="mt-4 w-full h-auto object-cover" />
                        </div>
                    </div>
                    <div class="flex items-center">
                        <input type="file" id="sign_img_upload" @change="uploadSignImage" class="hidden"
                            ref="signFileInput" />
                    </div>
                    <div class="flex justify-around">
                        <button type="button" class="btn btn-info"
                            @click="triggerSignFileInput">อัพโหลดลายเซ็น</button>
                        <button type="button" class="btn btn-info ml-2"
                            @click="openSignatureModal">วาดลายเซ็น</button>
                    </div>
                </div>
                <div class="mb-4 form-control w-52">
                    <label class="cursor-pointer label">
                        <span class="label-text">สถานะ Active</span>
                        <input type="checkbox" class="toggle toggle-primary" v-model="form.active" />
                    </label>
                </div>
                <button type="submit" class="btn btn-primary w-full">บันทึกการแก้ไข</button>
            </form>
        </div>

        <!-- Reset Password Modal -->
        <dialog id="resetPasswordModal" class="modal">
            <div class="modal-box">
                <h3 class="font-bold text-lg">Reset Password</h3>
                <form @submit.prevent="confirmResetPassword">
                    <div class="mb-4 relative">
                        <label class="block text-sm font-medium text-gray-700" for="new_password">New Password</label>
                        <input :type="passwordFieldType" v-model="newPassword" id="new_password"
                            class="input input-bordered w-full" required />
                        <button type="button" class="absolute inset-y-0 right-0 pr-3 flex items-center"
                            @click="togglePasswordVisibility">
                            <i :class="passwordFieldType === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                        </button>
                    </div>
                    <div class="mb-4 relative">
                        <label class="block text-sm font-medium text-gray-700" for="confirm_password">Confirm
                            Password</label>
                        <input :type="passwordFieldType" v-model="confirmPassword" id="confirm_password"
                            class="input input-bordered w-full" required />
                        <button type="button" class="absolute inset-y-0 right-0 pr-3 flex items-center"
                            @click="togglePasswordVisibility">
                            <i :class="passwordFieldType === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
                        </button>
                    </div>
                    <div class="modal-action">
                        <button type="button" class="btn" @click="closeResetPasswordModal">Cancel</button>
                        <button type="submit" class="btn btn-primary"
                            :disabled="newPassword !== confirmPassword">Confirm</button>
                    </div>
                </form>
            </div>
        </dialog>

        <!-- Signature Modal -->
        <dialog id="signatureModal" class="modal">
            <div class="modal-box ">
                <h3 class="font-bold text-lg">วาดลายเซ็น</h3>
                <VueSignature ref="signaturePad" :w="'300px'" :h="'300px'" class="example"></VueSignature>
                <div class="modal-action flex justify-between">
                    <div>
                        <button type="button" class="btn  btn-neutral" @click="closeSignatureModal">Cancel</button>
                        <button type="button" class=" ms-5 btn" @click="clearSignature">Clear</button>
                    </div>
                    <div>

                        <button type="button" class="btn btn-success" @click="saveSignature">OK</button>
                    </div>
                </div>
            </div>
        </dialog>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import CONFIG from '../../config/config';
import VueSignature from 'vue3-signature';

const props = defineProps({
    userId: {
        type: [String, Number],
        required: false,
    },
});

const form = reactive({
    id: '',
    username: '',
    display_name: '',
    password: '',
    position: '',
    location_image_url: 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/default_avatar_utg.png',
    active: false,
    sign_img_path: ''
});

const fileInput = ref(null);
const isUploading = ref(false);
const signFileInput = ref(null);
const signaturePad = ref(null);
const newPassword = ref('');
const confirmPassword = ref('');
const passwordFieldType = ref('password');

const triggerFileInput = () => {
    fileInput.value.click();
};

const triggerSignFileInput = () => {
    signFileInput.value.click();
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
        Swal.fire('Error', 'เกิดข้อผิดพลาดระหว่างการอัปโหลดรูปภาพ', 'error');
    } finally {
        isUploading.value = false;
    }
};

const uploadSignImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    isUploading.value = true;

    try {
        const response = await axios.post(`${CONFIG.API_SERVER}/api/upload`, formData);
        form.sign_img_path = response.data.fileUrl;
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'เกิดข้อผิดพลาดระหว่างการอัปโหลดลายเซ็น', 'error');
    } finally {
        isUploading.value = false;
    }
};

const openSignatureModal = () => {
    const modal = document.getElementById('signatureModal');
    modal.showModal();
};

const closeSignatureModal = () => {
    const modal = document.getElementById('signatureModal');
    modal.close();
};

const saveSignature = async () => {
    const signature = signaturePad.value.save("image/png");
    if (!signature) {
        Swal.fire('Error', 'กรุณาวาดลายเซ็นก่อน', 'error');
        return;
    }

    const byteString = atob(signature.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([intArray], { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', blob, 'signature.png');
    isUploading.value = true;

    try {
        const response = await axios.post(`${CONFIG.API_SERVER}/api/upload`, formData);
        form.sign_img_path = response.data.fileUrl;
        closeSignatureModal();
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'เกิดข้อผิดพลาดระหว่างการอัปโหลดลายเซ็น', 'error');
    } finally {
        isUploading.value = false;
    }
};

const clearSignature = () => {
    signaturePad.value.clear();
};

const fetchUserData = async () => {
    if (props.userId) {
        try {
            const response = await axios.get(`${CONFIG.API_SERVER}/api/users/user/${props.userId}`);
            const userData = response.data;
            console.log(userData);
            Object.assign(form, userData);
            form.active = userData.active === 1;
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'เกิดข้อผิดพลาดระหว่างการดึงข้อมูลผู้ใช้', 'error');
        }
    }
};

const updateUser = async () => {
    try {
        const updateForm = {
            ...form,
            active: form.active ? 1 : 0
        };
        await axios.put(`${CONFIG.API_SERVER}/api/users/user/${updateForm.id}`, updateForm);
        Swal.fire('Success', 'บันทึกการแก้ไขสำเร็จ', 'success');
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', error.response?.data.message || 'การแก้ไขข้อมูลล้มเหลว', 'error');
    }
};

const openResetPasswordModal = () => {
    const modal = document.getElementById('resetPasswordModal');
    modal.showModal();
};

const closeResetPasswordModal = () => {
    const modal = document.getElementById('resetPasswordModal');
    modal.close();
    newPassword.value = '';
    confirmPassword.value = '';
};

const togglePasswordVisibility = () => {
    passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

const confirmResetPassword = async () => {
    if (newPassword.value.trim() === '' || confirmPassword.value.trim() === '' || newPassword.value !== confirmPassword.value) {
        Swal.fire('Error', 'กรุณาใส่รหัสผ่านใหม่ให้ตรงกัน', 'error');
        return;
    }

    try {
        await axios.post(`${CONFIG.API_SERVER}/api/users/user/${form.id}/reset-password`, { newPassword: newPassword.value });
        Swal.fire('Success', 'รีเซ็ตรหัสผ่านสำเร็จ', 'success');
        closeResetPasswordModal();
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'เกิดข้อผิดพลาดระหว่างการรีเซ็ตรหัสผ่าน', 'error');
    }
};

onMounted(fetchUserData);
</script>

<style scoped>
.example {
    margin: 0 auto;
}
</style>
