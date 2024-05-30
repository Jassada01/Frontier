// src/utils/auth.js
import axios from 'axios';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import CONFIG from '../config/config';


export const displayName = ref('');
export const position = ref('');
export const image = ref('');
export const language = ref('');

export const checkLoginStatus = async () => {
  const router = useRouter();
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/users/status`, {
      withCredentials: true
    });
    if (response.status === 200) {
      // ถ้าผู้ใช้เข้าสู่ระบบ เก็บค่าที่ได้จาก API
      //console.log(response);
      displayName.value = response.data.display_name;
      position.value = response.data.position;
      image.value = response.data.image;
      language.value = response.data.language;
    } else {
      // ถ้าผู้ใช้ไม่ได้เข้าสู่ระบบหรือเกิดข้อผิดพลาด ให้ redirect ไปที่หน้า /login
      router.push('/login');
    }
  } catch (error) {
    // ถ้าเกิดข้อผิดพลาด ให้ redirect ไปที่หน้า /login
    router.push('/login');
  }
};
