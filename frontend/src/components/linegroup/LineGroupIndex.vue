<template>
  <div class="container mx-auto px-4">
    <!-- Tab Navigation -->
    <div class="tabs tabs-boxed mb-6">
      <a class="tab" :class="{ 'tab-active': activeTab === 'users' }" @click="activeTab = 'users'">
        รายการผู้ใช้งานภายนอก
      </a>
      <a
        class="tab"
        :class="{ 'tab-active': activeTab === 'groups' }"
        @click="activeTab = 'groups'"
      >
        กลุ่มผู้ใช้งานภายนอก
      </a>
    </div>

    <!-- Groups Tab -->
    <div v-if="activeTab === 'groups'">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">กลุ่มผู้ใช้งานภายนอก</h1>
        <button @click="openCreateModal" class="btn btn-primary">
          <i class="fas fa-plus mr-2"></i> สร้างกลุ่มใหม่
        </button>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <div
          v-for="group in groups"
          :key="group.group_id"
          class="bg-white shadow-xl rounded-lg overflow-hidden"
        >
          <div class="p-4">
            <div class="flex items-center mb-4">
              <img
                :src="group.group_image"
                :alt="group.group_name"
                class="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <h2 class="text-xl font-semibold">{{ group.group_name }}</h2>
                <p class="text-sm text-gray-500">สมาชิก: {{ group.members.length }}</p>
              </div>
            </div>
            <p class="text-gray-600 mb-4">{{ group.notes }}</p>

            <!-- Member Display -->
            <div class="mb-4">
              <h3 class="text-lg font-semibold mb-2">สมาชิก</h3>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="member in group.members"
                  :key="member.line_user_id"
                  class="flex items-center bg-gray-100 rounded-full px-3 py-1"
                >
                  <img
                    :src="member.picture_url || defaultAvatar"
                    :alt="member.display_name"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <span class="ml-2 text-sm">{{ member.display_name }}</span>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-2">
              <button @click="editGroup(group)" class="btn btn-outline btn-primary btn-sm">
                <i class="fas fa-edit mr-1"></i> แก้ไข
              </button>
              <button @click="deleteGroup(group.group_id)" class="btn btn-outline btn-error btn-sm">
                <i class="fas fa-trash-alt mr-1"></i> ลบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Tab with Row Layout -->
    <div v-if="activeTab === 'users'" class="px-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">รายการผู้ใช้งานภายนอก</h1>
      </div>

      <!-- Row-based Layout -->
      <div class="space-y-4">
        <div
          v-for="user in users"
          :key="user.id"
          class="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-200 hover:shadow-xl border border-gray-100"
        >
          <div class="p-4 flex items-center justify-between">
            <!-- User Info Section -->
            <div class="flex items-center space-x-4 flex-1">
              <!-- Avatar -->
              <div class="relative">
                <img
                  :src="user.picture_url || defaultAvatar"
                  :alt="user.display_name"
                  class="w-16 h-16 rounded-full object-cover ring-2 ring-offset-2"
                  :class="user.is_active ? 'ring-green-400' : 'ring-red-400'"
                />
              </div>

              <!-- User Details -->
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <h2 class="text-xl font-semibold text-gray-900">{{ user.display_name }}</h2>
                  <!-- Status Badge -->
                  <span
                    class="px-2.5 py-0.5 rounded-full text-sm font-medium"
                    :class="
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    "
                  >
                    {{ user.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                  </span>
                </div>

                <div class="flex items-center mt-1 space-x-2">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium"
                    :class="
                      user.user_type === 'Client'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    "
                  >
                    {{ user.user_type === 'Client' ? 'ลูกค้า' : 'คนขับรถ' }}
                  </span>
                  <span
                    v-if="user.username"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                  >
                    <i class="fas fa-user-circle mr-1"></i> มีบัญชี web
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-4 mt-2">
                  <div class="flex items-center text-gray-700">
                    <i class="fas fa-user-tag w-5 text-gray-400"></i>
                    <span class="ml-2">{{ user.name }}</span>
                  </div>
                  <div class="flex items-center text-gray-700">
                    <i class="fas fa-building w-5 text-gray-400"></i>
                    <span class="ml-2">{{ user.company_name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-3">
              <button @click="openUserDetailsModal(user)" class="btn btn-info btn-sm">
                <i class="fas fa-eye mr-1.5"></i>
                ดูข้อมูล
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <div v-if="showUserDetailsModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <div class="flex justify-between items-start mb-6">
          <h3 class="font-bold text-lg">ข้อมูลผู้ใช้งาน</h3>
          <button @click="closeUserDetailsModal" class="btn btn-sm btn-circle">✕</button>
        </div>

        <div v-if="selectedUser" class="space-y-6">
          <!-- User Profile Section -->
          <div class="flex items-start space-x-4">
            <img
              :src="selectedUser.picture_url || defaultAvatar"
              :alt="selectedUser.display_name"
              class="w-24 h-24 rounded-full object-cover"
            />
            <div class="flex-1">
              <h4 class="text-xl font-semibold">{{ selectedUser.display_name }}</h4>
              <div class="mt-2 space-y-2">
                <p class="text-sm">
                  <strong>ประเภท:</strong>
                  <span
                    class="badge"
                    :class="
                      selectedUser.user_type === 'Client' ? 'badge-primary' : 'badge-secondary'
                    "
                  >
                    {{ selectedUser.user_type === 'Client' ? 'ลูกค้า' : 'คนขับรถ' }}
                  </span>
                </p>
                <p class="text-sm">
                  <strong>สถานะ:</strong>
                  <span
                    class="badge"
                    :class="selectedUser.is_active ? 'badge-success' : 'badge-error'"
                  >
                    {{ selectedUser.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- User Details -->
          <div class="grid grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg">
            <div>
              <p><strong>ชื่อ-นามสกุล:</strong></p>
              <p>{{ selectedUser.name }}</p>
            </div>
            <div>
              <p><strong>บริษัท:</strong></p>
              <p>{{ selectedUser.company_name }}</p>
            </div>
            <div>
              <p><strong>Username:</strong></p>
              <p>{{ selectedUser.username || '-' }}</p>
            </div>
            <div>
              <p><strong>วันที่ลงทะเบียน:</strong></p>
              <p>{{ new Date(selectedUser.created_at).toLocaleDateString('th-TH') }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col gap-3">
            <div class="flex justify-between">
              <button
                v-if="selectedUser.username"
                @click="openResetPasswordModal"
                class="btn btn-warning"
              >
                <i class="fas fa-key mr-2"></i> รีเซ็ตรหัสผ่าน
              </button>
              <button
                @click="toggleUserStatus"
                class="btn"
                :class="selectedUser.is_active ? 'btn-error' : 'btn-success'"
              >
                <i
                  class="fas"
                  :class="selectedUser.is_active ? 'fa-user-slash' : 'fa-user-check'"
                ></i>
                {{ selectedUser.is_active ? 'ระงับการใช้งาน' : 'เปิดใช้งาน' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeUserDetailsModal"></div>
    </div>

    <!-- Reset Password Modal -->
    <!-- Reset Password Modal -->
    <div v-if="showResetPasswordModal" class="modal modal-open">
      <div class="modal-box">
        <div class="flex justify-between items-start mb-6">
          <h3 class="font-bold text-lg">รีเซ็ตรหัสผ่าน - {{ selectedUser?.display_name }}</h3>
          <button @click="closeResetPasswordModal" class="btn btn-sm btn-circle">✕</button>
        </div>
        <form @submit.prevent="handleAdminResetPassword">
          <div class="form-control">
            <label class="label">
              <span class="label-text">รหัสผ่านใหม่</span>
            </label>
            <input v-model="newPassword" type="password" class="input input-bordered" required />
          </div>
          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text">ยืนยันรหัสผ่านใหม่</span>
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              class="input input-bordered"
              required
            />
          </div>
          <div class="modal-action">
            <button type="submit" class="btn btn-primary">บันทึก</button>
            <button type="button" @click="closeResetPasswordModal" class="btn">ยกเลิก</button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop" @click="closeResetPasswordModal"></div>
    </div>

    <!-- Group Edit Modal -->
    <div v-if="groupToEdit" class="modal modal-open">
      <div class="modal-box">
        <LineGroupManagement
          :groupToEdit="groupToEdit"
          @group-updated="handleGroupUpdated"
          @cancel="cancelEdit"
        />
      </div>
      <div class="modal-backdrop" @click="cancelEdit"></div>
    </div>

    <!-- Create Group Modal -->
    <div v-if="showCreateModal" class="modal modal-open">
      <div class="modal-box">
        <LineGroupManagement @group-created="handleGroupCreated" @cancel="closeCreateModal" />
      </div>
      <div class="modal-backdrop" @click="closeCreateModal"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import CONFIG from '../../config/config'
import LineGroupManagement from './LineGroupManagement.vue'
import Swal from 'sweetalert2'
import MD5 from 'crypto-js/md5'

// State Management
const groups = ref([])
const users = ref([])
const showCreateModal = ref(false)
const groupToEdit = ref(null)
const activeTab = ref('users')
const defaultAvatar =
  'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/default_avatar_utg.png'

// User Details Modal States
const showUserDetailsModal = ref(false)
const selectedUser = ref(null)

// Reset Password States
const showResetPasswordModal = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')

// Group Management Methods
const fetchGroups = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/line-groups`)
    groups.value = response.data
  } catch (error) {
    console.error('Error fetching groups:', error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถโหลดข้อมูลกลุ่มได้'
    })
  }
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const handleGroupCreated = async (newGroup) => {
  await fetchGroups()
  closeCreateModal()
  Swal.fire({
    icon: 'success',
    title: 'สำเร็จ',
    text: 'สร้างกลุ่มใหม่เรียบร้อยแล้ว'
  })
}

const editGroup = (group) => {
  groupToEdit.value = group
}

const cancelEdit = () => {
  groupToEdit.value = null
}

const handleGroupUpdated = async () => {
  await fetchGroups()
  groupToEdit.value = null
  Swal.fire({
    icon: 'success',
    title: 'สำเร็จ',
    text: 'อัปเดตกลุ่มเรียบร้อยแล้ว'
  })
}

const deleteGroup = async (groupId) => {
  const result = await Swal.fire({
    title: 'คุณแน่ใจหรือไม่?',
    text: 'การลบกลุ่มนี้ไม่สามารถยกเลิกได้!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ใช่, ลบเลย!',
    cancelButtonText: 'ยกเลิก'
  })

  if (result.isConfirmed) {
    try {
      await axios.delete(`${CONFIG.API_SERVER}/api/line-groups/delete/${groupId}`)
      await fetchGroups()
      Swal.fire({
        icon: 'success',
        title: 'ลบแล้ว!',
        text: 'กลุ่มถูกลบเรียบร้อยแล้ว'
      })
    } catch (error) {
      console.error('Error deleting group:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถลบกลุ่มได้'
      })
    }
  }
}

// User Management Methods
const fetchUsers = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/line_user_profiles/get`, {
      params: { user_type: 'Client' }
    })
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้'
    })
  }
}

const openUserDetailsModal = (user) => {
  selectedUser.value = user
  showUserDetailsModal.value = true
}

const closeUserDetailsModal = () => {
  showUserDetailsModal.value = false
  selectedUser.value = null
}

const openResetPasswordModal = () => {
  showResetPasswordModal.value = true
  newPassword.value = ''
  confirmPassword.value = ''
}

const closeResetPasswordModal = () => {
  showResetPasswordModal.value = false
  newPassword.value = ''
  confirmPassword.value = ''
}

const handleAdminResetPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    Swal.fire({
      icon: 'error',
      title: 'รหัสผ่านไม่ตรงกัน',
      text: 'กรุณากรอกรหัสผ่านให้ตรงกัน'
    })
    return
  }

  try {
    const hashedPassword = MD5(newPassword.value).toString()
    await axios.put(
      `${CONFIG.API_SERVER}/api/line_user_profiles/admin-reset-password/${selectedUser.value.id}`,
      {
        new_password: hashedPassword
      }
    )

    Swal.fire({
      icon: 'success',
      title: 'สำเร็จ',
      text: 'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว'
    })
    closeResetPasswordModal()
  } catch (error) {
    console.error('Error resetting password:', error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถรีเซ็ตรหัสผ่านได้'
    })
  }
}

const toggleUserStatus = async () => {
  try {
    const newStatus = !selectedUser.value.is_active
    const actionText = newStatus ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'

    const result = await Swal.fire({
      title: `ยืนยันการ${actionText}`,
      text: `คุณต้องการ${actionText}ผู้ใช้ "${selectedUser.value.display_name}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus ? '#3085d6' : '#d33',
      cancelButtonColor: '#d33',
      confirmButtonText: `ยืนยัน${actionText}`,
      cancelButtonText: 'ยกเลิก'
    })

    if (result.isConfirmed) {
      await axios.put(
        `${CONFIG.API_SERVER}/api/line_user_profiles/update/${selectedUser.value.id}`,
        {
          is_active: newStatus
        }
      )

      // Update local state
      selectedUser.value.is_active = newStatus
      const userIndex = users.value.findIndex((u) => u.id === selectedUser.value.id)
      if (userIndex !== -1) {
        users.value[userIndex].is_active = newStatus
      }

      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: `${actionText}ผู้ใช้เรียบร้อยแล้ว`
      })
    }
  } catch (error) {
    console.error('Error toggling user status:', error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: `ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้`
    })
  }
}

// Lifecycle Hooks
onMounted(() => {
  fetchGroups()
  fetchUsers()
})
</script>
