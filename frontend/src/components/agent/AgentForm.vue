<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import CONFIG from '../../config/config'

const props = defineProps({
    isEditMode: Boolean,
    agentId: Number
})

const emit = defineEmits(['formSubmitted'])

const router = useRouter()

const agent = ref({
    agent_code: '',
    company_name: '',
    contact_name: '',
    address: '',
    phone_number: '',
    email: '',
    other_details: '',
    image_path: 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/AgentDefault_m83.png',
    active: true
})

const requiredFields = ['agent_code', 'company_name']

const isUploading = ref(false)

const checkRequiredFields = () => {
    for (const field of requiredFields) {
        if (!agent.value[field]) {
            Swal.fire('Error', `กรุณากรอกข้อมูลให้ครบถ้วน`, 'error')
            return false
        }
    }
    return true
}

const fetchAgentData = async (id) => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/agents/get?agent_id=${id}`)
        const agentData = response.data[0]
        agentData.active = agentData.active === 1
        Object.assign(agent.value, agentData)
    } catch (error) {
        Swal.fire('Error', 'Error fetching agent data: ' + (error.response?.data?.message || error.message), 'error')
    }
}

const createAgent = async () => {
    if (!checkRequiredFields()) {
        return
    }

    try {
        agent.value.active = agent.value.active ? 1 : 0
        const response = await axios.post(`${CONFIG.API_SERVER}/api/agents/add`, agent.value)
        Swal.fire('Success', 'สร้างข้อมูลเอเย่นต์สำเร็จ', 'success').then(() => {
            emit('formSubmitted');
            router.push({ path: `/agent/${response.data.agent_id}`});
        })
    } catch (error) {
        Swal.fire('Error', 'Error creating agent: ' + (error.response?.data?.message || error.message), 'error')
    }
}

const updateAgent = async () => {
    if (!checkRequiredFields()) {
        return
    }

    try {
        agent.value.active = agent.value.active ? 1 : 0
        await axios.put(`${CONFIG.API_SERVER}/api/agents/update/${props.agentId}`, agent.value)
        Swal.fire('Success', 'อัพเดทข้อมูลสำเร็จ', 'success').then(() => {
            window.location.reload();
            emit('formSubmitted')
        })
    } catch (error) {
        Swal.fire('Error', 'Error updating agent: ' + (error.response?.data?.message || error.message), 'error')
    }
}

const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
        isUploading.value = true;
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${CONFIG.API_SERVER}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            agent.value.image_path = response.data.fileUrl;
        } catch (error) {
            Swal.fire('Error', 'Error uploading file: ' + (error.response?.data?.message || error.message), 'error')
        } finally {
            isUploading.value = false;
        }
    }
}

onMounted(() => {
    if (props.isEditMode) {
        fetchAgentData(props.agentId)
    }
});
</script>

<template>
    <div class="bg-base-200 mx-auto mt-10 p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-4 text-center">
            {{ isEditMode ? 'แก้ไขเอเย่นต์' : 'สร้างเอเย่นต์ใหม่' }}
        </h2>
        <form @submit.prevent>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="image_path">
                    รูปภาพเอเย่นต์
                </label>
                <div class="avatar w-2/3 flex items-center">
                    <div class="w-24 mask mask-squircle">
                        <img :src="agent.image_path" @click="$refs.fileInput.click()" class="cursor-pointer" />
                        <i v-if="isUploading && $refs.fileInput.files.length > 0" class="fas fa-spinner fa-spin"></i>
                    </div>
                    <input type="file" ref="fileInput" @change="handleFileChange" class="hidden" />
                </div>
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="agent_code">
                    รหัสเอเย่นต์ <span class="text-error">*</span>
                </label>
                <input v-model="agent.agent_code" class="input input-bordered w-1/3 text-sm" type="text" id="agent_code"
                    autocomplete="off" required />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="company_name">
                    ชื่อบริษัท <span class="text-error">*</span>
                </label>
                <input v-model="agent.company_name" class="input input-bordered w-2/3 text-sm" type="text"
                    id="company_name" autocomplete="off" required />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="contact_name"> ผู้ติดต่อ </label>
                <input v-model="agent.contact_name" class="input input-bordered w-1/3 text-sm" type="text"
                    id="contact_name" autocomplete="off" />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="address"> ที่อยู่ </label>
                <textarea v-model="agent.address" class="textarea textarea-bordered w-2/3 text-sm" id="address"
                    autocomplete="off"></textarea>
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="phone_number"> เบอร์โทรศัพท์ </label>
                <input v-model="agent.phone_number" class="input input-bordered w-1/3 text-sm" type="text"
                    id="phone_number" autocomplete="off" />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="email"> อีเมล </label>
                <input v-model="agent.email" class="input input-bordered w-1/3 text-sm" type="email" id="email"
                    autocomplete="off" />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="other_details">
                    รายละเอียดเพิ่มเติม
                </label>
                <textarea v-model="agent.other_details" class="textarea textarea-bordered w-2/3 text-sm"
                    id="other_details" autocomplete="off"></textarea>
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="active"> เปิดใช้งาน </label>
                <div class="form-control w-2/3">
                    <input v-model="agent.active" class="toggle toggle-primary" type="checkbox" id="active" />
                </div>
            </div>
            <div class="flex items-center justify-end">
                <button :disabled="isUploading" class="btn btn-primary text-sm" type="button"
                    @click="isEditMode ? updateAgent() : createAgent()">
                    {{ isEditMode ? 'อัปเดตเอเย่นต์' : 'สร้างเอเย่นต์' }}
                </button>
            </div>
        </form>
    </div>
</template>
