<template>
    <div class="">
        <form @submit.prevent>
            <div class="form-control mb-4">
                <label class="label">
                    <span class="label-text">รูปภาพคนขับ</span>
                </label>
                <div class="avatar flex items-center">
                    <div class="w-24 mask mask-squircle">
                        <img :src="driver.driver_image_path" @click="$refs.driverFileInput.click()"
                            class="cursor-pointer" />
                        <i v-if="isUploading && $refs.driverFileInput.files.length > 0"
                            class="fas fa-spinner fa-spin"></i>
                    </div>
                    <input type="file" ref="driverFileInput" @change="event => handleFileChange(event, 'driver')"
                        class="hidden" />
                </div>
            </div>
            <div class="form-control mb-4">
                <label class="label">
                    <span class="label-text">ชื่อคนขับ <span class="text-error">*</span></span>
                </label>
                <input v-model="driver.driver_name" class="input input-bordered text-sm" type="text" id="driver_name"
                    autocomplete="off" required />
            </div>
            <div class="form-control mb-4">
                <label class="label">
                    <span class="label-text">เบอร์โทร</span>
                </label>
                <input v-model="driver.phone_number" class="input input-bordered text-sm" type="text" id="phone_number"
                    autocomplete="off" />
            </div>
            <div class="form-control mb-4">
                <label class="label">
                    <span class="label-text">เลขทะเบียน</span>
                </label>
                <input v-model="driver.license_plate" class="input input-bordered text-sm" type="text"
                    id="license_plate" autocomplete="off" />
            </div>
            <div class="form-control mb-4">
                <label class="label">
                    <span class="label-text">จังหวัด</span>
                </label>
                <div>
                    <Multiselect v-model="driver.province" :options="provinces" label="name_in_thai"
                        track-by="name_in_thai" class="text-sm" placeholder="เลือกจังหวัด" />
                </div>
            </div>
            <div class="form-control mb-4">
                <label class="label">
                    <span class="label-text">บริษัทรถบรรทุก <span class="text-error">*</span></span>
                </label>
                <div>
                    <Multiselect v-model="driver.truck_company_id" :options="truckCompanies" label="company_name"
                        track-by="id" class="text-sm" placeholder="เลือกบริษัท" />
                </div>
            </div>
            <div class="form-control mb-4">
                <label class="label">
                    <span class="label-text">รูปภาพรถบรรทุก</span>
                </label>
                <div class="flex items-center">
                    <div class="w-52 rounded">
                        <img :src="driver.truck_image_path" @click="$refs.truckFileInput.click()"
                            class="cursor-pointer" />
                        <i v-if="isUploading && $refs.truckFileInput.files.length > 0"
                            class="fas fa-spinner fa-spin"></i>
                    </div>
                    <input type="file" ref="truckFileInput" @change="event => handleFileChange(event, 'truck')"
                        class="hidden" />
                </div>
            </div>
            <div class="form-control mb-4">
                <label class="label">
                    <span class="label-text">เปิดใช้งาน</span>
                </label>
                <div>
                    <input v-model="driver.is_active" class="toggle toggle-primary" type="checkbox" id="is_active" />
                </div>
            </div>
            <div class="flex items-center justify-end">
                <button :disabled="isUploading" class="btn btn-primary text-sm" type="button"
                    @click="isEditMode ? updateDriver() : createDriver()">
                    {{ isEditMode ? 'อัปเดตข้อมูลคนขับ' : 'สร้างข้อมูลคนขับ' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted, toRefs } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import CONFIG from '../../config/config'
import Multiselect from 'vue-multiselect'

const props = defineProps({
    isEditMode: Boolean,
    driverId: Number,
    userProfile: Object
})

const emit = defineEmits(['formSubmitted'])

const router = useRouter()

const driver = ref({
    driver_name: '',
    phone_number: '',
    license_plate: '',
    province: null,
    truck_company_id: null,
    truck_company_name: '',
    driver_image_path: props.userProfile.pictureUrl,
    truck_image_path: 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/Truck_default_c1d.png',
    is_active: true
})

const truckCompanies = ref([])
const provinces = ref([])
const isUploading = ref(false)

const requiredFields = ['driver_name', 'truck_company_id']

const checkRequiredFields = () => {
    for (const field of requiredFields) {
        if (!driver.value[field]) {
            Swal.fire('Error', `กรุณากรอกข้อมูลให้ครบถ้วน`, 'error')
            return false
        }
    }
    return true
}

const fetchDriverData = async (id) => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/drivers/get?driver_id=${id}`)
        const driverData = response.data[0]
        driverData.is_active = driverData.is_active === 1

        // Set province object
        const province = provinces.value.find(province => province.name_in_thai === driverData.province)
        driverData.province = province || null

        // Set truck company object
        const truckCompany = truckCompanies.value.find(company => company.id === driverData.truck_company_id)
        driverData.truck_company_id = truckCompany || null

        Object.assign(driver.value, driverData)
    } catch (error) {
        Swal.fire('Error', 'Error fetching driver data: ' + (error.response?.data?.message || error.message), 'error')
    }
}

const createDriver = async () => {
    if (!checkRequiredFields()) {
        return
    }

    try {
        const driverPayload = {
            ...driver.value,
            province: driver.value.province?.name_in_thai ?? '',
            truck_company_id: driver.value.truck_company_id?.id ?? '',
            truck_company_name: driver.value.truck_company_id?.company_name ?? '',
        };
        driverPayload.is_active = driverPayload.is_active ? 1 : 0

        const response = await axios.post(`${CONFIG.API_SERVER}/api/drivers/add`, driverPayload)
        emitFormSubmitted(response.data.driver_id);
        router.push({ path: `/Linelogin` });
    } catch (error) {
        Swal.fire('Error', 'Error creating driver: ' + (error.response?.data?.message || error.message), 'error')
    }
}

const updateDriver = async () => {
    if (!checkRequiredFields()) {
        return
    }

    try {
        const driverPayload = {
            ...driver.value,
            province: driver.value.province?.name_in_thai ?? '',
            truck_company_id: driver.value.truck_company_id?.id ?? '',
            truck_company_name: driver.value.truck_company_id?.company_name ?? '',
        };

        driverPayload.is_active = driverPayload.is_active ? 1 : 0

        await axios.put(`${CONFIG.API_SERVER}/api/drivers/update/${props.driverId}`, driverPayload)
        Swal.fire('Success', 'อัพเดทข้อมูลสำเร็จ', 'success').then(() => {
            window.location.reload();
            emitFormSubmitted(driverPayload.driver_id);
        })
    } catch (error) {
        Swal.fire('Error', 'Error updating driver: ' + (error.response?.data?.message || error.message), 'error')
    }
}

const fetchTruckCompanies = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/truck_companies/get?active=true`)
        truckCompanies.value = response.data
    } catch (error) {
        Swal.fire('Error', 'Error fetching truck companies: ' + (error.response?.data?.message || error.message), 'error')
    }
}

