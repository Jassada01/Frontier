<template>
  <div class="eir-table p-4 overflow-x-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">รายการ EIR</h1>

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
          <tr>
            <th class="p-4">ประเภท</th>
            <th class="p-4">ตุ้ Drop</th>
            <th class="p-4">เลขที่ EIR</th>
            <th class="p-4">วันที่</th>
            <th class="p-4">Agent</th>
            <th class="p-4">ลูกค้า</th>
            <th class="p-4">Booking/BL</th>
            <th class="p-4">เบอร์ตู้</th>
            <th class="p-4">ขนาด</th>
            <th class="p-4">ทะเบียน</th>
            <th class="p-4">ลาน</th>
            <th class="p-4">Match EIR</th>
            <th class="p-4">สถานะ</th>
            <th class="p-4">EIR-Group</th>
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
                <div v-else class="badge badge-secondary "><i class="fa fa-exchange text-base"></i>

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
import { ref, onMounted } from 'vue'
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

    console.log(eirs.value)
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
        pageLength: 100, // Set the number of rows to display per page
        order: [[3, 'desc']], // Order by the fifth column (index 4) in descending order
        initComplete: function (settings, json) {
          isDataTableInitialized.value = true
        }
      })

      // Add event listener for the entry type filter
      $('#entryTypeFilter').on('change', function () {
        table.column(0).search(this.value).draw()
      })

      // Add event listener for the drop container filter
      $('#dropContainerFilter').on('change', function () {
        if (this.checked) {
          table.column(1).search('Drop').draw()
        } else {
          table.column(1).search('').draw()
        }
      })

      // Add event listener for the match EIR filter
      $('#matchEirFilter').on('change', function () {
        if (this.checked) {
          table.column(11).search('^$', true, false).draw()
        } else {
          table.column(11).search('').draw()
        }
      })

      // Add event listener for the active status filter
      $('#activeStatusFilter').on('change', function () {
        if (this.checked) {
          table.column(12).search('^(?!.*ยกเลิก).*$', true, false).draw() // Filter out 'ยกเลิก'
        } else {
          table.column(12).search('').draw()
        }
      })

      $('#eirGroupFilter').on('change', function () {
        table.column(13).search(this.value).draw()
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
