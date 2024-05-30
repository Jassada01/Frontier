<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import CONFIG from '../../config/config';

const props = defineProps({
    isEditMode: Boolean,
    companyId: Number
})

const emit = defineEmits(['formSubmitted'])

const router = useRouter()

const truckCompany = ref({
    company_name: '',
    short_name: '',
    address: '',
    tax_id: '',
    contact_person: '',
    phone_number: '',
    line_id: '',
    active: true
})

const requiredFields = ['company_name', 'short_name']

const checkRequiredFields = () => {
    for (const field of requiredFields) {
        if (!truckCompany.value[field]) {
            Swal.fire('Error', `กรุณากรอกข้อมูลให้ครบถ้วน`, 'error')
            return false
        }
    }
    return true
}

const fetchTruckCompanyData = async (id) => {
    try {
        console.log(id);
        const response = await axios.get(`${CONFIG.API_SERVER}/api/truck_companies/get?id=${id}`)
        console.log(response);
        const companyData = response.data[0]
        companyData.active = companyData.active === 1
        Object.assign(truckCompany.value, companyData)
    } catch (error) {
        Swal.fire('Error', 'Error fetching truck company data: ' + error.response.data.message, 'error')
    }
}

const createTruckCompany = async () => {
    if (!checkRequiredFields()) {
        return
    }

    try {
        truckCompany.value.active = truckCompany.value.active ? 1 : 0
        const response = await axios.post(`${CONFIG.API_SERVER}/api/truck_companies/add`, truckCompany.value)
        Swal.fire('Success', 'สร้างข้อมูลบริษัทบรรทุกสำเร็จ', 'success').then(() => {
            emit('formSubmitted');
            router.push({ path: `/TruckCompany/${response.data.company_id}` });
        })
    } catch (error) {
        Swal.fire('Error', 'Error creating truck company: ' + error.response.data.message, 'error')
    }
}

const updateTruckCompany = async () => {
    if (!checkRequiredFields()) {
        return
    }

    try {
        truckCompany.value.active = truckCompany.value.active ? 1 : 0
        await axios.put(`${CONFIG.API_SERVER}/api/truck_companies/update/${props.companyId}`, truckCompany.value)
        Swal.fire('Success', 'อัพเดทข้อมูลสำเร็จ', 'success').then(() => {
            window.location.reload();
            emit('formSubmitted')
        })
    } catch (error) {
        Swal.fire('Error', 'Error updating truck company: ' + error.response.data.message, 'error')
    }
}

onMounted(() => {
    if (props.isEditMode) {
        fetchTruckCompanyData(props.companyId)
    }
});
</script>

<template>
    <div class="bg-base-200 mx-auto mt-10 p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-4 text-center">
            {{ isEditMode ? 'แก้ไขบริษัทรถบรรทุก' : 'สร้างบริษัทรถบรรทุกใหม่' }}
        </h2>
        <form @submit.prevent>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="company_name">
                    ชื่อบริษัท <span class="text-error">*</span>
                </label>
                <input v-model="truckCompany.company_name" class="input input-bordered w-2/3 text-sm" type="text"
                    id="company_name" autocomplete="off" required />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="short_name"> ชื่อย่อ <span
                        class="text-error">*</span> </label>
                <input v-model="truckCompany.short_name" class="input input-bordered w-1/3 text-sm" type="text"
                    id="short_name" autocomplete="off" required />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="address"> ที่อยู่ </label>
                <textarea v-model="truckCompany.address" class="textarea textarea-bordered w-2/3 text-sm" id="address"
                    autocomplete="off"></textarea>
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="tax_id">
                    เลขประจำตัวผู้เสียภาษี
                </label>
                <input v-model="truckCompany.tax_id" class="input input-bordered w-1/3 text-sm" type="text" id="tax_id"
                    autocomplete="off" />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="contact_person"> ผู้ติดต่อ </label>
                <input v-model="truckCompany.contact_person" class="input input-bordered w-1/3 text-sm" type="text"
                    id="contact_person" autocomplete="off" />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="phone_number"> เบอร์โทรศัพท์ </label>
                <input v-model="truckCompany.phone_number" class="input input-bordered w-1/3 text-sm" type="text"
                    id="phone_number" autocomplete="off" />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="line_id"> LINE ID </label>
                <input v-model="truckCompany.line_id" class="input input-bordered w-1/3 text-sm" type="text"
                    id="line_id" autocomplete="off" />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="active"> เปิดใช้งาน </label>
                <div class="form-control w-2/3">
                    <input v-model="truckCompany.active" class="toggle toggle-primary" type="checkbox" id="active" />
                </div>
            </div>
            <div class="flex items-center justify-end">
                <button class="btn btn-primary text-sm" type="button"
                    @click="isEditMode ? updateTruckCompany() : createTruckCompany()">
                    {{ isEditMode ? 'อัปเดตบริษัทรถบรรทุก' : 'สร้างบริษัทรถบรรทุก' }}
                </button>
            </div>
        </form>
    </div>
</template>
