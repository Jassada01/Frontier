<template>
  <div class="relative">
    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center z-50"
    >
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div class="bg-base-100 border-base-300 rounded-box p-6">
      <div class="flex items-center justify-center mb-4">
        <div class="text-center flex-grow">
          <!-- ตรงนี้เคยเป็น ternary (isEditMode ? ... : ...) เราเปลี่ยนเป็นข้อความเดียว -->
          <h2 class="text-2xl font-bold">สร้างข้อมูล EIR เป็นชุด</h2>
        </div>
      </div>

      <form @submit.prevent>
        <!-- กลุ่มที่ 1 -->
        <div
          class="relative box mb-6 p-6 border rounded-lg overflow-hidden"
          :class="{
            'bg-gradient-to-br from-green-50 via-green-100 to-green-50':
              equipmentInterchangeReceipt.entry_type === 'IN',
            'bg-gradient-to-br from-red-50 via-red-100 to-red-50':
              equipmentInterchangeReceipt.entry_type === 'OUT'
          }"
        >
          <!-- Status Badges Strip -->
          <div
            class="absolute top-0 right-0 left-0 p-2 flex justify-start gap-2 bg-white bg-opacity-40 backdrop-blur-sm"
          >
            <span
              v-if="equipmentInterchangeReceipt.entry_type"
              class="px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-sm flex items-center gap-2"
              :class="{
                'bg-gradient-to-r from-green-500 to-green-600':
                  equipmentInterchangeReceipt.entry_type === 'IN',
                'bg-gradient-to-r from-red-500 to-red-600':
                  equipmentInterchangeReceipt.entry_type === 'OUT'
              }"
            >
              <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              {{ equipmentInterchangeReceipt.entry_type }}
            </span>

            <span
              v-if="equipmentInterchangeReceipt.drop_container"
              class="px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-sm bg-gradient-to-r from-amber-500 to-amber-600 flex items-center gap-2"
            >
              <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              DROP
            </span>
          </div>

          <div class="flex w-full flex-wrap -mx-2 mt-8">
            <!-- EIR No. -->
            <div class="w-full md:w-1/4 px-2 mb-4">
              <label class="block mb-2 text-sm font-medium" for="receipt_no">
                EIR No. <span class="text-error font-bold">*</span>
              </label>
              <input
                v-model="equipmentInterchangeReceipt.receipt_no"
                class="input input-bordered w-full text-sm bg-white bg-opacity-70 backdrop-blur-sm"
                type="text"
                id="receipt_no"
                autocomplete="off"
                readonly
              />
            </div>

            <div class="w-full md:w-2/4 px-2 mb-4"></div>

            <!-- Date -->
            <div class="w-full md:w-1/4 px-2 mb-4">
              <label class="block mb-2 text-sm font-medium" for="date">
                วันที่/Date : <span class="text-error font-bold">*</span>
              </label>
              <flat-pickr
                v-model="equipmentInterchangeReceipt.date"
                class="input input-bordered w-full text-sm bg-white bg-opacity-70 backdrop-blur-sm"
                :config="config"
              />
            </div>

            <!-- Entry Type -->
            <div class="w-full md:w-1/4 px-2 mb-4">
              <label class="block mb-2 text-sm font-medium" for="entry_type">
                ประเภท/Type <span class="text-error font-bold">*</span>
              </label>
              <select
                v-model="equipmentInterchangeReceipt.entry_type"
                class="input input-bordered w-full text-sm bg-white bg-opacity-70 backdrop-blur-sm"
                id="entry_type"
              >
                <option value="" disabled selected>เลือกประเภท</option>
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
              </select>
            </div>

            <!-- Drop Container -->
            <div class="w-full px-4 md:w-1/6 md:px-10 mb-4">
              <div class="flex flex-col">
                <label class="block text-sm font-medium mb-2" for="drop_container">Drop</label>
                <div class="flex items-center gap-2">
                  <div class="form-control">
                    <input
                      v-model="equipmentInterchangeReceipt.drop_container"
                      class="toggle toggle-warning"
                      type="checkbox"
                      id="drop_container"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- กลุ่มที่ 2 -->
        <div class="box mb-6 p-4 border rounded-lg">
          <div class="flex flex-wrap -mx-2">
            <div class="w-full md:w-1/2 px-2 mb-4">
              <label class="block mb-2 text-sm" for="agent">
                ตัวแทน/Agent <span class="text-error font-bold">*</span>
              </label>
              <multiselect
                v-model="selectedAgent"
                :options="agents"
                label="label"
                track-by="agent_id"
                class="text-sm"
                placeholder="เลือกตัวแทน"
              />
            </div>
            <div class="w-full md:w-1/2 px-2 mb-4">
              <label class="block mb-2 text-sm" for="client">
                ลูกค้า/Shipper <span class="text-error font-bold">*</span>
              </label>
              <multiselect
                v-model="selectedClient"
                :options="clients"
                label="label"
                track-by="client_id"
                class="text-sm z-0"
                placeholder="เลือกลูกค้า"
              />
            </div>
            <div class="w-full md:w-1/2 px-2 mb-4">
              <label class="block mb-2 text-sm" for="yard">
                ลานเดิม/Original Yard <span class="text-error font-bold">*</span>
              </label>
              <multiselect
                v-model="selectedYard"
                :options="yards"
                label="label"
                track-by="yard_id"
                @update:modelValue="handleYardSelection"
                class="text-sm"
                placeholder="เลือกลานเดิม"
              >
              </multiselect>
            </div>
            <div class="w-full md:w-1/2 px-2 mb-4">
              <label class="block mb-2 text-sm" for="booking_bl">
                Booking/BL <span class="text-error font-bold">*</span>
              </label>
              <input
                v-model="equipmentInterchangeReceipt.booking_bl"
                class="input input-bordered w-full text-sm"
                type="text"
                id="booking_bl"
                autocomplete="off"
              />
            </div>
          </div>
        </div>

        <!-- กลุ่มที่ 3 (ปรับปรุง) -->
        <div
          v-if="equipmentInterchangeReceipt.entry_type !== ''"
          class="box mb-6 p-4 border rounded-lg"
        >
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">ข้อมูลตู้คอนเทนเนอร์</h3>
            <button @click="addContainer" class="btn btn-primary btn-sm">เพิ่มตู้</button>
          </div>

          <!-- ตารางข้อมูลตู้ -->
          <div class="overflow-x-auto">
            <table class="table table-compact w-full">
              <thead>
                <tr>
                  <th class="w-12">#</th>
                  <th>หมายเลขตู้ *</th>
                  <th>สีตู้</th>
                  <th>ขนาด/ประเภท *</th>
                  <th>หมายเลขซีล</th>
                  <th>เรือ</th>
                  <th>น้ำหนักตู้เปล่า</th>
                  <th>เที่ยวเรือ</th>
                  <th class="w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(container, index) in containers" :key="index" class="border-b">
                  <td class="py-2">{{ index + 1 }}</td>
                  <td class="py-2">
                    <input
                      v-model="container.container"
                      class="border rounded px-2 py-1 w-full"
                      @blur="validateContainerNumber(index)"
                      placeholder="ABCD1234567"
                    />
                  </td>
                  <!-- แก้ไขส่วนของ select สี -->
                  <td class="py-2">
                    <select
                      v-model="container.container_color"
                      class="border rounded px-2 py-1 w-full bg-white"
                    >
                      <option value="" disabled>เลือกสี</option>
                      <option
                        v-for="color in colors"
                        :key="color.name"
                        :value="color.name"
                        :style="{ backgroundColor: color.color }"
                      >
                        {{ color.name }}
                      </option>
                    </select>
                  </td>

                  <td class="py-2">
                    <select
                      v-model="container.size_type"
                      class="border rounded px-2 py-1 w-full bg-white"
                    >
                      <option value="" disabled>เลือกขนาด</option>
                      <option v-for="size in sizeOptions" :key="size" :value="size">
                        {{ size }}
                      </option>
                    </select>
                  </td>
                  <td class="py-2">
                    <input
                      v-model="container.seal_no"
                      class="border rounded px-2 py-1 w-full"
                      :placeholder="
                        equipmentInterchangeReceipt.entry_type === 'OUT' ? 'จำเป็น' : 'ถ้ามี'
                      "
                    />
                  </td>
                  <td class="py-2">
                    <input v-model="container.vessel" class="border rounded px-2 py-1 w-full" />
                  </td>
                  <td class="py-2">
                    <div class="flex items-center">
                      <input
                        v-model="container.tare"
                        type="text"
                        class="border rounded px-2 py-1 w-24"
                        :placeholder="
                          equipmentInterchangeReceipt.entry_type === 'OUT' ? 'จำเป็น' : 'ถ้ามี'
                        "
                      />
                      <span class="ml-1">Kg</span>
                    </div>
                  </td>
                  <td class="py-2">
                    <input v-model="container.voyage" class="border rounded px-2 py-1 w-full" />
                  </td>
                  <td class="py-2">
                    <button
                      @click="removeContainer(index)"
                      class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      :disabled="containers.length === 1"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ส่วนเลือกคนขับ -->
        <div class="box mb-6 p-4 rounded-lg">
          <div class="flex flex-wrap -mx-2">
            <div class="w-full md:w-1/3 px-2 mb-4">
              <label class="block mb-2 text-sm" for="driver"> เลือกคนขับ/Driver </label>
              <multiselect
                v-model="selectedDriver"
                :options="drivers"
                label="label"
                track-by="id"
                @update:modelValue="handleDriverSelection"
                class="text-sm"
                placeholder="เลือกคนขับ"
              >
                <template #option="{ option }">
                  <span>
                    <img
                      :src="option.driver_image_path"
                      class="inline-block w-6 h-6 rounded-full mr-2"
                    />
                    {{ option.label }}
                  </span>
                </template>
                <template #singleLabel="{ option }">
                  <span>
                    <img
                      :src="option.driver_image_path"
                      class="inline-block w-6 h-6 rounded-full mr-2"
                    />
                    {{ option.label }}
                  </span>
                </template>
              </multiselect>
            </div>
            <div class="w-full md:w-2/3 px-2 mb-4">
              <div v-if="selectedDriver" class="card card-side bg-base-100 shadow-sm">
                <figure>
                  <img :src="selectedDriver.driver_image_path" alt="Truck" class="w-64" />
                </figure>
                <div class="card-body">
                  <h2 class="card-title">
                    {{ equipmentInterchangeReceipt.driver_name }}
                  </h2>
                  <p>ทะเบียนรถบรรทุก: {{ equipmentInterchangeReceipt.truck_license }}</p>
                  <p>รหัสคนขับ: {{ selectedDriver.id }}</p>
                  <p>บริษัทขนส่ง: {{ selectedDriver.truck_company_name }}</p>
                  <p>เบอร์โทร: {{ equipmentInterchangeReceipt.tel }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- สภาพอุปกรณ์ -->
        <div class="box mb-6 p-4 border rounded-lg">
          <div class="flex flex-wrap -mx-2">
            <div class="w-full px-2 mb-4">
              <label class="block mb-2 text-base font-semibold" for="conditions">
                สภาพอุปกรณ์/Conditions
              </label>
              <div class="flex flex-wrap">
                <div
                  v-for="condition in conditions"
                  :key="condition.id"
                  class="w-1/2 md:w-1/3 mb-2"
                >
                  <div class="form-control">
                    <label class="cursor-pointer label justify-start">
                      <input
                        type="checkbox"
                        v-model="condition.checked"
                        @change="handleConditionChange(condition)"
                        class="checkbox checkbox-success"
                      />
                      <span class="label-text ms-3">
                        <span class="text-base">{{ condition.name_en }}</span>
                        <span class="text-xs text-slate-700">({{ condition.name_th }})</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div class="w-full md:w-1/2 px-2 mb-4">
                  <label class="block mb-2 text-sm" for="remark"> หมายเหตุ </label>
                  <textarea
                    v-model="equipmentInterchangeReceipt.remark"
                    class="textarea textarea-bordered w-full text-sm"
                    id="remark"
                    autocomplete="off"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- โซน -->
        <div class="box mb-6 p-4 border rounded-lg">
          <div class="flex flex-wrap -mx-2">
            <div class="w-full md:w-1/3 px-2 mb-4">
              <label class="block mb-2 text-base font-semibold" for="zone"> โซน </label>
              <multiselect
                v-model="selectedZone"
                :options="zones"
                label="label"
                track-by="zone_id"
                @update:modelValue="handleZoneSelection"
                class="text-sm"
                placeholder="เลือกโซน"
              >
              </multiselect>
            </div>
            <div v-if="selectedZone && selectedZone.path_map" class="w-full md:w-2/3 px-2 mb-4">
              <label class="block mb-2 text-sm" for="path_map"> แผนที่ </label>
              <img :src="selectedZone.path_map" alt="แผนที่" class="w-full h-auto rounded-md" />
            </div>
          </div>
        </div>

        <!-- ปุ่มสร้างข้อมูล -->
        <div class="flex items-center justify-end">
          <button class="btn btn-primary text-sm" type="button" @click="createReceipt()">
            สร้างข้อมูล
          </button>
        </div>
      </form>
    </div>

    <!-- Modal เลือกขนาดตู้ -->
    <dialog id="container_size_modal" class="modal">
      <form method="dialog" class="modal-box w-11/12 max-w-2xl">
        <h3 class="font-bold text-lg mb-4">เลือกขนาดตู้</h3>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="size in sizeOptions"
            :key="size"
            class="card bg-base-100 shadow-sm hover:shadow-md cursor-pointer"
            @click="selectContainerSize(size)"
          >
            <div class="card-body items-center text-center">
              <h2 class="card-title">{{ size }}</h2>
            </div>
          </div>
        </div>
      </form>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

    <!-- Modal เลือกตู้ที่ Available -->
    <dialog id="available_containers_modal" class="modal">
      <form method="dialog" class="modal-box w-11/12 max-w-5xl">
        <h3 class="font-bold text-lg mb-4">เลือกตู้ที่ว่าง</h3>
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th class="w-16">
                  <label>
                    <input
                      type="checkbox"
                      class="checkbox"
                      :checked="isAllSelected"
                      @change="toggleSelectAll"
                    />
                  </label>
                </th>
                <th>หมายเลขตู้</th>
                <th>สีตู้</th>
                <th>ขนาด/ประเภท</th>
                <th>ลาน</th>
                <th>วันที่นำเข้า</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="container in availableContainers" :key="container.id">
                <td>
                  <label>
                    <input type="checkbox" class="checkbox" v-model="container.selected" />
                  </label>
                </td>
                <td>{{ container.container }}</td>
                <td>{{ container.container_color }}</td>
                <td>{{ container.size_type }}</td>
                <td>{{ container.yard }}</td>
                <td>{{ formatDate(container.date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-action">
          <button
            class="btn btn-primary"
            :disabled="!hasSelectedContainers"
            @click="confirmContainerSelection"
          >
            เพิ่มตู้ที่เลือก ({{ selectedCount }} ตู้)
          </button>
          <button class="btn">ยกเลิก</button>
        </div>
      </form>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import Multiselect from 'vue-multiselect'
import CONFIG from '../../config/config'
import FlatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'

import moment from 'moment' // Import Moment.js
import { Thai } from 'flatpickr/dist/l10n/th.js'

// ----- ไม่มีการ defineProps({ isEditMode }) อีกต่อไป ----- //

const emit = defineEmits(['formSubmitted'])
const router = useRouter()

// ตัวแปรหลัก
const equipmentInterchangeReceipt = ref({
  entry_type: '',
  drop_container: false,
  receipt_no: 'เลขอัตโนมัติ',
  date: '',
  agent_id: null,
  agent_code: '',
  client_id: null,
  client_code: '',
  booking_bl: '',
  container: '',
  container_color: '', // เพิ่ม container_color
  size_type: '',
  seal_no: '',
  vessel: '',
  zone_id: null,
  zone: '',
  path_map: '',
  tare: 0.0,
  voyage: '',
  truck_license: '',
  driver_id: null,
  driver_name: '',
  truck_company: '',
  tel: '',
  yard_id: null,
  yard: '',
  status_id: 1,
  status_name_th: 'แบบร่าง',
  status_name_en: 'Draft',
  remark: '',
  request_detail_id: '',
  request_id: '',
  request_type: '',
  driver_sign: '',
  receiver_sign: '',
  create_user: null,
  create_user_name: '',
  update_user: null,
  update_user_name: '',
  conditions: [
    {
      condition_id: 1
    }
  ]
})

const loading = ref(true)

// ตัวเลือกต่างๆ
const agents = ref([])
const selectedAgent = ref(null)

const clients = ref([])
const selectedClient = ref(null)

const sizeOptions = CONFIG.CONTAINE_SIZE
const colors = CONFIG.CONTAINE_COLOR

const drivers = ref([])
const selectedDriver = ref(null)

const yards = ref([])
const selectedYard = ref(null)

const zones = ref([])
const selectedZone = ref(null)

const conditions = ref([])
const selectedColor = ref(null)

// เอาไว้รองรับ “Match” ข้อมูลจากการส่ง initialData (เช่นถ้าต้องการทำ OUT ต่อจาก IN)
const matching_eir_id = ref(null)

// เพิ่ม ref สำหรับเก็บรายการตู้ที่ว่าง
const availableContainers = ref([])
const selectedSize = ref('')

// เพิ่ม computed properties
const selectedCount = computed(() => {
  return availableContainers.value.filter((container) => container.selected).length
})

const hasSelectedContainers = computed(() => selectedCount.value > 0)

const isAllSelected = computed(() => {
  return (
    availableContainers.value.length > 0 &&
    availableContainers.value.every((container) => container.selected)
  )
})

// เพิ่ม watch effect สำหรับ entry_type
watch(
  () => equipmentInterchangeReceipt.value.entry_type,
  (newEntryType) => {
    if (newEntryType === 'IN') {
      containers.value = [
        {
          container: '',
          container_color: '',
          size_type: '',
          seal_no: '',
          vessel: '',
          tare: 0.0,
          voyage: ''
        }
      ]
    } else if (newEntryType === 'OUT') {
      containers.value = []
    }
  }
)

// เปลี่ยนโครงสร้างข้อมูล containers เป็น array
const containers = ref([
  {
    container: '',
    container_color: '',
    size_type: '',
    seal_no: '',
    vessel: '',
    tare: 0.0,
    voyage: '',
    matching_eir_id: null // เพิ่ม field matching_eir_id
  }
])

const addContainer = async () => {
  if (equipmentInterchangeReceipt.value.entry_type === 'OUT') {
    // เช็คว่ามีการเลือก Agent หรือไม่
    if (!selectedAgent.value) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเลือก Agent',
        text: 'โปรดเลือก Agent ก่อนเพิ่มข้อมูลตู้'
      })
      return
    }
    document.getElementById('container_size_modal').showModal()
  } else {
    containers.value.push({
      container: '',
      container_color: '',
      size_type: '',
      seal_no: '',
      vessel: '',
      tare: 0.0,
      voyage: '',
      matching_eir_id: null
    })
  }
}

// ฟังก์ชันลบรายการตู้
const removeContainer = (index) => {
  if (containers.value.length > 1) {
    containers.value.splice(index, 1)
  }
}

// ฟังก์ชันเมื่อเลือกขนาดตู้
const selectContainerSize = async (size) => {
  selectedSize.value = size
  document.getElementById('container_size_modal').close()

  try {
    // เรียก API เพื่อดึงข้อมูลตู้ที่ว่าง
    const response = await axios.get(`${CONFIG.API_SERVER}/api/EIR/getAvailableContainers`, {
      params: {
        agent_id: selectedAgent.value.agent_id,
        size_type: size
      }
    })

    if (response.data.success) {
      // เพิ่ม property selected ให้แต่ละตู้
      availableContainers.value = response.data.data.map((container) => ({
        ...container,
        selected: false
      }))
      document.getElementById('available_containers_modal').showModal()
    } else {
      Swal.fire('Error', 'ไม่พบข้อมูลตู้ที่ว่าง', 'error')
    }
  } catch (error) {
    console.error('Error fetching available containers:', error)
    Swal.fire('Error', 'เกิดข้อผิดพลาดในการดึงข้อมูลตู้', 'error')
  }
}

// ฟังก์ชันเลือก/ยกเลิกเลือกทั้งหมด
const toggleSelectAll = () => {
  const newValue = !isAllSelected.value
  availableContainers.value.forEach((container) => {
    container.selected = newValue
  })
}

// ฟังก์ชันยืนยันการเลือกตู้
const confirmContainerSelection = () => {
  const selectedContainers = availableContainers.value.filter((container) => container.selected)

  selectedContainers.forEach((container) => {
    containers.value.push({
      container: container.container,
      container_color: container.container_color,
      size_type: container.size_type,
      seal_no: '',
      vessel: '',
      tare: null,
      voyage: '',
      matching_eir_id: container.id // เพิ่ม matching_eir_id สำหรับแต่ละตู้
    })
  })

  document.getElementById('available_containers_modal').close()
}

// ฟังก์ชันจัดรูปแบบวันที่
const formatDate = (date) => {
  return moment(date).format('DD/MM/YYYY HH:mm')
}

// ตั้งค่าปฏิทิน FlatPickr
const config = {
  enableTime: true,
  dateFormat: 'Y-m-d H:i',
  defaultDate: new Date(),
  altInput: true,
  altFormat: 'j M Y H:i',
  locale: Thai, // กำหนด locale เป็นภาษาไทย
  thaiBuddhist: true
}

// ฟังก์ชันทั่วไป
const fetchUserData = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/users/status`, {
      withCredentials: true
    })
    equipmentInterchangeReceipt.value.create_user = response.data.user_id
    equipmentInterchangeReceipt.value.update_user = response.data.user_id
  } catch (error) {
    console.error('Error fetching user data', error)
  }
}

const fetchAgents = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/agents/get?active=true`)
    agents.value = response.data.map((agent) => ({
      agent_id: agent.agent_id,
      agent_code: agent.agent_code,
      label: `${agent.agent_code} - ${agent.company_name}`
    }))
  } catch (error) {
    handleError(error, 'Error fetching agents data')
  }
}

