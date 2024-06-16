// src/utils/auth.js
import axios from 'axios'
import { ref } from 'vue'
import CONFIG from '../config/config'

export const displayName = ref('')
export const position = ref('')
export const image = ref('')
export const language = ref('')
export const user_id = ref('')

export const checkLoginStatus = async (router) => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/users/status`, {
      withCredentials: true,
      timeout: 3000 // กำหนด timeout เป็น 5 วินาที
    })
    if (response.status === 200) {
      // ถ้าผู้ใช้เข้าสู่ระบบ เก็บค่าที่ได้จาก API
      //console.log(response.data);
      displayName.value = response.data.display_name
      position.value = response.data.position
      image.value = response.data.image
      user_id.value = response.data.user_id
    } else {
      // ถ้าผู้ใช้ไม่ได้เข้าสู่ระบบหรือเกิดข้อผิดพลาด ให้ redirect ไปที่หน้า /login
      router.push('/login')
    }
  } catch (error) {
    // ถ้าเกิดข้อผิดพลาด ให้ redirect ไปที่หน้า /login
    router.push('/login')
  }
}

export const logout = async (router) => {
  try {
    // เรียก API สำหรับ logout
    await axios.post(`${CONFIG.API_SERVER}/api/users/logout`, {}, { withCredentials: true })

    // ลบ Cookies ทั้งหมด
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
    })

    // นำทางไปที่หน้า /login
    router.push('/login')
  } catch (error) {
    console.error('Error during logout:', error)
    // ถ้าเกิดข้อผิดพลาด ให้นำทางไปที่หน้า /login
    router.push('/login')
  }
}
