<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import CONFIG from '../../config/config'
import ContainerReturnForm from './ContainerReturnForm.vue'
import ContainerReturnsTable from './ContainerReturnsTable.vue'
import ContainerReceiveForm from './ContainerReceiveForm.vue'
import ContainerReceivesTable from './ContainerReceivesTable.vue'
import { uploadFile, isUploading, validateFile } from '../../service/imageUpload'
import Swal from 'sweetalert2'
import MD5 from 'crypto-js/md5' // เพิ่ม import

const route = useRoute()
const userData = ref(null)
const loading = ref(true)
const error = ref(null)
const showReturnForm = ref(false)
const showReceiveForm = ref(false)
const showEditForm = ref(false)
const editForm = ref({
  name: '',
  company_name: '',
  display_name: ''
})

// เพิ่ม ref สำหรับฟอร์ม credentials
const showCredentialsForm = ref(false)
const credentialsForm = ref({
  username: '',
  password: '',
  confirm_password: ''
})

const activeTab = ref('requestReturn')
const isUploadingProfile = ref(false)

const userType = computed(() => {
  return userData.value?.user_type === 'Client' ? 'ลูกค้า' : 'คนขับรถ'
})

const loadUserData = async () => {
  const userId = route.query.userId
  if (typeof userId === 'string' && userId.trim() !== '') {
    try {
      const response = await axios.get(`${CONFIG.API_SERVER}/api/line_user_profiles/get`, {
        params: { line_user_id: userId }
      })
      if (Array.isArray(response.data) && response.data.length > 0) {
        userData.value = response.data[0]
        editForm.value = {
          name: userData.value.name,
          company_name: userData.value.company_name,
          display_name: userData.value.display_name
        }
      } else {
        error.value = 'ไม่พบข้อมูลผู้ใช้'
      }
    } catch (err) {
      console.error('Failed to load user data', err)
      error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้'
    } finally {
      loading.value = false
    }
  } else {
    error.value = 'ไม่พบ User ID หรือ User ID ไม่ถูกต้อง'
    loading.value = false
  }
}

const handleEditProfile = () => {
  showEditForm.value = true
  showReturnForm.value = false
  showReceiveForm.value = false
}

const handleSaveProfile = async () => {
  try {
    const response = await axios.put(
      `${CONFIG.API_SERVER}/api/line_user_profiles/update/${userData.value.id}`,
      {
        ...userData.value,
        ...editForm.value
      }
    )

    if (response.data) {
      userData.value = {
        ...userData.value,
        ...editForm.value
      }

      await Swal.fire({
        icon: 'success',
        title: 'บันทึกข้อมูลสำเร็จ',
        text: 'ข้อมูลของคุณถูกอัพเดทเรียบร้อยแล้ว'
      })

      showEditForm.value = false
    }
  } catch (err) {
    console.error('Failed to update profile', err)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถอัพเดทข้อมูลได้'
    })
  }
}

const handleReturnContainer = () => {
  showReturnForm.value = true
  showReceiveForm.value = false
  showEditForm.value = false
}

const handleReceiveContainer = () => {
  showReceiveForm.value = true
  showReturnForm.value = false
  showEditForm.value = false
}

const handleReturnFormSubmit = (formData) => {
  console.log('Return form submitted:', formData)
  showReturnForm.value = false
  activeTab.value = 'requestReturn'
}

const handleReceiveFormSubmit = (formData) => {
  console.log('Receive form submitted:', formData)
  showReceiveForm.value = false
  activeTab.value = 'history'
}

const handleReturnFormCancel = () => {
  showReturnForm.value = false
}

const handleReceiveFormCancel = () => {
  showReceiveForm.value = false
}

const handleProfileImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    validateFile(file, ['image/jpeg', 'image/png'], 5) // 5MB limit

    isUploadingProfile.value = true // เริ่มอัพโหลด

    const imageUrl = await uploadFile(file, 'profile_images')
    if (imageUrl) {
      try {
        await axios.put(`${CONFIG.API_SERVER}/api/line_user_profiles/update/${userData.value.id}`, {
          ...userData.value,
          picture_url: imageUrl
        })

        userData.value = {
          ...userData.value,
          picture_url: imageUrl
        }

        await Swal.fire({
          icon: 'success',
          title: 'อัพเดทรูปโปรไฟล์สำเร็จ'
        })
      } catch (err) {
        console.error('Failed to update profile image:', err)
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถอัพเดทรูปโปรไฟล์ได้'
        })
      }
    }
  } catch (error) {
    console.error('Failed to upload image:', error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.message || 'ไม่สามารถอัพโหลดรูปได้'
    })
  } finally {
    isUploadingProfile.value = false // เสร็จสิ้นการอัพโหลด
  }
}
// เพิ่มฟังก์ชันสำหรับ generate hash
function generateHash(text) {
  return MD5(text).toString()
}
// เพิ่ม ref สำหรับฟอร์ม reset password
const showPasswordForm = ref(false)
const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

