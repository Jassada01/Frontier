<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-2">
    <div class="card lg:card-side bg-base-100 shadow-xl max-w-4xl w-full">
      <figure class="lg:w-1/2">
        <img
          class="object-cover w-full h-full"
          src="@/assets/media/picture/loginBG2.jpg"
          alt="Login Background"
        />
      </figure>
      <div class="card-body lg:w-1/2">
        <h2 class="card-title text-center">เข้าสู่ระบบ Giraffe Container</h2>

        <form @submit.prevent="handleLogin" v-if="!showRegisterForm">
          <div class="form-control">
            <label class="label">
              <span class="label-text">ชื่อผู้ใช้</span>
            </label>
            <input
              type="text"
              v-model="username"
              placeholder="username"
              class="input input-bordered"
              required
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">รหัสผ่าน</span>
            </label>
            <input
              type="password"
              v-model="password"
              placeholder="password"
              class="input input-bordered"
              required
            />
            <label class="label">
              <span></span>
              <button
                type="button"
                @click="showForgotPasswordModal = true"
                class="label-text-alt link link-hover text-blue-500"
              >
                ลืมรหัสผ่าน?
              </button>
            </label>
          </div>
          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">เข้าสู่ระบบ</button>
          </div>
          <div class="text-center mt-4">
            <button type="button" @click="showRegisterForm = true" class="btn btn-link">
              ลงทะเบียนผู้ใช้ใหม่
            </button>
            <span class="mx-2">หรือ</span>
            <button
              type="button"
              @click="showLineModal = true"
              class="btn btn-link"
              style="color: #06c755"
            >
              ลงทะเบียนและใช้งานผ่าน Line
            </button>
          </div>
        </form>

        <form @submit.prevent="handleRegister" v-else>
          <h3 class="text-center font-bold mb-4">ลงทะเบียนผู้ใช้ใหม่</h3>
          <div class="form-control">
            <label class="label">
              <span class="label-text">ชื่อผู้ใช้<span class="text-error font-bold"> *</span></span>
            </label>
            <input
              type="text"
              v-model="registerForm.username"
              class="input input-bordered"
              required
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">รหัสผ่าน<span class="text-error font-bold"> *</span></span>
            </label>
            <input
              type="password"
              v-model="registerForm.password"
              class="input input-bordered"
              required
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text"
                >ยืนยันรหัสผ่าน<span class="text-error font-bold"> *</span></span
              >
            </label>
            <input
              type="password"
              v-model="registerForm.confirmPassword"
              class="input input-bordered"
              required
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text"
                >ชื่อ-นามสกุล<span class="text-error font-bold"> *</span></span
              >
            </label>
            <input type="text" v-model="registerForm.name" class="input input-bordered" required />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">ชื่อบริษัท<span class="text-error font-bold"> *</span></span>
            </label>
            <input
              type="text"
              v-model="registerForm.companyName"
              class="input input-bordered"
              required
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text"
                >ประเภทผู้ใช้<span class="text-error font-bold"> *</span></span
              >
            </label>
            <select v-model="registerForm.userType" class="select select-bordered" required>
              <option value="Client">ลูกค้า</option>
              <!--  <option value="Driver">คนขับรถ</option> -->
            </select>
          </div>
          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">ลงทะเบียน</button>
          </div>
          <div class="text-center mt-4">
            <button type="button" @click="showRegisterForm = false" class="btn btn-link">
              กลับไปหน้าเข้าสู่ระบบ
            </button>
          </div>
        </form>
      </div>
    </div>
    <div class="text-center mt-4">
      <p class="text-sm text-gray-500">Copyright © {{ currentYear }}</p>
    </div>

    <!-- เพิ่ม Modal สำหรับแสดง QR Code -->
    <div
      v-if="showLineModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div class="text-center">
          <h3 class="text-lg font-bold mb-4">เพิ่มเพื่อนผ่าน Line</h3>
          <img
            src="@/assets/media/picture/lineQR.png"
            alt="Line QR Code"
            class="mx-auto mb-4 w-64 h-64 object-contain"
          />
          <p class="text-sm text-gray-600 mb-4">
            สแกน QR Code เพื่อเพิ่มเพื่อนและเริ่มใช้งานผ่าน Line
          </p>
          <button @click="showLineModal = false" class="btn btn-primary w-full">ปิด</button>
        </div>
      </div>
    </div>
    <!-- Modal ลืมรหัสผ่าน -->
    <div
      v-if="showForgotPasswordModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div class="text-center">
          <h3 class="text-lg font-bold mb-4">กรุณาติดต่อ</h3>
          <div class="text-left space-y-2 mb-4">
            <p class="flex items-center">
              <span class="mr-2">📞</span>
              <span>โทรศัพท์: คุณยีราฟ 0925626422</span>
            </p>
            <p class="flex items-center">
              <span class="mr-2">📧</span>
              <span>อีเมล: giraffecontainer@gmail.com</span>
            </p>
          </div>
          <button @click="showForgotPasswordModal = false" class="btn btn-primary w-full">
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import CONFIG from '../../config/config'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import MD5 from 'crypto-js/md5'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const showRegisterForm = ref(false)
const currentYear = new Date().getFullYear()
const showLineModal = ref(false) // เพิ่ม state สำหรับควบคุม Modal
const showForgotPasswordModal = ref(false) // เพิ่ม state สำหรับ Modal ลืมรหัสผ่าน

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  companyName: '',
  userType: 'Client'
})

