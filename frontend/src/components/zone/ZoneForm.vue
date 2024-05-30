<template>
    <div class="bg-base-200 mx-auto mt-10 p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-4 text-center">
            {{ isEditMode ? 'แก้ไขโซน' : 'สร้างโซนใหม่' }}
        </h2>
        <form @submit.prevent="isEditMode ? updateZone() : createZone()">
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="yard_name">
                    ชื่อลาน <span class="text-error">*</span>
                </label>
                <input v-model="zone.yard_name" class="input input-bordered w-2/3 text-sm" type="text" id="yard_name"
                    required />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="zone">
                    Zone <span class="text-error">*</span>
                </label>
                <input v-model="zone.zone" class="input input-bordered w-2/3 text-sm" type="text" id="zone" required />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="details">
                    รายละเอียดเพิ่มเติม
                </label>
                <textarea v-model="zone.details" class="textarea textarea-bordered w-2/3 text-sm"
                    id="details"></textarea>
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="contact">
                    ผู้ดูแล/ติดต่อ
                </label>
                <input v-model="zone.contact" class="input input-bordered w-2/3 text-sm" type="text" id="contact" />
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
                <input v-model.number="zone.latitude" class="input input-bordered w-1/3 text-sm" type="number"
                    id="latitude" readonly />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="longitude">
                    Longitude
                </label>
                <input v-model.number="zone.longitude" class="input input-bordered w-1/3 text-sm" type="number"
                    id="longitude" readonly />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="google_map_link">
                    Google Map Link
                </label>
                <input v-model="zone.google_map_link" class="input input-bordered w-2/3 text-sm" type="text"
                    id="google_map_link" readonly />
            </div>
            <div v-if="zone.latitude && zone.longitude" class="mb-4 text-center">
                <a :href="googleMapsLink" target="_blank" class="text-blue-500 underline">
                    ดูตำแหน่งบน Google Maps
                </a>
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="max_capacity">
                    รองรับตู้สูงสุด
                </label>
                <input v-model.number="zone.max_capacity" class="input input-bordered w-1/3 text-sm" type="number"
                    id="max_capacity" />
            </div>
            <div class="mb-4 flex items-center">
                <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="active">
                    เปิดใช้งาน
                </label>
                <div class="form-control w-2/3">
                    <input v-model="zone.active" class="toggle toggle-primary" type="checkbox" id="active" />
                </div>
            </div>
            <div class="mb-4 flex flex-col items-center">
                <div class="w-full flex items-center">
                    <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="path_map">
                        แผนที่ Zone
                    </label>
                    <input type="file" @change="handleFileUpload" class="file-input w-2/3 file-input-bordered file-input-sm w-full max-w-xs" accept="image/*" />
                </div>
                <div class="w-2/3 h-auto mt-2 object-cover flex justify-center items-center" v-if="isUploading">
                    <i class="fas fa-spinner fa-spin text-3xl"></i>
                </div>
                <img v-if="zone.path_map && !isUploading" :src="zone.path_map" class="w-2/3 h-auto mt-2 object-cover"
                    alt="Path Map Preview" />
            </div>
            <div class="flex items-center justify-end">
                <button class="btn btn-primary text-sm" type="submit" :disabled="isUploading">
                    {{ isEditMode ? 'อัปเดตโซน' : 'สร้างโซน' }}
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
    zoneId: Number
})

const emit = defineEmits(['formSubmitted'])

const router = useRouter()

const zone = ref({
    yard_name: 'Giraffe Container',
    zone: '',
    details: '',
    contact: '',
    path_map: '',
    google_map_link: '',
    latitude: 0,
    longitude: 0,
    max_capacity: 0,
    active: true
})

const coordinate = ref('')
const isUploading = ref(false)

const requiredFields = ['yard_name', 'zone']

const checkRequiredFields = () => {
    for (const field of requiredFields) {
        if (!zone.value[field]) {
            Swal.fire('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'error')
            return false
        }
    }
    return true
}

const fetchZoneData = async (id) => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/zones/get?zone_id=${id}`)
        const zoneData = response.data[0]
        console.log(zoneData);
        zoneData.active = zoneData.active === 1
        Object.assign(zone.value, zoneData)
    } catch (error) {
        Swal.fire('Error', 'Error fetching zone data: ' + error.response.data.message, 'error')
    }
}

const createZone = async () => {
    if (!checkRequiredFields()) {
        return
    }

    try {
        zone.value.active = zone.value.active ? 1 : 0
        const response = await axios.post(`${CONFIG.API_SERVER}/api/zones/add`, zone.value)
        Swal.fire('Success', 'สร้างข้อมูลโซนสำเร็จ', 'success').then(() => {
            emit('formSubmitted');
            router.push({ path: `/zone/${response.data.zone_id}` });
        })
    } catch (error) {
        Swal.fire('Error', 'Error creating zone: ' + error.response.data.message, 'error')
    }
}

const updateZone = async () => {
    if (!checkRequiredFields()) {
        return
    }

    try {
        zone.value.active = zone.value.active ? 1 : 0
        console.log(zone.value);
        await axios.put(`${CONFIG.API_SERVER}/api/zones/update/${props.zoneId}`, zone.value)
        Swal.fire('Success', 'อัพเดทข้อมูลโซนสำเร็จ', 'success').then(() => {
            window.location.reload();
            emit('formSubmitted')
        })
    } catch (error) {
        Swal.fire('Error', 'Error updating zone: ' + error.response.data.message, 'error')
    }
}

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
        isUploading.value = true
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post(`${CONFIG.API_SERVER}/api/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            zone.value.path_map = response.data.fileUrl;
            //Swal.fire('Success', 'File uploaded successfully', 'success');
        } catch (error) {
            Swal.fire('Error', 'Error uploading file: ' + error.response.data.message, 'error');
        } finally {
            isUploading.value = false
        }
    }
};

const updateCoordinates = () => {
    const coords = coordinate.value.split(',').map(coord => parseFloat(coord.trim()));
    if (coords.length === 2) {
        zone.value.latitude = coords[0];
        zone.value.longitude = coords[1];
        zone.value.google_map_link = `https://www.google.com/maps?q=${coords[0]},${coords[1]}`;
    } else {
        Swal.fire('Error', 'Invalid coordinate format', 'error');
    }
}

const googleMapsLink = computed(() => {
    return `https://www.google.com/maps?q=${zone.value.latitude},${zone.value.longitude}`;
});

onMounted(() => {
    if (props.isEditMode) {
        fetchZoneData(props.zoneId)
    }
});
</script>

<style scoped>
/* เพิ่มสไตล์ที่นี่หากจำเป็น */
</style>
