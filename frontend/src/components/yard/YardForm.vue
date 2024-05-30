<template>
    <div class="bg-base-200 mx-auto mt-10 p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-4 text-center">
            {{ isEditMode ? 'แก้ไขลาน' : 'สร้างลานใหม่' }}
        </h2>
        <form @submit.prevent="isEditMode ? updateYard() : createYard()">
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="short_name">
                    ชื่อย่อ <span class="text-error">*</span>
                </label>
                <input v-model="yard.short_name" class="input input-bordered w-1/3 text-sm" type="text" id="short_name"
                    required />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="yard_name">
                    ชื่อลาน <span class="text-error">*</span>
                </label>
                <input v-model="yard.yard_name" class="input input-bordered w-2/3 text-sm" type="text" id="yard_name"
                    required />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="contact_person">
                    ผู้ดูแล/ติดต่อ
                </label>
                <input v-model="yard.contact_person" class="input input-bordered w-1/3 text-sm" type="text"
                    id="contact_person" />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="phone_number">
                    เบอร์โทร
                </label>
                <input v-model="yard.phone_number" class="input input-bordered w-1/3 text-sm" type="text"
                    id="phone_number" />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="website">
                    Website
                </label>
                <input v-model="yard.website" class="input input-bordered w-2/3 text-sm" type="text" id="website" />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="coordinate">
                    ละติจูดและลองจิจูด
                </label>
                <input v-model="coordinate" @change="updateCoordinates" class="input input-bordered w-2/3 text-sm"
                    type="text" id="coordinate" placeholder="ตัวอย่าง : 13.645517900706151, 100.80092722932041" />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="latitude">
                    Latitude
                </label>
                <input v-model.number="yard.latitude" class="input input-bordered w-1/3 text-sm" type="number"
                    id="latitude" readonly />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="longitude">
                    Longitude
                </label>
                <input v-model.number="yard.longitude" class="input input-bordered w-1/3 text-sm" type="number"
                    id="longitude" readonly />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="google_map_link">
                    Google Map Link
                </label>
                <input v-model="yard.google_map_link" class="input input-bordered w-2/3 text-sm" type="text"
                    id="google_map_link" readonly />
            </div>
            <div v-if="yard.latitude && yard.longitude" class="mb-4 text-center">
                <a :href="googleMapsLink" target="_blank" class="text-blue-500 underline">
                    ดูตำแหน่งบน Google Maps
                </a>
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="remark">
                    หมายเหตุ
                </label>
                <textarea v-model="yard.remark" class="textarea textarea-bordered w-2/3 text-sm" id="remark"></textarea>
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="active">
                    เปิดใช้งาน
                </label>
                <div class="form-control w-2/3">
                    <input v-model="yard.active" class="toggle toggle-primary" type="checkbox" id="active" />
                </div>
            </div>
            <div class="flex items-center justify-end">
                <button class="btn btn-primary text-sm" type="submit" :disabled="isUploading">
                    {{ isEditMode ? 'อัปเดตลาน' : 'สร้างลาน' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import CONFIG from '../../config/config';

const props = defineProps({
    isEditMode: Boolean,
    yardId: Number
})

const emit = defineEmits(['formSubmitted'])

const router = useRouter()

const yard = ref({
    short_name: '',
    yard_name: '',
    contact_person: '',
    phone_number: '',
    website: '',
    latitude: 0,
    longitude: 0,
    google_map_link: '',
    remark: '',
    active: true
})

const coordinate = ref('')
const isUploading = ref(false)

const requiredFields = ['short_name', 'yard_name']

const checkRequiredFields = () => {
    for (const field of requiredFields) {
        if (!yard.value[field]) {
            Swal.fire('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'error')
            return false
        }
    }
    return true
}

const fetchYardData = async (id) => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/yards/get?yard_id=${id}`)
        const yardData = response.data[0]
        yardData.active = yardData.active === 1
        Object.assign(yard.value, yardData)
    } catch (error) {
        Swal.fire('Error', 'Error fetching yard data: ' + error.response.data.message, 'error')
    }
}

const createYard = async () => {
    if (!checkRequiredFields()) {
        return
    }

    try {
        yard.value.active = yard.value.active ? 1 : 0
        const response = await axios.post(`${CONFIG.API_SERVER}/api/yards/add`, yard.value)
        Swal.fire('Success', 'สร้างข้อมูลลานสำเร็จ', 'success').then(() => {
            emit('formSubmitted');
            router.push({ path: `/yard/${response.data.yard_id}` });
        })
    } catch (error) {
        Swal.fire('Error', 'Error creating yard: ' + error.response.data.message, 'error')
    }
}

const updateYard = async () => {
    if (!checkRequiredFields()) {
        return
    }

    try {
        yard.value.active = yard.value.active ? 1 : 0
        await axios.put(`${CONFIG.API_SERVER}/api/yards/update/${props.yardId}`, yard.value)
        Swal.fire('Success', 'อัพเดทข้อมูลลานสำเร็จ', 'success').then(() => {
            window.location.reload();
            emit('formSubmitted')
        })
    } catch (error) {
        Swal.fire('Error', 'Error updating yard: ' + error.response.data.message, 'error')
    }
}

const updateCoordinates = () => {
    const coords = coordinate.value.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length === 2) {
        yard.value.latitude = coords[0];
        yard.value.longitude = coords[1];
        yard.value.google_map_link = `https://www.google.com/maps?q=${coords[0]},${coords[1]}`;
    } else {
        Swal.fire('Error', 'Invalid coordinate format', 'error');
    }
}

const googleMapsLink = computed(() => {
    return `https://www.google.com/maps?q=${yard.value.latitude},${yard.value.longitude}`;
});

onMounted(() => {
    if (props.isEditMode) {
        fetchYardData(props.yardId)
    }
});
</script>

<style scoped>
/* เพิ่มสไตล์ที่นี่หากจำเป็น */
</style>
