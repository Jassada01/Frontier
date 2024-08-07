<template>
    <div class="min-h-screen flex flex-col items-center justify-center p-2">
        <div class="card lg:card-side bg-base-100 shadow-xl max-w-4xl w-full">
            <figure class="lg:w-1/2">
                <img class="object-cover w-full h-full" src="@/assets/media/picture/loginBG.png"
                    alt="Login Background" />
            </figure>
            <div class="card-body lg:w-1/2">

                <h2 class="card-title text-center">เข้าสู่ระบบ Giraffe Container</h2>
                <div v-if="loading" class="form-control mt-6">
                    <p class="text-center">
                        <span class="loading loading-spinner loading-lg"></span>
                    </p>
                </div>
                <div v-if="userProfile && !loading && showRegisterButtons" class="form-control mt-6">
                    <h3 class="text-center">สวัสดี, {{ userProfile.displayName }}</h3>
                    <div class="avatar flex justify-center">
                        <div class="w-24 rounded-full">
                            <img :src="userProfile.pictureUrl" alt="Profile Picture" class="mx-auto" />
                        </div>
                    </div>

                    <p class="text-center">{{ userProfile.statusMessage }}</p>
                </div>
                <div v-if="errorMessage" class="mt-4">
                    <div class="alert alert-error">
                        <span>{{ errorMessage }}</span>
                    </div>
                </div>
                <div v-if="showRegisterButtons" class="mt-6 flex flex-col items-center">
                    <button class="btn btn-primary btn-lg mb-4 w-full" @click="registerAsCustomer">
                        ลงทะเบียนสำหรับลูกค้า
                    </button>
                    <button class="btn btn-secondary btn-lg w-full" @click="registerAsDriver">
                        ลงทะเบียนสำหรับคนขับรถ
                    </button>
                </div>
                <div v-if="showRegisterForm && userType === 'Client'" class="form-control mt-6">
                    <h3 class="text-center font-bold">ลงทะเบียนผู้ใช้ใหม่</h3>
                    <form @submit.prevent="registerUser">
                        <div class="avatar flex justify-center">
                            <div class="w-24 rounded-full">
                                <img :src="userProfile.pictureUrl" alt="Profile Picture" class="mx-auto" />
                            </div>
                        </div>
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">ชื่อในระบบ<span class="text-error font-bold"> *</span></span>
                            </label>
                            <input type="text" v-model="name" class="input input-bordered" required />
                        </div>
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">ชื่อบริษัท<span class="text-error font-bold"> *</span></span>
                            </label>
                            <input type="text" v-model="companyName" class="input input-bordered" />
                        </div>
                        <div class="form-control mt-4">
                            <button type="submit" class="btn btn-primary">ลงทะเบียน</button>
                        </div>
                    </form>
                </div>
                <div v-if="showRegisterForm && userType === 'Driver'" class="form-control mt-6">
                    <h3 class="text-center font-bold">ลงทะเบียนคนขับรถ</h3>
                    <DriverForm @formSubmitted="handleDriverFormSubmitted" :userProfile="userProfile" />
                </div>
            </div>
        </div>
        <div class="text-center mt-4">
            <p class="text-sm text-gray-500">Copyright © {{ currentYear }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import liff from '@line/liff'
import axios from 'axios'
import Swal from 'sweetalert2'
import CONFIG from '../../config/config'
import DriverForm from './DirectRegisterDriver.vue'

const userProfile = ref(null)
const errorMessage = ref('')
const currentYear = new Date().getFullYear()
const loading = ref(true)
const showRegisterButtons = ref(false)
const showRegisterForm = ref(false)
const name = ref('')
const companyName = ref('')
let userType = ref('Client')

const loginWithLine = async () => {
    try {
        await liff.init({ liffId: "2005842122-G1xMMMEL" })
        if (!liff.isLoggedIn()) {
            liff.login()
        } else {
            const profile = await liff.getProfile()
            userProfile.value = profile
            await checkUserInDatabase(profile.userId)
        }
    } catch (err) {
        errorMessage.value = 'เกิดข้อผิดพลาดในการล็อกอิน'
        console.error('LIFF Initialization failed ', err)
    } finally {
        loading.value = false
    }
}

const checkUserInDatabase = async (userId) => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/line_user_profiles/get?line_user_id=${userId}`)
        if (response.data.length === 0) {
            // User not found in the database, show register buttons
            showRegisterButtons.value = true
        }
    } catch (err) {
        errorMessage.value = 'เกิดข้อผิดพลาดในการตรวจสอบผู้ใช้ในฐานข้อมูล'
        console.error('Database check failed', err)
    }
}

const registerAsCustomer = () => {
    userType.value = 'Client'
    showRegisterButtons.value = false
    showRegisterForm.value = true
}

const registerAsDriver = () => {
    userType.value = 'Driver'
    showRegisterButtons.value = false
    showRegisterForm.value = true
}

const registerUser = async () => {
    try {
        await axios.post(`${CONFIG.API_SERVER}/api/line_user_profiles/add`, {
            line_user_id: userProfile.value.userId,
            display_name: userProfile.value.displayName,
            picture_url: userProfile.value.pictureUrl,
            status_message: userProfile.value.statusMessage,
            user_type: userType.value,
            name: name.value,
            company_name: companyName.value,
            company_id: null, // หรือค่าที่ต้องการ
            group_id: null, // หรือค่าที่ต้องการ
            is_active: true
        })
        // Registration successful, set user profile to show the profile view
        userProfile.value = {
            ...userProfile.value,
            name: name.value,
            company_name: companyName.value
        }
        showRegisterForm.value = false
        Swal.fire({
            icon: 'success',
            title: 'ลงทะเบียนสำเร็จ',
            text: 'ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว!'
        })
    } catch (err) {
        errorMessage.value = 'เกิดข้อผิดพลาดในการลงทะเบียนผู้ใช้'
        console.error('User registration failed', err)
    }
}

const handleDriverFormSubmitted = async (driverId, companyDetails) => {
    try {
        await axios.post(`${CONFIG.API_SERVER}/api/line_user_profiles/add`, {
            line_user_id: userProfile.value.userId,
            display_name: userProfile.value.displayName,
            picture_url: userProfile.value.pictureUrl,
            status_message: driverId,
            user_type: 'Driver',
            name: userProfile.value.displayName,
            company_name: companyDetails.company_id.id,
            company_id: companyDetails.company_id.company_name,
            group_id: null,
            is_active: true
        })
        Swal.fire({
            icon: 'success',
            title: 'ลงทะเบียนสำเร็จ',
            text: 'ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว!'
        }).then(() => {
            showRegisterForm.value = false
        })
    } catch (err) {
        Swal.fire('Error', 'เกิดข้อผิดพลาดในการลงทะเบียนผู้ใช้ในระบบ Line: ' + (err.response?.data?.message || err.message), 'error')
        console.error('User registration in Line system failed', err)
    }
}

onMounted(() => {
    if (liff.isInClient()) {
        loginWithLine();
    } else {
        userProfile.value = {
            displayName: "Setsuna",
            pictureUrl: "https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/loginBG_wqv.png",
            statusMessage: "",
            userId: "Ue2ff72aa5df21f6c0047be7f883d57ff"
        }
        checkUserInDatabase(userProfile.value.userId).then(() => {
            loading.value = false;
        });
    }
});
</script>

<style>
/* สามารถเพิ่ม CSS ที่กำหนดเองได้ที่นี่ */
</style>
