<template>
  <div class="eir-table p-4 overflow-x-auto">
    <div class="flex justify-between items-center mb-6">
      <!-- Left Section -->
      <div class="flex flex-col gap-4">
        <h1 class="text-2xl font-bold">รายการ EIR</h1>

        <!-- เพิ่ม HTML ส่วน filter ในส่วนที่อยู่ใกล้กับ filter อื่นๆ -->
        <div class="flex items-center gap-6">
          <!-- Filter ที่มีอยู่เดิม -->
          <div class="form-control w-[120px]">
            <select
              v-model="selectedEntryType"
              class="select select-sm select-bordered w-full"
              @change="filterByEntryType"
            >
              <option value="">ทั้งหมด</option>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>

          <!-- เพิ่ม Filter Agent -->
          <div class="form-control w-[200px]">
            <select
              v-model="selectedAgent"
              class="select select-sm select-bordered w-full"
              @change="filterByAgent"
            >
              <option value="">Agent ทั้งหมด</option>
              <option v-for="agent in uniqueAgents" :key="agent" :value="agent">
                {{ agent }}
              </option>
            </select>
          </div>

          <!-- เพิ่ม Filter ขนาด -->
          <div class="form-control w-[120px]">
            <select
              v-model="selectedSize"
              class="select select-sm select-bordered w-full"
              @change="filterBySize"
            >
              <option value="">ขนาดทั้งหมด</option>
              <option v-for="size in uniqueSizes" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>

          <!-- Checkbox ที่มีอยู่เดิม -->
          <div class="form-control">
            <label class="label cursor-pointer py-0 gap-2">
              <input
                type="checkbox"
                v-model="showOnlyUnmatched"
                @change="filterByMatchEir"
                class="checkbox checkbox-primary checkbox-sm"
              />
              <span class="label-text text-sm">เฉพาะยังไม่ Match</span>
            </label>
          </div>
        </div>
      </div>

      <div class="relative inline-block text-left">
        <div class="flex">
          <!-- ปุ่ม Preview -->
          <div class="join">
            <router-link to="/EIR">
              <button class="join-item btn btn-primary">
                <i class="fa fa-plus-circle mr-2"></i> สร้าง EIR
              </button></router-link
            >
            <!-- ปุ่มแสดงเมนู -->
            <button @click="toggleDropdown" class="join-item btn btn-primary">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Dropdown Menu -->
        <div
          v-if="openDropdown"
          class="absolute right-0 z-10 w-44 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg"
        >
          <router-link to="/createMultiEIR">
            <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <i class="fa fa-plus-circle mr-2"></i> สร้าง EIR แบบเป็นชุด
            </button></router-link
          >
        </div>
      </div>
    </div>
    <div v-show="isDataTableInitialized" class="overflow-x-auto">
      <table id="eirTable" class="table table-zebra">
        <thead>
          <tr class="bg-base-200 text-base-content">
            <th class="p-3 text-sm font-semibold tracking-wide text-center">ประเภท</th>
            <th class="p-3 text-sm font-semibold tracking-wide text-center">ตู้ Drop</th>
            <th class="p-3 text-sm font-semibold tracking-wide">เลขที่ EIR</th>
            <th class="p-3 text-sm font-semibold tracking-wide">วันที่</th>
            <th class="p-3 text-sm font-semibold tracking-wide">Agent</th>
            <th class="p-3 text-sm font-semibold tracking-wide">ลูกค้า</th>
            <th class="p-3 text-sm font-semibold tracking-wide">Booking/BL</th>
            <th class="p-3 text-sm font-semibold tracking-wide">เบอร์ตู้</th>
            <th class="p-3 text-sm font-semibold tracking-wide text-center">ขนาด</th>
            <th class="p-3 text-sm font-semibold tracking-wide">ทะเบียน</th>
            <th class="p-3 text-sm font-semibold tracking-wide">ลาน</th>
            <th class="p-3 text-sm font-semibold tracking-wide text-center">Match EIR</th>
            <th class="p-3 text-sm font-semibold tracking-wide text-center">สถานะ</th>
            <th class="p-3 text-sm font-semibold tracking-wide">EIR-Group</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="eir in eirs" :key="eir.id">
            <td class="p-4">
              <div class="grid justify-items-center">
                <span
                  :class="eir.entry_type === 'IN' ? 'badge badge-success' : 'badge badge-error'"
                >
                  {{ eir.entry_type }}
                </span>
              </div>
            </td>
            <td class="p-4">
              <div class="grid justify-items-center">
                <div v-if="eir.drop_container" class="badge badge-primary badge-outline">Drop</div>
              </div>
            </td>
            <td class="p-4 whitespace-nowrap text-primary">
              <router-link :to="`/EIR/${eir.id}`">{{ eir.receipt_no }}</router-link>
            </td>
            <td class="p-4 whitespace-nowrap">{{ formatDate(eir.date) }}</td>
            <td class="p-4">{{ eir.agent_code }}</td>
            <td class="p-4">{{ eir.client_code }}</td>
            <td class="p-4">{{ eir.booking_bl }}</td>
            <td class="p-4">{{ eir.container }}</td>
            <td class="p-4">{{ eir.size_type }}</td>
            <td class="p-4">{{ eir.truck_license }}</td>
            <td class="p-4">{{ eir.yard }}</td>
            <td class="p-4 whitespace-nowrap">
              <div v-if="eir.match_eir" class="tooltip" :data-tip="eir.match_eir">
                <div v-if="eir.match_eir == eir.receipt_no" class="badge badge-ghost badge-outline">
                  X
                </div>
                <div v-else class="badge badge-secondary">
                  <i class="fa fa-exchange text-base"></i>
                </div>
              </div>
            </td>
            <td class="p-4">
              <div
                :class="
                  eir.status_name_th === 'ใช้งาน'
                    ? 'badge badge-primary badge-outline whitespace-nowrap'
                    : eir.status_name_th === 'เสร็จสิ้น'
                      ? 'badge badge-success whitespace-nowrap'
                      : 'badge badge-error badge-outline whitespace-nowrap'
                "
              >
                {{ eir.status_name_th }}
              </div>
            </td>
            <td class="p-4 whitespace-nowrap text-primary">
              <router-link v-if="eir.group_id" :to="`/eirGroupView/${eir.group_id}`">
                {{ eir.group_code }}
              </router-link>
              <span v-else></span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-show="!isDataTableInitialized" class="overflow-x-auto text-center py-4">
      <span class="loading loading-spinner loading-lg"></span>
      <p>กำลังโหลดข้อมูล...</p>
    </div>
  </div>
