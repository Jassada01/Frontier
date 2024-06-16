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
        <h2 class="card-title text-center">เข้าสู่ระบบ Giraffe Container</h2>
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
          <label class="label">
            <a href="#" class="label-text-alt link link-hover">Forgot password?</a>
          </label>
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
