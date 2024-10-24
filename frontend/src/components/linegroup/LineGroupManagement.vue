<template>
    <div class="flex items-center justify-center">
        <div class="p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 class="text-2xl font-bold mb-4 text-center">{{ isEditing ? 'แก้ไขกลุ่มผู้ใช้งานภายนอก' : 'สร้างกลุ่มผู้ใช้งานภายนอก' }}</h2>
            <form @submit.prevent="handleSubmit">
                <div class="flex justify-center mb-4">
                    <div class="relative avatar" @click="triggerFileInput">
                        <div class="w-24 rounded-full cursor-pointer">
                            <img :src="form.group_image || defaultImage" alt="Group Image" />
                            <div v-if="isUploading"
                                class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-full">
                                <span class="loading loading-spinner loading-md"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mb-4 text-center">
                    <label class="block text-sm font-medium text-gray-700" for="upload">เลือกรูปภาพกลุ่ม</label>
                    <input type="file" id="upload" @change="uploadImage" class="hidden" ref="fileInput"
                        accept="image/*" />
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700" for="groupName">ชื่อกลุ่ม</label>
                    <input type="text" v-model="form.group_name" id="groupName" class="input input-bordered w-full"
                        required />
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700" for="notes">บันทึก</label>
                    <textarea v-model="form.notes" id="notes" class="textarea textarea-bordered w-full"
                        rows="3"></textarea>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700" for="members">สมาชิก</label>
                    <div v-for="(member, index) in form.members" :key="index" class="flex items-center mb-2">
                        <div class="flex-grow mr-2">
                            <img :src="member.picture_url || defaultImage" alt="Member"
                                class="w-8 h-8 rounded-full inline-block mr-2" />
                            <span>{{ member.display_name }} ({{ member.company_name }})</span>
                        </div>
                        <button type="button" @click="removeMember(index)" class="btn btn-error btn-sm">ลบ</button>
                    </div>
                    <button type="button" @click="openMemberSelectionModal"
                        class="btn btn-secondary btn-sm mt-2">เพิ่มสมาชิก</button>
                </div>
                <div class="flex justify-between">
                    <button type="button" @click="$emit('cancel')" class="btn btn-outline">ยกเลิก</button>
                    <button type="submit" class="btn btn-primary">{{ isEditing ? 'อัปเดต' : 'สร้าง' }}กลุ่ม</button>
                </div>
            </form>
        </div>

        <!-- Modal for member selection -->
        <dialog id="member_selection_modal" class="modal">
            <div class="modal-box w-11/12 max-w-5xl">
                <h3 class="text-lg font-bold mb-4">เลือกสมาชิก</h3>
                <input v-model="searchTerm" type="text" placeholder="ค้นหาสมาชิก"
                    class="input input-bordered w-full mb-4" />
                <div class="max-h-80 overflow-y-auto">
                    <div v-for="user in filteredUsers" :key="user.line_user_id"
                        class="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                        @click="selectMember(user)">
                        <div class="flex items-center">
                            <img :src="user.picture_url || defaultImage" alt="User"
                                class="w-10 h-10 rounded-full mr-3" />
                            <div>
                                <div class="font-semibold">{{ user.display_name }}</div>
                                <div class="text-sm text-gray-600">{{ user.company_name }}</div>
                            </div>
                        </div>
                        <input type="checkbox" :checked="isUserSelected(user)" class="checkbox" />
                    </div>
                </div>
                <div class="modal-action">
                    <form method="dialog">
                        <button @click="confirmMemberSelection" class="btn btn-primary mr-2">ยืนยัน</button>
                        <button class="btn">ปิด</button>
                    </form>
                </div>
            </div>
        </dialog>
    </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import axios from 'axios';
import CONFIG from '../../config/config';
import { checkLoginStatus, displayName, position, image, language, logout } from '../../utils/auth'

const props = defineProps({
    groupToEdit: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['group-created', 'group-updated', 'cancel']);

const defaultImage = 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/default_avatar_utg.png';

const form = reactive({
    group_name: '',
    group_image: defaultImage,
    notes: '',
    members: [],
    created_by: null
});

const isEditing = computed(() => !!props.groupToEdit);
const fileInput = ref(null);
const isUploading = ref(false);
const availableUsers = ref([]);
const selectedUsers = ref([]);
const searchTerm = ref('');
const memberSelectionModal = ref(null);

const filteredUsers = computed(() => {
    return availableUsers.value.filter(user =>
        user.display_name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        user.company_name.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
});

onMounted(() => {
    memberSelectionModal.value = document.getElementById('member_selection_modal');
    if (isEditing.value) {
        Object.assign(form, props.groupToEdit);
        form.members = props.groupToEdit.members || [];
        selectedUsers.value = [...form.members];
    }
});

const fetchLineUserProfiles = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/line_user_profiles/get`);
        availableUsers.value = response.data;
        console.log(availableUsers.value);
    } catch (error) {
        console.error('Error fetching line user profiles:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้');
    }
};

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
        form.group_image = response.data.fileUrl;
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดระหว่างการอัปโหลดรูปภาพ');
    } finally {
        isUploading.value = false;
    }
};

const openMemberSelectionModal = () => {
    fetchLineUserProfiles();
    memberSelectionModal.value.showModal();
};

const selectMember = (user) => {
    const index = selectedUsers.value.findIndex(u => u.line_user_id === user.line_user_id);
    if (index === -1) {
        selectedUsers.value.push(user);
    } else {
        selectedUsers.value.splice(index, 1);
    }
};

const isUserSelected = (user) => {
    return selectedUsers.value.some(u => u.line_user_id === user.line_user_id);
};

const confirmMemberSelection = () => {
    form.members = [...selectedUsers.value];
};

const removeMember = (index) => {
    form.members.splice(index, 1);
    selectedUsers.value = [...form.members];
};

const handleSubmit = async () => {
    try {
        const groupData = {
            group_name: form.group_name,
            group_image: form.group_image,
            notes: form.notes,
            members: form.members.map(member => member.line_user_id)
        };

        if (!isEditing.value) {
            groupData.created_by = parseInt(localStorage.getItem('userId')) || 'Admin';
        }


        let response;
        if (isEditing.value) {
            response = await axios.put(`${CONFIG.API_SERVER}/api/line-groups/update/${props.groupToEdit.group_id}`, groupData);
            emit('group-updated', response.data);
        } else {
            response = await axios.post(`${CONFIG.API_SERVER}/api/line-groups/create`, groupData);
            emit('group-created', response.data);
        }

        resetForm();
    } catch (error) {
        console.error('Error:', error);
        alert(error.response?.data.message || 'การดำเนินการล้มเหลว');
    }
};

const resetForm = () => {
    Object.assign(form, {
        group_name: '',
        group_image: defaultImage,
        notes: '',
        members: [],
        created_by: null
    });
    selectedUsers.value = [];
};

const handleCancel = () => {
    emit('cancel');
};

</script>