const fetchProvinces = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/common/getProvince`)
        provinces.value = response.data
    } catch (error) {
        Swal.fire('Error', 'Error fetching provinces: ' + (error.response?.data?.message || error.message), 'error')
    }
}

const handleFileChange = async (event, imageType) => {
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
            if (imageType === 'driver') {
                driver.value.driver_image_path = response.data.fileUrl;
            } else if (imageType === 'truck') {
                driver.value.truck_image_path = response.data.fileUrl;
            }
        } catch (error) {
            Swal.fire('Error', 'Error uploading file: ' + (error.response?.data?.message || error.message), 'error')
        } finally {
            isUploading.value = false;
        }
    }
}

const emitFormSubmitted = (driverId) => {
    emit('formSubmitted', driverId, {
        company_name: driver.value.truck_company_name,
        company_id: driver.value.truck_company_id
    });
}

onMounted(async () => {
    await fetchProvinces()
    await fetchTruckCompanies()
    if (props.isEditMode) {
        await fetchDriverData(props.driverId)
    } else {
        // Set the driver's image from LINE profile if not in edit mode
        driver.value.driver_image_path = props.userProfile.pictureUrl
    }
});
</script>

<style>
@import '../../../node_modules/vue-multiselect/dist/vue-multiselect.css';
</style>