const fetchClients = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/client/get?active=true`)
    clients.value = response.data.map((client) => ({
      client_id: client.client_id,
      client_code: client.name,
      label: `${client.client_code} - ${client.name}`
    }))
  } catch (error) {
    handleError(error, 'Error fetching clients data')
  }
}

const fetchDrivers = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/drivers/get?active=true`)
    drivers.value = response.data.map((driver) => ({
      id: driver.id,
      driver_name: driver.driver_name,
      license_plate: driver.license_plate,
      province: driver.province,
      phone_number: driver.phone_number,
      truck_company_name: driver.truck_company_name,
      driver_image_path: driver.driver_image_path,
      truck_image_path: driver.truck_image_path,
      label: `${driver.driver_name} : ${driver.license_plate} - ${driver.province}`
    }))
  } catch (error) {
    handleError(error, 'Error fetching drivers data')
  }
}

const fetchYards = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/yards/get?active=true`)
    yards.value = response.data.map((yard) => ({
      yard_id: yard.id,
      yard_name: yard.yard_name,
      short_name: yard.short_name,
      label: `${yard.short_name}`
    }))
  } catch (error) {
    handleError(error, 'Error fetching yards data')
  }
}

const fetchZones = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/zones/get?active=true`)
    zones.value = response.data.map((zone) => ({
      zone_id: zone.id,
      zone_name: zone.zone,
      yard_name: zone.yard_name,
      path_map: zone.path_map,
      label: `${zone.zone}`
    }))
  } catch (error) {
    console.error('Error fetching zones data', error)
  }
}