function generateHash(text) {
  return MD5(text).toString()
}

const handleLogin = async () => {
  try {
    const hashedPassword = generateHash(password.value)
    const response = await axios.post(`${CONFIG.API_SERVER}/api/line_user_profiles/login`, {
      username: username.value,
      password: hashedPassword
    })

    if (response.data.success) {
      localStorage.setItem('user_id', response.data.userId)
      router.push({
        name: 'LineDashboard',
        query: { userId: response.data.userId }
      })
    }
  } catch (err) {
    console.error('Login failed', err)
    // เพิ่ม Sweetalert2 แทนการใช้ errorMessage
    await Swal.fire({
      icon: 'error',
      title: 'เข้าสู่ระบบไม่สำเร็จ',
      text: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      confirmButtonText: 'ตกลง'
    })

    // รีเซ็ต password field
    password.value = ''
  }
}

const handleRegister = async () => {
  try {
    // เช็คว่ารหัสผ่านตรงกันไหม
    if (registerForm.value.password !== registerForm.value.confirmPassword) {
      await Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ตรงกัน',
        text: 'กรุณากรอกรหัสผ่านให้ตรงกันทั้งสองช่อง'
      })
      return
    }

    const hashedPassword = generateHash(registerForm.value.password)
    const userId = generateHash(registerForm.value.username + Date.now())

    try {
      await axios.post(`${CONFIG.API_SERVER}/api/line_user_profiles/addForWeb`, {
        line_user_id: userId,
        username: registerForm.value.username,
        password: hashedPassword,
        display_name: registerForm.value.name,
        picture_url:
          'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/default_avatar_utg.png',
        user_type: registerForm.value.userType,
        name: registerForm.value.name,
        company_name: registerForm.value.companyName,
        is_active: true
      })

      await Swal.fire({
        icon: 'success',
        title: 'ลงทะเบียนสำเร็จ',
        text: 'กรุณาเข้าสู่ระบบ'
      })

      showRegisterForm.value = false
      username.value = registerForm.value.username
      password.value = ''
      registerForm.value = {
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        companyName: '',
        userType: 'Client'
      }
    } catch (err) {
      if (err.response?.data?.message?.includes('username')) {
        await Swal.fire({
          icon: 'error',
          title: 'ชื่อผู้ใช้ซ้ำ',
          text: 'ชื่อผู้ใช้นี้มีในระบบแล้ว กรุณาใช้ชื่อผู้ใช้อื่น'
        })
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง'
        })
      }
      console.error('Registration failed', err)
    }
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'
    })
    console.error('Unexpected error:', error)
  }
}
</script>
