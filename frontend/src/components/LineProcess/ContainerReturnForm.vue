<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import CONFIG from '../../config/config'
import { uploadFile, isUploading } from '../../service/imageUpload'
import Swal from 'sweetalert2'
const props = defineProps({
  lineUserId: {
    type: String,
    required: true
  }
})

const formData = ref({
  line_user_id: props.lineUserId,
  agent: '',
  bl: '',
  containers: [
    {
      containerNumber: '',
      containerSize: '',
      imageUrls: []
    }
  ],
  returnDocumentUrls: [],
  additionalNotes: ''
})

const containerSizes = CONFIG.CONTAINE_SIZE
const agents = ref([])
const isSubmitting = ref(false)

const emit = defineEmits(['submit', 'cancel'])

// Computed property for container summary
const containerSummary = computed(() => {
  const summary = {
    total: formData.value.containers.length,
    sizes: {}
  }

  formData.value.containers.forEach((container) => {
    if (container.containerSize) {
      summary.sizes[container.containerSize] = (summary.sizes[container.containerSize] || 0) + 1
    }
  })

  return summary
})

const loadAgents = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/agents/get`)
    agents.value = response.data
  } catch (error) {
    console.error('Failed to load agents:', error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถโหลดข้อมูล Agent ได้'
    })
  }
}

const handleContainerImageUpload = async (event, containerIndex) => {
  const files = Array.from(event.target.files)
  for (const file of files) {
    await uploadFile(file, 'image', containerIndex, formData.value)
  }
}

const handleReturnDocumentUpload = async (event) => {
  const files = Array.from(event.target.files)
  for (const file of files) {
    await uploadFile(file, 'document', null, formData.value)
  }
}

const handleRemoveFile = (type, index, containerIndex = null) => {
  if (type === 'image' && containerIndex !== null) {
    formData.value.containers[containerIndex].imageUrls.splice(index, 1)
  } else if (type === 'document') {
    formData.value.returnDocumentUrls.splice(index, 1)
  }
}

const handleContainerNumberInput = (index) => {
  formData.value.containers[index].containerNumber = formData.value.containers[
    index
  ].containerNumber
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
}

const addContainer = () => {
  formData.value.containers.push({
    containerNumber: '',
    containerSize: '',
    imageUrls: []
  })
}

const removeContainer = (index) => {
  formData.value.containers.splice(index, 1)
}

const handleSubmit = async () => {
  /*
    if (formData.value.containers.some(container => container.imageUrls.length === 0)) {
        Swal.fire({
            icon: 'warning',
            title: 'กรุณาอัปโหลดรูปตู้ทุกตู้',
            confirmButtonText: 'ตกลง'
        });
        return;
    }
    if (formData.value.returnDocumentUrls.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'กรุณาอัปโหลดใบคืนตู้',
            confirmButtonText: 'ตกลง'
        });
        return;
    }
        */

  isSubmitting.value = true

  try {
    const response = await axios.post(
      `${CONFIG.API_SERVER}/api/container-returns/add`,
      formData.value
    )

    if (response.data && response.data.message) {
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'บันทึกรายการขอคืนตู้แล้ว',
        confirmButtonText: 'ตกลง'
      })

      // Emit the submit event with the response data
      emit('submit', response.data)
    }
  } catch (error) {
    console.error('Failed to submit container return form:', error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
      confirmButtonText: 'ตกลง'
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const isImageFile = (url) => {
  return /\.(jpg|jpeg|png|gif)$/i.test(url)
}

const getFileIconClass = (url) => {
  if (/\.pdf$/i.test(url)) return 'fas fa-file-pdf text-red-500'
  if (/\.(xls|xlsx)$/i.test(url)) return 'fas fa-file-excel text-green-500'
  if (/\.(doc|docx)$/i.test(url)) return 'fas fa-file-word text-blue-500'
  if (isImageFile(url)) return 'fas fa-file-image text-purple-500'
  return 'fas fa-file text-gray-500'
}

const getFileName = (url) => {
  return url.split('/').pop()
}

onMounted(() => {
  loadAgents()
})
</script>

<template>
  <div class="container-return-form">
    <h2 class="text-2xl font-bold mb-4">ขอคืนตู้</h2>

    <!-- Container Summary -->
    <div class="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 class="text-lg font-semibold mb-2">สรุปจำนวนตู้</h3>
      <p>จำนวนตู้ทั้งหมด: {{ containerSummary.total }}</p>
      <ul>
        <li v-for="(count, size) in containerSummary.sizes" :key="size">
          {{ size }}: {{ count }} ตู้
        </li>
      </ul>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="flex items-center">
        <label for="agent" class="w-1/4">Agent: <span class="text-red-500">*</span></label>
        <select id="agent" v-model="formData.agent" required class="select select-bordered w-3/4">
          <option value="" disabled>เลือก Agent</option>
          <option v-for="agent in agents" :key="agent.agent_id" :value="agent.agent_id">
            {{ agent.company_name }}
          </option>
        </select>
      </div>

      <div class="flex items-center">
        <label for="bl" class="w-1/4">BL:</label>
        <input id="bl" v-model="formData.bl" type="text" class="input input-bordered w-3/4" />
      </div>

      <div class="flex items-center">
        <label class="w-1/4">ใบคืนตู้: </label>
        <div class="w-3/4">
          <input
            type="file"
            id="returnDocumentInput"
            @change="handleReturnDocumentUpload"
            accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
            multiple
            class="hidden"
          />
          <label for="returnDocumentInput" class="btn btn-outline cursor-pointer">
            <span v-if="!isUploading">เลือกใบคืนตู้</span>
            <span v-else
              ><span class="loading loading-spinner loading-sm"></span>กำลังอัปโหลด...</span
            >
          </label>
          <div v-if="formData.returnDocumentUrls.length > 0" class="mt-2 flex flex-wrap gap-2">
            <div v-for="(url, index) in formData.returnDocumentUrls" :key="index" class="relative">
              <div v-if="isImageFile(url)" class="w-24 h-24 rounded overflow-hidden">
                <img
                  :src="url"
                  :alt="`Return Document ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="w-24 h-24 bg-gray-100 rounded flex flex-col items-center justify-center p-2"
              >
                <i :class="getFileIconClass(url)" class="text-3xl mb-2"></i>
                <span class="text-xs text-center truncate w-full">{{ getFileName(url) }}</span>
              </div>
              <button
                type="button"
                @click="() => handleRemoveFile('document', index)"
                class="absolute -top-2 -right-2 bg-white text-red rounded-full p-1 hover:text-red-600 transition-colors"
              >
                <i class="fas fa-times-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Container Information -->
      <div
        v-for="(container, index) in formData.containers"
        :key="index"
        class="border p-4 rounded-lg mb-4 bg-gray-100"
      >
        <h3 class="text-lg font-semibold mb-2">ข้อมูลตู้ที่ {{ index + 1 }}</h3>
        <div class="flex items-center mb-2">
          <label :for="'containerNumber' + index" class="w-1/4"
            >เบอร์ตู้: <span class="text-red-500">*</span></label
          >
          <input
            :id="'containerNumber' + index"
            v-model="container.containerNumber"
            @input="handleContainerNumberInput(index)"
            type="text"
            required
            class="input input-bordered w-3/4"
          />
        </div>
        <div class="flex items-center mb-2">
          <label :for="'containerSize' + index" class="w-1/4">ขนาดตู้:</label>
          <select
            :id="'containerSize' + index"
            v-model="container.containerSize"
            required
            class="select select-bordered w-3/4"
          >
            <option value="" disabled>เลือกขนาดตู้</option>
            <option v-for="size in containerSizes" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>
        <div class="flex items-center mb-2">
          <label class="w-1/4">รูปตู้:</label>
          <div class="w-3/4">
            <input
              type="file"
              :id="'containerImageInput' + index"
              @change="(e) => handleContainerImageUpload(e, index)"
              accept="image/*"
              multiple
              class="hidden"
            />
            <label :for="'containerImageInput' + index" class="btn btn-outline cursor-pointer">
              <span v-if="!isUploading">เลือกรูปตู้</span>
              <span v-else
                ><span class="loading loading-spinner loading-sm"></span>กำลังอัปโหลด...</span
              >
            </label>
            <div v-if="container.imageUrls.length > 0" class="mt-2 flex flex-wrap gap-2">
              <div v-for="(url, imgIndex) in container.imageUrls" :key="imgIndex" class="relative">
                <div class="avatar">
                  <div class="w-24 rounded">
                    <img :src="url" :alt="`Container Image ${imgIndex + 1}`" />
                  </div>
                </div>
                <button
                  type="button"
                  @click="() => handleRemoveFile('image', imgIndex, index)"
                  class="absolute top-0 right-0 text-red-700 p-1 rounded-full text-xs"
                >
                  X
                </button>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          @click="removeContainer(index)"
          class="btn btn-error btn-sm mt-2"
          v-if="formData.containers.length > 1"
        >
          ลบตู้นี้
        </button>
      </div>

      <button type="button" @click="addContainer" class="btn btn-secondary btn-sm mb-4">
        เพิ่มตู้
      </button>

      <div class="flex items-start">
        <label for="additionalNotes" class="w-1/4 pt-2">เพิ่มเติม:</label>
        <textarea
          id="additionalNotes"
          v-model="formData.additionalNotes"
          rows="3"
          class="textarea textarea-bordered w-3/4"
          placeholder="กรอกข้อมูลเพิ่มเติม (ถ้ามี)"
        ></textarea>
      </div>

      <div class="flex justify-between mt-6">
        <button
          type="button"
          @click="handleCancel"
          class="btn btn-outline"
          :disabled="isSubmitting"
        >
          ยกเลิก
        </button>
        <button type="submit" class="btn btn-primary" :disabled="isUploading || isSubmitting">
          <span v-if="isSubmitting">กำลังส่งข้อมูล...</span>
          <span v-else>ส่งข้อมูล</span>
        </button>
      </div>
    </form>
  </div>
</template>