const fetchConditions = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/common/getConditions`)
    conditions.value = response.data.map((condition) => ({
      id: condition.id,
      name_th: condition.condition_name_th,
      name_en: condition.condition_name_en,
      checked: false
    }))
  } catch (error) {
    handleError(error, 'Error fetching conditions data')
  }
}

// ปรับปรุงฟังก์ชัน validateContainerNumber
const validateContainerNumber = async (index) => {
  const container = containers.value[index]
  container.container = container.container.toUpperCase()
  const regex = /^[A-Z]{4}\d{7}$/

  if (!regex.test(container.container)) {
    Swal.fire({
      icon: 'error',
      title: 'รูปแบบไม่ถูกต้อง',
      text: 'หมายเลขตู้ต้องอยู่ในรูปแบบ AAAAXXXXXXX โดยที่ A เป็นตัวอักษรภาษาอังกฤษและ X เป็นตัวเลข'
    })
    return
  }

  try {
    const response = await axios.get(
      `${CONFIG.API_SERVER}/api/common/getEquipmentInterchangeReceipt`,
      {
        params: { container: container.container }
      }
    )

    if (response.data && response.data.length > 0) {
      const lastRecord = response.data[response.data.length - 1]
      if (
        lastRecord.entry_type === equipmentInterchangeReceipt.value.entry_type &&
        lastRecord.receipt_no !== equipmentInterchangeReceipt.value.receipt_no
      ) {
        Swal.fire({
          icon: 'error',
          title: 'ข้อมูลไม่ถูกต้อง',
          html: `
                        <div class="text-left">
                            <p class="mb-2">ตู้นี้มีการบันทึก ${lastRecord.entry_type} ไว้แล้วในระบบ</p>
                            <table class="table-auto w-full">
                                <tr>
                                    <td class="font-bold pr-2">EIR:</td>
                                    <td>${lastRecord.receipt_no}</td>
                                </tr>
                                <tr>
                                    <td class="font-bold pr-2">วันที่:</td>
                                    <td>${moment(lastRecord.date).format('DD/MM/YYYY HH:mm')}</td>
                                </tr>
                            </table>
                        </div>
                    `,
          confirmButtonText: 'ตกลง'
        })
        return
      }
    }
  } catch (error) {
    console.error('Error checking container number:', error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถตรวจสอบข้อมูลตู้ได้ กรุณาลองใหม่อีกครั้ง'
    })
  }
}

const handleYardSelection = (yard) => {
  if (yard) {
    equipmentInterchangeReceipt.value.yard_id = yard.yard_id
    equipmentInterchangeReceipt.value.yard = yard.short_name
  } else {
    equipmentInterchangeReceipt.value.yard_id = null
    equipmentInterchangeReceipt.value.yard = ''
  }
}

const handleDriverSelection = (driver) => {
  if (driver) {
    equipmentInterchangeReceipt.value.driver_id = driver.id
    equipmentInterchangeReceipt.value.driver_name = driver.driver_name
    equipmentInterchangeReceipt.value.truck_license = driver.license_plate
    equipmentInterchangeReceipt.value.truck_company = driver.truck_company_name
    equipmentInterchangeReceipt.value.tel = driver.phone_number
  } else {
    equipmentInterchangeReceipt.value.driver_id = null
    equipmentInterchangeReceipt.value.driver_name = ''
    equipmentInterchangeReceipt.value.truck_license = ''
    equipmentInterchangeReceipt.value.truck_company = ''
    equipmentInterchangeReceipt.value.tel = ''
  }
}

const watchSelectedColor = () => {
  if (selectedColor.value) {
    equipmentInterchangeReceipt.value.container_color = selectedColor.value.name
  } else {
    equipmentInterchangeReceipt.value.container_color = ''
  }
}

// ฟังก์ชันตรวจสอบฟิลด์ต่างๆ
const requiredFields = [
  'entry_type',
  'date',
  'container',
  'agent_id',
  'yard_id',
  'client_id',
  'booking_bl',
  'size_type'
]

const fieldNames = {
  entry_type: 'ประเภท(IN/OUT)',
  date: 'วันที่',
  container: 'หมายเลขตู้',
  agent_id: 'ตัวแทน',
  yard_id: 'ลานเดิม',
  client_id: 'ลูกค้า',
  booking_bl: 'Booking/BL',
  size_type: 'ขนาดและประเภท',
  seal_no: 'หมายเลขซีล',
  tare: 'น้ำหนักตู้เปล่า'
}
// ปรับปรุงฟังก์ชัน checkRequiredFields
const checkRequiredFields = () => {
  let isValid = true
  let missingFields = []

  // ตรวจสอบเฉพาะ fields ที่ไม่เกี่ยวกับตู้
  const generalRequiredFields = [
    'entry_type',
    'date',
    'agent_id',
    'yard_id',
    'client_id',
    'booking_bl'
  ]
  // ตรวจสอบ fields ทั่วไป
  generalRequiredFields.forEach((field) => {
    if (!equipmentInterchangeReceipt.value[field]) {
      isValid = false
      missingFields.push(fieldNames[field])
    }
  })

  // ตรวจสอบว่ามีตู้อย่างน้อย 1 ตู้
  if (containers.value.length === 0) {
    isValid = false
    missingFields.push('ต้องมีข้อมูลตู้อย่างน้อย 1 ตู้')
  }

  // ตรวจสอบข้อมูลตู้ทุกรายการ
  containers.value.forEach((container, index) => {
    const containerIndex = index + 1

    // ตรวจสอบหมายเลขตู้
    if (!container.container || container.container.trim() === '') {
      isValid = false
      missingFields.push(`หมายเลขตู้ที่ ${containerIndex}`)
    }

    // ตรวจสอบขนาดและประเภทตู้
    if (!container.size_type) {
      isValid = false
      missingFields.push(`ขนาดและประเภทตู้ที่ ${containerIndex}`)
    }

    // ตรวจสอบเงื่อนไขเพิ่มเติมสำหรับ OUT
    if (equipmentInterchangeReceipt.value.entry_type === 'OUT') {
      if (!container.seal_no || container.seal_no.trim() === '') {
        isValid = false
        missingFields.push(`หมายเลขซีลตู้ที่ ${containerIndex}`)
      }

      if (!container.tare || container.tare === 0.0) {
        isValid = false
        missingFields.push(`น้ำหนักตู้เปล่าที่ ${containerIndex}`)
      }
    }
  })

  // แสดง error message ถ้ามี missing fields
  if (!isValid) {
    Swal.fire({
      icon: 'error',
      title: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      html: `<div class="text-left">
              <div class="font-semibold mb-2">กรุณากรอกข้อมูลต่อไปนี้:</div>
              <ul class="list-disc pl-5">
                ${missingFields.map((field) => `<li>${field}</li>`).join('')}
              </ul>
            </div>`
    })
  }

  return isValid
}
const mapSelectedToReceipt = () => {
  if (selectedAgent.value) {
    equipmentInterchangeReceipt.value.agent_id = selectedAgent.value.agent_id ?? ''
    equipmentInterchangeReceipt.value.agent_code = selectedAgent.value.agent_code ?? ''
  } else {
    equipmentInterchangeReceipt.value.agent_id = ''
    equipmentInterchangeReceipt.value.agent_code = ''
  }

  if (selectedClient.value) {
    equipmentInterchangeReceipt.value.client_id = selectedClient.value.client_id ?? ''
    equipmentInterchangeReceipt.value.client_code = selectedClient.value.client_code ?? ''
  } else {
    equipmentInterchangeReceipt.value.client_id = ''
    equipmentInterchangeReceipt.value.client_code = ''
  }

  equipmentInterchangeReceipt.value.conditions = conditions.value
    .filter((condition) => condition.checked)
    .map((condition) => ({
      condition_id: condition.id ?? ''
    }))
}

// ฟังก์ชั่นจัดการเงื่อนไข
const handleConditionChange = (condition) => {
  if (condition.checked) {
    equipmentInterchangeReceipt.value.conditions.push({ condition_id: condition.id })
  } else {
    equipmentInterchangeReceipt.value.conditions =
      equipmentInterchangeReceipt.value.conditions.filter((c) => c.condition_id !== condition.id)
  }
}

const handleError = (error, message) => {
  Swal.fire('Error', `${message}: ${error.response?.data?.message || error.message}`, 'error')
}

// ฟังก์ชันสร้าง EIR ใหม่
const createReceipt = async () => {
  mapSelectedToReceipt()
  if (!checkRequiredFields()) return

  try {
    if (equipmentInterchangeReceipt.value.entry_type === 'OUT') {
      const response = await axios.get(`${CONFIG.API_SERVER}/api/EIR/getAvailableContainers`, {
        params: { agent_id: selectedAgent.value.agent_id }
      })

      if (response.data.success) {
        const availableContainers = response.data.data
        const unavailableContainers = containers.value
          .filter(
            (container) =>
              !availableContainers.some((available) => available.container === container.container)
          )
          .map((container) => container.container)

        if (unavailableContainers.length > 0) {
          await Swal.fire({
            icon: 'error',
            title: 'ไม่สามารถสร้างรายการได้',
            html: `
              <div class="text-left">
                <p>ตู้ต่อไปนี้ได้ถูกใช้ไปแล้ว:</p>
                <ul class="list-disc pl-5">
                  ${unavailableContainers.map((container) => `<li>${container}</li>`).join('')}
                </ul>
              </div>
            `
          })
          containers.value = containers.value.filter(
            (container) => !unavailableContainers.includes(container.container)
          )
          return
        }
      }
    }

    // Create Group EIR Header
    const groupHeaderResponse = await axios.post(`${CONFIG.API_SERVER}/api/group-eir/create`, {
      create_by: equipmentInterchangeReceipt.value.create_user,
      booking_bl: equipmentInterchangeReceipt.value.booking_bl
    })

    if (!groupHeaderResponse.data.id) {
      throw new Error('Failed to create Group EIR Header')
    }

    const groupId = groupHeaderResponse.data.id

    // Create EIR and Detail for each container
    for (const container of containers.value) {
      const receiptData = {
        ...equipmentInterchangeReceipt.value,
        container: container.container,
        container_color: container.container_color,
        size_type: container.size_type,
        seal_no: container.seal_no,
        vessel: container.vessel,
        tare: container.tare,
        voyage: container.voyage
      }

      const response = await axios.post(`${CONFIG.API_SERVER}/api/EIR/add`, receiptData)
      if (!response.data.equipment_interchange_receipt_id) {
        throw new Error('Failed to create EIR')
      }

      // Add Group EIR Detail
      const detailResponse = await axios.post(`${CONFIG.API_SERVER}/api/group-eir/detail`, {
        group_id: groupId,
        eir_id: response.data.equipment_interchange_receipt_id
      })

      if (!detailResponse.data.success) {
        throw new Error('Failed to create Group EIR Detail')
      }

      if (container.matching_eir_id) {
        await axios.post(`${CONFIG.API_SERVER}/api/eir_match/add`, {
          eir_in: container.matching_eir_id,
          eir_out: response.data.equipment_interchange_receipt_id,
          is_active: true
        })

        if (receiptData.drop_container && receiptData.entry_type === 'OUT') {
          await axios.post(`${CONFIG.API_SERVER}/api/EIR/createInvoiceDetailsforDropOut`, {
            equipmentId: response.data.equipment_interchange_receipt_id,
            invoiceHeaderId: response.data.invoice_id
          })
        }
      }
    }

    await Swal.fire('Success', 'สร้างข้อมูลสำเร็จ', 'success')
    emit('formSubmitted')
    router.push({ path: `/eirGroupView/${groupId}` }).then(() => {
      router.go(0)
    })
  } catch (error) {
    handleError(error, 'Error creating equipment interchange receipt')
  }
}

// เลือกโซน
const handleZoneSelection = (zone) => {
  if (zone) {
    equipmentInterchangeReceipt.value.zone_id = zone.zone_id
    equipmentInterchangeReceipt.value.zone = zone.zone_name
    equipmentInterchangeReceipt.value.path_map = zone.path_map
    selectedZone.value = zone
  } else {
    equipmentInterchangeReceipt.value.zone_id = null
    equipmentInterchangeReceipt.value.zone = ''
    equipmentInterchangeReceipt.value.path_map = ''
    selectedZone.value = null
  }
}

onMounted(async () => {
  loading.value = true

  // เตรียม data สำหรับกรณีสร้าง EIR ใหม่ (อาจมาจาก query.initialData เช่นหากเป็นการต่อจากใบอื่น)
  const initialData = router.currentRoute.value.query.initialData
    ? JSON.parse(decodeURIComponent(router.currentRoute.value.query.initialData))
    : null

  // ดึงข้อมูลเบื้องต้น
  await fetchAgents()
  await fetchClients()
  await fetchDrivers()
  await fetchYards()
  await fetchZones()
  await fetchConditions()
  equipmentInterchangeReceipt.value.yard_id = 26
  const defaultYard = yards.value.find((yard) => yard.yard_id === 26)
  if (defaultYard) {
    selectedYard.value = defaultYard
    equipmentInterchangeReceipt.value.yard = defaultYard.short_name
  }

  await fetchUserData()

  if (initialData) {
    // กรณีมีค่า initialData (เช่น matchOut)
    initialData.conditions = [{ condition_id: 1 }]
    Object.assign(equipmentInterchangeReceipt.value, initialData)

    selectedAgent.value = agents.value.find((agent) => agent.agent_id === initialData.agent_id)
    selectedClient.value = clients.value.find(
      (client) => client.client_id === initialData.client_id
    )
    selectedDriver.value = drivers.value.find((dr) => dr.id === initialData.driver_id)
    selectedZone.value = zones.value.find((z) => z.zone_id === initialData.zone_id)
    selectedColor.value = colors.find(
      (color) => color.name === equipmentInterchangeReceipt.value.container_color
    )
    selectedYard.value = yards.value.find((yard) => yard.yard_id === initialData.yard_id)

    equipmentInterchangeReceipt.value.date = config.defaultDate // ให้วันที่เป็นปัจจุบัน
    matching_eir_id.value = initialData.id

    // เซ็ต checkbox เงื่อนไข
    conditions.value.forEach((condition) => {
      condition.checked = equipmentInterchangeReceipt.value.conditions.some(
        (c) => c.condition_id === condition.id
      )
    })
  } else {
    // ไม่มี initialData ก็สร้างฟอร์มเปล่า
    equipmentInterchangeReceipt.value.date = config.defaultDate
    conditions.value.forEach((condition) => {
      condition.checked = equipmentInterchangeReceipt.value.conditions.some(
        (c) => c.condition_id === condition.id
      )
    })
  }

  loading.value = false
})
</script>
<style scoped>
.tab-container {
  width: 100%;
  max-width: 100vw;
  overflow-x: auto;
}

.tabs {
  min-width: max-content;
}

/* ซ่อน scrollbar สำหรับ Chrome, Safari และ Opera */
.tab-container::-webkit-scrollbar {
  display: none;
}

/* ซ่อน scrollbar สำหรับ IE, Edge และ Firefox */
.tab-container {
  -ms-overflow-style: none;
  /* IE และ Edge */
  scrollbar-width: none;
  /* Firefox */
}
/* Container Multiselect Styles */
.container-multiselect {
  font-size: 14px;
}

.container-multiselect .multiselect__tags {
  min-height: 34px;
  padding: 4px 30px 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  background: #ffffff;
}

.container-multiselect .multiselect__select {
  height: 32px;
  width: 30px;
  padding: 0;
  top: 1px;
  right: 1px;
}

.container-multiselect .multiselect__single {
  font-size: 14px;
  padding: 0;
  margin: 0;
  background: transparent;
}

.container-multiselect .multiselect__placeholder {
  color: #a0aec0;
  font-size: 14px;
  margin: 0;
  padding-top: 0;
}

.container-multiselect .multiselect__input {
  font-size: 14px;
  padding: 0;
  margin: 0;
}

/* Dropdown styles when appended to body */
body > .multiselect__content-wrapper {
  z-index: 9999 !important;
  position: fixed !important;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.multiselect__option {
  font-size: 14px;
  padding: 8px 12px;
}

.multiselect__option--highlight {
  background: #3b82f6;
  color: white;
}

/* Table Styles */
table {
  border-collapse: separate;
  border-spacing: 0;
}

th {
  background-color: #f8f9fa;
  padding: 8px 12px;
  font-weight: 500;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

td {
  padding: 8px 12px;
  border-bottom: 1px solid #e2e8f0;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 32px;
}

option {
  padding: 8px;
}
</style>