// เพิ่มฟังก์ชัน reset password
const handleResetPassword = async () => {
  // ตรวจสอบ password ใหม่ตรงกัน
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    Swal.fire({
      icon: 'error',
      title: 'รหัสผ่านไม่ตรงกัน',
      text: 'กรุณากรอกรหัสผ่านใหม่ให้ตรงกัน'
    })
    return
  }

  try {
    // เข้ารหัส password ก่อนส่งไป API
    const hashedCurrentPassword = generateHash(passwordForm.value.current_password)
    const hashedNewPassword = generateHash(passwordForm.value.new_password)

    await axios.put(
      `${CONFIG.API_SERVER}/api/line_user_profiles/reset-password/${userData.value.id}`,
      {
        current_password: hashedCurrentPassword,
        new_password: hashedNewPassword
      }
    )

    await Swal.fire({
      icon: 'success',
      title: 'เปลี่ยนรหัสผ่านสำเร็จ',
      text: 'รหัสผ่านของคุณถูกอัพเดทเรียบร้อยแล้ว'
    })

    // รีเซ็ตฟอร์มและปิด
    passwordForm.value = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
    showPasswordForm.value = false
  } catch (err) {
    console.error('Failed to reset password', err)
    const errorMessage =
      err.response?.data?.message === 'Current password is incorrect'
        ? 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
        : 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง'

    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: errorMessage
    })
  }
}

// เพิ่มฟังก์ชันสำหรับจัดการการเพิ่ม credentials
const handleAddCredentials = async () => {
  // ตรวจสอบ password ตรงกัน
  if (credentialsForm.value.password !== credentialsForm.value.confirm_password) {
    Swal.fire({
      icon: 'error',
      title: 'รหัสผ่านไม่ตรงกัน',
      text: 'กรุณากรอกรหัสผ่านให้ตรงกัน'
    })
    return
  }

  try {
    // เข้ารหัส password ก่อนส่งไป API
    const hashedPassword = generateHash(credentialsForm.value.password)

    await axios.put(
      `${CONFIG.API_SERVER}/api/line_user_profiles/add-credentials/${userData.value.id}`,
      {
        username: credentialsForm.value.username,
        password: hashedPassword
      }
    )

    await Swal.fire({
      icon: 'success',
      title: 'เพิ่มบัญชีผู้ใช้สำเร็จ',
      text: 'คุณสามารถใช้ Username และ Password นี้ในการเข้าสู่ระบบได้'
    })

    // รีเซ็ตฟอร์มและปิด
    credentialsForm.value = {
      username: '',
      password: '',
      confirm_password: ''
    }
    showCredentialsForm.value = false

    // อัพเดตข้อมูล user
    await loadUserData()
  } catch (err) {
    console.error('Failed to add credentials', err)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: err.response?.data?.message || 'ไม่สามารถเพิ่มบัญชีผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง'
    })
  }
}

