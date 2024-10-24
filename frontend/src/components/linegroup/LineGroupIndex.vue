<template>
    <div class="container mx-auto px-4">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">กลุ่มผู้ใช้งานภายนอก</h1>
            <button @click="openCreateModal" class="btn btn-primary">
                <i class="fas fa-plus mr-2"></i> สร้างกลุ่มใหม่
            </button>
        </div>

        <div class="grid grid-cols-1 gap-6">
            <div v-for="group in groups" :key="group.group_id" class="bg-white shadow-xl rounded-lg overflow-hidden">
                <div class="p-4">
                    <div class="flex items-center mb-4">
                        <img :src="group.group_image" :alt="group.group_name"
                            class="w-16 h-16 rounded-full object-cover mr-4" />
                        <div>
                            <h2 class="text-xl font-semibold">{{ group.group_name }}</h2>
                            <p class="text-sm text-gray-500">สมาชิก: {{ group.members.length }}</p>
                        </div>
                    </div>
                    <p class="text-gray-600 mb-4">{{ group.notes }}</p>

                    <!-- Member Display -->
                    <div class="mb-4">
                        <h3 class="text-lg font-semibold mb-2">สมาชิก</h3>
                        <div class="flex flex-wrap gap-2">
                            <div v-for="member in group.members" :key="member.line_user_id"
                                class="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                <img :src="member.picture_url || defaultAvatar" :alt="member.display_name"
                                    class="w-8 h-8 rounded-full object-cover" />
                                <span class="ml-2 text-sm">{{ member.display_name }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-2">
                        <button @click="editGroup(group)" class="btn btn-outline btn-primary btn-sm">
                            <i class="fas fa-edit mr-1"></i> แก้ไข
                        </button>
                        <button @click="deleteGroup(group.group_id)" class="btn btn-outline btn-error btn-sm">
                            <i class="fas fa-trash-alt mr-1"></i> ลบ
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="groupToEdit" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg w-full max-w-md">
                <LineGroupManagement :groupToEdit="groupToEdit" @group-updated="handleGroupUpdated"
                    @cancel="cancelEdit" />

            </div>
        </div>

        <!-- Modal for creating new group -->
        <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg w-full max-w-md">
                <LineGroupManagement @group-created="handleGroupCreated" @cancel="closeCreateModal" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import CONFIG from '../../config/config';
import LineGroupManagement from './LineGroupManagement.vue';
import Swal from 'sweetalert2';

const groups = ref([]);
const showCreateModal = ref(false);
const groupToEdit = ref(null);
const defaultAvatar = 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/default_avatar_utg.png';// Replace with your default avatar URL


const fetchGroups = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/line-groups`);
        groups.value = response.data;
    } catch (error) {
        console.error('Error fetching groups:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถโหลดข้อมูลกลุ่มได้',
        });
    }
};

const openCreateModal = () => {
    showCreateModal.value = true;
};

const closeCreateModal = () => {
    showCreateModal.value = false;
};

const handleGroupCreated = async (newGroup) => {
    await fetchGroups(); // Refresh the group list
    closeCreateModal();
    Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'สร้างกลุ่มใหม่เรียบร้อยแล้ว',
    });
};

const editGroup = (group) => {
    groupToEdit.value = group;
};

const cancelEdit = () => {
    groupToEdit.value = null;
};

const handleGroupUpdated = async (updatedGroup) => {
    await fetchGroups(); // Refresh the group list
    groupToEdit.value = null;
    Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'อัปเดตกลุ่มเรียบร้อยแล้ว',
    });
};

const deleteGroup = async (groupId) => {
    const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "การลบกลุ่มนี้ไม่สามารถยกเลิกได้!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
        try {
            await axios.delete(`${CONFIG.API_SERVER}/api/line-groups/delete/${groupId}`);
            await fetchGroups(); // Refresh the group list
            Swal.fire(
                'ลบแล้ว!',
                'กลุ่มถูกลบเรียบร้อยแล้ว',
                'success'
            );
        } catch (error) {
            console.error('Error deleting group:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถลบกลุ่มได้',
            });
        }
    }
};

onMounted(fetchGroups);
</script>