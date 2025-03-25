<template>
  <div class="min-h-screen flex flex-col items-center justify-center">
    <div class="card lg:card-side bg-base-100 shadow-xl max-w-4xl w-full">
      <figure class="lg:w-1/2">
        <img
          class="object-cover w-full h-full rounded-l-lg"
          src="../../assets/media/picture/loginBG.png"
          alt="Login Background"
        />
      </figure>
      <form class="card-body lg:w-1/2" @submit.prevent="login">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">ยินดีต้อนรับเข้าสู่ระบบ <br> Giraffe Container</h2>
          <div class="flex items-center justify-center gap-2 text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-sm font-medium">สำหรับเจ้าหน้าที่</span>
          </div>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">ชื่อผู้ใช้งาน</span>
          </label>
          <input
            v-model="username"
            type="text"
            placeholder="username"
            class="input input-bordered w-full"
            required
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">รหัสผ่าน</span>
          </label>
          <input
            v-model="password"
            type="password"
            placeholder="password"
            class="input input-bordered w-full"
            required
          />
          <!--
          <label class="label justify-end">
            <a href="#" class="label-text-alt link link-hover">ลืมรหัสผ่าน?</a>
          </label>  -->
        </div>
        <div class="form-control mt-6">
          <button class="btn btn-primary w-full">เข้าสู่ระบบ</button>
        </div>
        <div v-if="errorMessage" class="mt-4">
          <div class="alert alert-error">
            <span>{{ errorMessage }}</span>
          </div>
        </div>
      </form>
    </div>

    <!-- แยก Guest Login ออกมา -->
    <div class="mt-8 text-center">
      <div class="inline-block border-t border-gray-300 px-10 py-4">
        <p class="text-gray-600 mb-2">ไม่มีบัญชีเจ้าหน้าที่?</p>
        <router-link
          to="/GuestLogin"
          class="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          เข้าสู่ระบบสำหรับลูกค้า/ผู้ติดต่อ
        </router-link>
      </div>
    </div>

    <div class="text-center mt-4">
      <p class="text-sm text-gray-500">Copyright © {{ currentYear }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import CONFIG from '../../config/config'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const currentYear = new Date().getFullYear()

const login = async () => {
  try {
    const response = await axios.post(
      CONFIG.API_SERVER + '/api/users/login',
      {
        username: username.value,
        password: password.value
      },
      {
        withCredentials: true
      }
    )
    if (response.status === 200) {
      // ล็อกอินสำเร็จ นำทางไปที่หน้า '/'
      router.push('/')
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // แสดงข้อความเตือนเมื่อรหัสผ่านไม่ถูกต้อง
      errorMessage.value = 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
    } else {
      // จัดการข้อผิดพลาดอื่น ๆ
      errorMessage.value = 'เกิดข้อผิดพลาดในการล็อกอิน'
    }

    // ซ่อนข้อความแจ้งเตือนหลังจาก 3 วินาที
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  }
}
</script>

<style>
/* สามารถเพิ่ม CSS ที่กำหนดเองได้ที่นี่ */
</style>