onMounted(() => {
  loadUserData().catch((err) => {
    console.error('Error in loadUserData:', err)
    error.value = 'เกิดข้อผิดพลาดที่ไม่คาดคิด'
    loading.value = false
  })
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- Navbar -->
    <div class="navbar bg-base-100 shadow-lg">
      <div class="flex-1">
        <a class="btn btn-ghost normal-case text-xl">Giraffe Container</a>
      </div>
      <div class="flex-none">
        <button class="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block w-5 h-5 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-grow container mx-auto px-4 py-8">
      <div class="card bg-base-100 shadow-xl max-w-4xl mx-auto">
        <div class="card-body">
          <div v-if="loading" class="text-center">
            <span class="loading loading-spinner loading-lg"></span>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
          <div v-else-if="error" class="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ error }}</span>
          </div>
          <template v-else-if="userData">
            <!-- Edit Profile Form -->
            <div v-if="showEditForm" class="form-control">
              <h3 class="text-center font-bold mb-4">แก้ไขข้อมูลส่วนตัว</h3>
              <!-- Avatar section -->
              <div class="avatar flex justify-center mb-4">
                <div
                  class="w-24 lg:w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
                >
                  <img
                    :src="userData.picture_url"
                    :alt="`รูปโปรไฟล์ของ ${userData.display_name}`"
                  />
                </div>
              </div>
              <div v-if="!userData.username" class="mt-4">
                <button
                  @click="showCredentialsForm = true"
                  class="btn btn-outline btn-primary w-full"
                >
                  <i class="fas fa-user-plus mr-2"></i> ตั้งค่าเข้าสู่ระบบสำหรับคอมพิวเตอร์
                </button>
              </div>
              <form @submit.prevent="handleSaveProfile">
                <!-- Form fields -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">ชื่อที่แสดง</span>
                  </label>
                  <input
                    type="text"
                    v-model="editForm.display_name"
                    class="input input-bordered"
                    required
                  />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">ชื่อ-นามสกุล</span>
                  </label>
                  <input
                    type="text"
                    v-model="editForm.name"
                    class="input input-bordered"
                    required
                  />
                </div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">ชื่อบริษัท</span>
                  </label>
                  <input
                    type="text"
                    v-model="editForm.company_name"
                    class="input input-bordered"
                    required
                  />
                </div>

                <!-- Action buttons -->
                <div class="flex flex-col gap-4 mt-6">
                  <!-- Main action buttons -->
                  <div class="flex gap-2">
                    <button type="submit" class="btn btn-primary flex-1">บันทึก</button>
                    <button
                      type="button"
                      @click="showEditForm = false"
                      class="btn btn-ghost flex-1"
                    >
                      ยกเลิก
                    </button>
                  </div>

                  <!-- Divider -->
                  <div class="divider my-2">หรือ</div>

                  <!-- Reset password button -->
                  <button
                    type="button"
                    @click="showPasswordForm = true"
                    class="btn btn-outline btn-warning w-full"
                  >
                    <i class="fas fa-key mr-2"></i> เปลี่ยนรหัสผ่าน
                  </button>
                </div>
              </form>
            </div>

            <!-- Profile View -->
            <div
              v-else-if="!showReturnForm && !showReceiveForm"
              class="lg:flex lg:items-start lg:space-x-8"
            >
              <div class="flex flex-col items-center lg:w-1/3">
                <div class="avatar">
                  <div
                    class="w-24 lg:w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 relative group"
                  >
                    <img
                      :src="userData.picture_url"
                      :alt="`รูปโปรไฟล์ของ ${userData.display_name}`"
                      class="w-full h-full object-cover"
                    />
                    <!-- เพิ่ม input file และ overlay -->
                    <input
                      type="file"
                      id="profileImageInput"
                      @change="handleProfileImageUpload"
                      accept="image/*"
                      class="hidden"
                      :disabled="isUploadingProfile"
                    />
                    <label
                      for="profileImageInput"
                      class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer rounded-full"
                      :class="{ 'cursor-not-allowed': isUploadingProfile }"
                    >
                      <div v-if="isUploadingProfile" class="flex flex-col items-center">
                        <span class="loading loading-spinner loading-md mb-2"></span>
                        <span>กำลังอัพโหลด...</span>
                      </div>
                      <span v-else>เปลี่ยนรูป</span>
                    </label>
                  </div>
                </div>
                <h2 class="card-title mt-4">{{ userData.display_name }}</h2>
                <div class="badge badge-success mt-2">{{ userType }}</div>
              </div>
              <div class="lg:w-2/3 mt-6 lg:mt-0">
                <div class="space-y-2">
                  <p><strong>ชื่อ:</strong> {{ userData.name }}</p>
                  <p><strong>บริษัท:</strong> {{ userData.company_name }}</p>
                  <p>
                    <strong>วันที่ลงทะเบียน:</strong>
                    {{ new Date(userData.created_at).toLocaleDateString('th-TH') }}
                  </p>
                </div>
                <div class="divider"></div>
                <div class="flex flex-col gap-4">
                  <button @click="handleEditProfile" class="btn btn-outline btn-info">
                    แก้ไขข้อมูลส่วนตัว
                  </button>
                  <div class="flex flex-row justify-between gap-x-4">
                    <button @click="handleReturnContainer" class="btn btn-info flex-1">
                      ขอคืนตู้
                    </button>
                    <button @click="handleReceiveContainer" class="btn btn-secondary flex-1">
                      ขอรับตู้
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <ContainerReturnForm
              v-if="showReturnForm"
              :line-user-id="userData.line_user_id"
              @submit="handleReturnFormSubmit"
              @cancel="handleReturnFormCancel"
            />

            <ContainerReceiveForm
              v-if="showReceiveForm"
              :line-user-id="userData.line_user_id"
              @submit="handleReceiveFormSubmit"
              @cancel="handleReceiveFormCancel"
            />

            <div
              v-if="!showReturnForm && !showReceiveForm && !showEditForm"
              role="tablist"
              class="tabs tabs-boxed mt-10"
            >
              <a
                role="tab"
                class="tab"
                :class="{ 'tab-active': activeTab === 'requestReturn' }"
                @click="activeTab = 'requestReturn'"
              >
                ประวัติการคืนตู้
              </a>
              <a
                role="tab"
                class="tab"
                :class="{ 'tab-active': activeTab === 'history' }"
                @click="activeTab = 'history'"
              >
                ประวัติการขอรับตู้
              </a>
            </div>

            <div
              v-if="
                !showReturnForm &&
                !showReceiveForm &&
                !showEditForm &&
                activeTab === 'requestReturn'
              "
            >
              <ContainerReturnsTable :line-user-id="userData.line_user_id" />
            </div>
            <div
              v-if="!showReturnForm && !showReceiveForm && !showEditForm && activeTab === 'history'"
            >
              <ContainerReceivesTable :line-user-id="userData.line_user_id" />
            </div>
          </template>
        </div>
      </div>
    </div>
    <!-- เพิ่ม Modal สำหรับ Reset Password -->
    <input type="checkbox" id="password_modal" class="modal-toggle" v-model="showPasswordForm" />
    <div class="modal" role="dialog">
      <div class="modal-box">
        <h3 class="text-lg font-bold">เปลี่ยนรหัสผ่าน</h3>
        <form @submit.prevent="handleResetPassword" class="space-y-4 mt-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">รหัสผ่านปัจจุบัน</span>
            </label>
            <input
              type="password"
              v-model="passwordForm.current_password"
              required
              class="input input-bordered"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">รหัสผ่านใหม่</span>
            </label>
            <input
              type="password"
              v-model="passwordForm.new_password"
              required
              class="input input-bordered"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">ยืนยันรหัสผ่านใหม่</span>
            </label>
            <input
              type="password"
              v-model="passwordForm.confirm_password"
              required
              class="input input-bordered"
            />
          </div>
          <div class="modal-action">
            <button type="submit" class="btn btn-primary">บันทึก</button>
            <button type="button" @click="showPasswordForm = false" class="btn">ยกเลิก</button>
          </div>
        </form>
      </div>
      <label class="modal-backdrop" for="password_modal" @click="showPasswordForm = false"
        >Close</label
      >
    </div>

    <!-- เพิ่ม Modal สำหรับฟอร์มเพิ่ม credentials -->
    <input
      type="checkbox"
      id="credentials_modal"
      class="modal-toggle"
      v-model="showCredentialsForm"
    />
    <div class="modal" role="dialog">
      <div class="modal-box">
        <h3 class="text-lg font-bold">เพิ่มบัญชีผู้ใช้</h3>
        <form @submit.prevent="handleAddCredentials" class="space-y-4 mt-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">ชื่อผู้ใช้ (Username)</span>
            </label>
            <input
              type="text"
              v-model="credentialsForm.username"
              required
              class="input input-bordered"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">รหัสผ่าน</span>
            </label>
            <input
              type="password"
              v-model="credentialsForm.password"
              required
              class="input input-bordered"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">ยืนยันรหัสผ่าน</span>
            </label>
            <input
              type="password"
              v-model="credentialsForm.confirm_password"
              required
              class="input input-bordered"
            />
          </div>
          <div class="modal-action">
            <button type="submit" class="btn btn-primary">บันทึก</button>
            <button type="button" @click="showCredentialsForm = false" class="btn">ยกเลิก</button>
          </div>
        </form>
      </div>
      <label class="modal-backdrop" for="credentials_modal" @click="showCredentialsForm = false">
        Close
      </label>
    </div>

    <!-- Footer -->
    <footer class="footer footer-center p-4 bg-base-300 text-base-content">
      <div>
        <p>Copyright © {{ new Date().getFullYear() }} - All rights reserved by JSolutionsNext</p>
      </div>
    </footer>
  </div>
</template>