</template>

<script setup>
'use strict'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import moment from 'moment'
import CONFIG from '../../config/config'

// Import DataTables and jQuery
import 'datatables.net-dt/css/dataTables.dataTables.min.css'
import 'datatables.net-dt'
import $ from 'jquery'
import 'datatables.net'

const eirs = ref([])
const router = useRouter()
const isDataTableInitialized = ref(false)
const openDropdown = ref(false)
const selectedEntryType = ref('')
const showOnlyUnmatched = ref(false)
// เพิ่ม ref ใหม่
const selectedAgent = ref('')
const selectedSize = ref('')

// เพิ่ม computed properties สำหรับ unique values
const uniqueAgents = computed(() => {
  const agents = new Set(eirs.value.map(eir => eir.agent_code))
  return Array.from(agents).filter(agent => agent).sort()
})


const uniqueSizes = computed(() => {
  const sizes = new Set(eirs.value.map((eir) => eir.size_type))
  return Array.from(sizes)
    .filter((size) => size)
    .sort()
})

// เพิ่ม filter functions
const filterByAgent = () => {
  if (!isDataTableInitialized.value) return

  const table = $('#eirTable').DataTable()
  if (selectedAgent.value) {
    table.column(4).search(selectedAgent.value).draw()
  } else {
    table.column(4).search('').draw()
  }
}

const filterBySize = () => {
  if (!isDataTableInitialized.value) return

  const table = $('#eirTable').DataTable()
  if (selectedSize.value) {
    table.column(8).search(selectedSize.value).draw()
  } else {
    table.column(8).search('').draw()
  }
}

// Function สำหรับ filter ตาม entry_type
const filterByEntryType = () => {
  if (!isDataTableInitialized.value) return

  const table = $('#eirTable').DataTable()
  if (selectedEntryType.value) {
    table.column(0).search(selectedEntryType.value).draw()
  } else {
    table.column(0).search('').draw()
  }
}

// Function สำหรับ filter ตาม match_eir
const filterByMatchEir = () => {
  if (!isDataTableInitialized.value) return

  const table = $('#eirTable').DataTable()
  if (showOnlyUnmatched.value) {
    // ใช้ Custom filtering function
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
      const row = eirs.value[dataIndex]
      return row.match_eir === null
    })
    table.draw()
  } else {
    // ล้าง custom filter
    $.fn.dataTable.ext.search.pop()
    table.draw()
  }
}

function toggleDropdown() {
  openDropdown.value = !openDropdown.value
}

const formatDate = (date) => {
  return moment(date).format('D/M/YYYY H:mm')
}

onMounted(async () => {
  'use strict'
  try {
    const startDate = moment().subtract(60, 'days').format('YYYY-MM-DD')
    const endDate = moment().add(60, 'days').format('YYYY-MM-DD')

    const response = await axios.get(`${CONFIG.API_SERVER}/api/EIR/get`, {
      params: {
        start_date: startDate,
        end_date: endDate
      }
    })

    eirs.value = response.data

    // Extend DataTables sorting for dates
    $.fn.dataTable.moment = function (format, locale) {
      var types = $.fn.dataTable.ext.type

      // Add type detection
      types.detect.unshift(function (d) {
        return moment(d, format, locale, true).isValid() ? 'moment-' + format : null
      })

      // Add sorting method - use an integer for the sorting
      types.order['moment-' + format + '-pre'] = function (d) {
        return moment(d, format, locale, true).unix()
      }
    }

    // Call the function with the format used in your data
    $.fn.dataTable.moment('D/M/YYYY H:mm')

    // Initialize DataTables
    setTimeout(() => {
      const table = $('#eirTable').DataTable({
        pageLength: 100,
        order: [[3, 'desc']],
        initComplete: function (settings, json) {
          isDataTableInitialized.value = true
        }
      })

      // Apply initial filter to exclude 'ยกเลิก'
      table.column(12).search('^(?!.*ยกเลิก).*$', true, false).draw()
    }, 0)
  } catch (error) {
    console.error('Error fetching EIRs:', error)
  }
})
</script>

<style scoped>
.eir-table {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}
</style>
