<template>
  <div class="eir-table p-4 overflow-x-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">รายการ EIR</h1>
      <router-link to="/EIR">
        <button class="btn btn-primary"><i class="fa fa-plus-circle mr-2"></i> เพิ่ม EIR</button>
      </router-link>
    </div>
    <div class="mb-4 flex items-center">
      <div class="mr-4">
        <label for="entryTypeFilter" class="mr-2">ประเภท:</label>
        <select id="entryTypeFilter" class="select select-bordered">
          <option value="">ทั้งหมด</option>
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
        </select>
      </div>
      <div class="form-control mr-4">
        <label class="cursor-pointer label">
          <input type="checkbox" id="dropContainerFilter" class="checkbox checkbox-info" />
          <span class="label-text ml-2">แสดงเฉพาะ Drop</span>
        </label>
      </div>
      <div class="form-control mr-4">
        <label class="cursor-pointer label">
          <input type="checkbox" id="matchEirFilter" class="checkbox checkbox-info" />
          <span class="label-text ml-2">แสดงเฉพาะไม่มี Match EIR</span>
        </label>
      </div>
      <div class="form-control">
        <label class="cursor-pointer label">
          <input type="checkbox" id="activeStatusFilter" class="checkbox checkbox-info" checked />
          <span class="label-text ml-2">แสดงเฉพาะที่ใช้งาน</span>
        </label>
      </div>
    </div>
    <div class="overflow-x-auto">
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
          </tr>
        </thead>
        <tbody>
          <tr v-for="eir in eirs" :key="eir.id">
            <td class="p-4">
              <div class="grid justify-items-center">
                <span :class="eir.entry_type === 'IN' ? 'badge badge-success' : 'badge badge-error'">
                  {{ eir.entry_type }}
                </span>
              </div>
            </td>
            <td class="p-4">
              <div class="grid justify-items-center">
                <div v-if="eir.drop_container" class="badge badge-primary badge-outline">Drop</div>
              </div>
            </td>
            <td class="p-4 whitespace-nowrap text-primary"><router-link :to="`/EIR/${eir.id}`">{{ eir.receipt_no }}</router-link></td>
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
                <div class="badge badge-accent badge-outline">M</div>
              </div>
            </td>
            <td class="p-4">
              <div :class="eir.status_name_th === 'ใช้งาน'
                  ? 'badge badge-primary badge-outline whitespace-nowrap'
                  : 'badge badge-error badge-outline whitespace-nowrap'
                ">
                {{ eir.status_name_th }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
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

const formatDate = (date) => {
  return moment(date).format('D/M/YYYY H:mm')
}

onMounted(async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/EIR/get`)
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
        pageLength: 100, // Set the number of rows to display per page
        order: [[3, 'desc']] // Order by the fifth column (index 4) in descending order
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
          table.column(11).search('^((?!M).)*$', true, false).draw()
        } else {
          table.column(11).search('').draw()
        }
      })

      // Add event listener for the active status filter
      $('#activeStatusFilter').on('change', function () {
        if (this.checked) {
          table.column(12).search('ใช้งาน').draw()
        } else {
          table.column(12).search('').draw()
        }
      })

      // Apply initial filter for active status
      table.column(12).search('ใช้งาน').draw()
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
