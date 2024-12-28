<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-[500px]">
        <div class="flex flex-col items-center gap-4">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <p class="text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</p>
        </div>
      </div>

      <template v-else>
        <!-- Header Section -->
        <div
          class="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative"
        >
          <!-- Subtle Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50"></div>

          <div class="relative p-8">
            <div
              class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
            >
              <!-- Title and Date -->
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <span class="bg-blue-100 rounded-lg p-2">
                    <span class="i-lucide-boxes h-5 w-5 text-blue-600"></span>
                  </span>
                  <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
                    {{ groupData.group_code }}
                  </h1>
                </div>
                <div class="flex flex-col gap-1">
                  <p class="text-gray-600">{{ groupData.booking_bl }}</p>
                  <p class="text-gray-500 flex items-center gap-2 text-sm">
                    <span class="i-lucide-calendar h-4 w-4"></span>
                    {{ formatDate(groupData.create_date) }}
                  </p>
                </div>
              </div>

              <!-- Summary Stats -->
              <div class="grid grid-cols-2 gap-6">
                <div
                  class="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-100"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <span class="i-lucide-container h-4 w-4 text-blue-600"></span>
                    <p class="text-sm text-blue-700">จำนวนตู้ทั้งหมด</p>
                  </div>
                  <p class="text-2xl font-bold text-blue-900 flex items-baseline gap-1">
                    {{ groupData.eirs.length }}
                    <span class="text-base font-normal text-blue-700">ตู้</span>
                  </p>
                </div>
                <div
                  class="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-xl border border-green-100"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <span class="i-lucide-receipt h-4 w-4 text-green-600"></span>
                    <p class="text-sm text-green-700">ยอดรวมทั้งหมด</p>
                  </div>
                  <p class="text-2xl font-bold text-green-900">
                    {{ getTotalInvoiceAmount }}
                  </p>
                </div>
              </div>

              <!-- Export Button -->
              <div class="flex items-center">
                <ExportToPdf :items="completeEIRData">
                  <span class="i-lucide-file-text h-4 w-4"></span>
                  <span>Export PDF</span>
                </ExportToPdf>
                <ExportInvoiceToPDF :invoiceData="formattedInvoiceData" />
              </div>
            </div>
          </div>
        </div>

        <!-- EIR Cards Grid -->
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
          <EIRTicketCard v-for="eir in groupData.eirs" :key="eir.id" :eir="eir" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import moment from 'moment'
import axios from 'axios'
import CONFIG from '../../config/config'
import ExportToPdf from '../../components/EIR/ExportToPdf.vue'
import EIRTicketCard from './EIRGroupTicketCard.vue'
import ExportInvoiceToPDF from '../../components/EIR/ExportInvoiceToPDF.vue'

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true
  }
})

const router = useRouter()
const loading = ref(true)
const groupData = ref({
  group_code: '',
  create_date: null,
  eirs: []
})

const formatDate = (date) => moment(date).format('DD/MM/YYYY HH:mm')
const formatAmount = (amount) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
const formattedInvoiceData = computed(() => {
  // รวบรวมข้อมูล invoice จากทุก EIR
  const allInvoices = []

  completeEIRData.value.forEach((eir) => {
    if (eir.invoices && eir.invoices.length > 0) {
      eir.invoices.forEach((invoice) => {
        allInvoices.push({
          form: invoice,
          equipmentInterchangeReceipt: {
            agent_code: eir.agent_code || 'NON',
            client_code: eir.client_code || '',
            booking_bl: eir.booking_bl || '',
            container: eir.container_no || '',
            size_type: eir.size_type || '',
            vessel: eir.vessel || '',
            voyage: eir.voyage || '',
            truck_company: eir.truck_company || '',
            driver_name: eir.driver_name || '',
            truck_license: eir.truck_license || ''
          }
        })
      })
    }
  })

  return allInvoices
})

const completeEIRData = ref([])

const getTotalInvoiceAmount = computed(() => {
  const total = groupData.value.eirs.reduce((sum, eir) => {
    return (
      sum +
      (eir.invoices?.reduce((invoiceSum, invoice) => invoiceSum + (invoice.total_amount || 0), 0) ||
        0)
    )
  }, 0)
  return formatAmount(total)
})

// ปรับปรุงฟังก์ชัน fetchGroupDetails
const fetchGroupDetails = async () => {
  try {
    loading.value = true
    // ดึงข้อมูล Group EIR ก่อน
    const response = await axios.get(`${CONFIG.API_SERVER}/api/group-eir/${props.groupId}`)

    if (response.data.success) {
      groupData.value = response.data.data

      // ดึงข้อมูลเพิ่มเติมสำหรับแต่ละ EIR แบบ parallel
      const completeDataPromises = groupData.value.eirs.map((eir) => fetchCompleteEIRData(eir.id))

      const results = await Promise.all(completeDataPromises)
      completeEIRData.value = results.filter((result) => result !== null)
      console.log(completeEIRData.value)
    }
  } catch (error) {
    console.error('Error fetching group details:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchGroupDetails)

// ฟังก์ชันสำหรับดึงข้อมูลทั้งหมดของ EIR แต่ละตัว
const fetchCompleteEIRData = async (eirId) => {
  try {
    const [eirResponse, tasksResponse, invoicesResponse] = await Promise.all([
      axios.get(`${CONFIG.API_SERVER}/api/EIR/get?id=${eirId}`),
      axios.get(`${CONFIG.API_SERVER}/api/tasks`, {
        params: { eir_id: eirId }
      }),
      axios.get(`${CONFIG.API_SERVER}/api/invoices/get`, {
        params: {
          id: null, // หรือใส่ invoice_id ถ้ามี
          eir_id: eirId
        }
      })
    ])

    // แปลงข้อมูล invoice ให้อยู่ในรูปแบบที่ต้องการ
    const formattedInvoices = invoicesResponse.data.map((invoice) => ({
      id: invoice.id,
      invoice_no: invoice.invoice_no,
      invoice_date: invoice.invoice_date,
      client_id: invoice.client_id,
      customer_name: invoice.customer_name,
      customer_name_eng: invoice.customer_name_eng || '',
      customer_address: invoice.customer_address || '',
      customer_address_eng: invoice.customer_address_eng || '',
      customer_address_branch: invoice.customer_address_branch,
      customer_address_branch_eng: invoice.customer_address_branch_eng || '',
      tax_id: invoice.tax_id || '',
      invoice_language: invoice.invoice_language,
      agent_id: invoice.agent_id,
      agent_code: invoice.agent_code,
      driver_id: invoice.driver_id,
      driver: invoice.driver,
      truck_license: invoice.truck_license,
      truck_company: invoice.truck_company,
      container: invoice.container,
      size_type: invoice.size_type,
      shipper: invoice.shipper,
      vessel: invoice.vessel,
      voyage: invoice.voyage,
      booking_bl: invoice.booking_bl,
      yard_id: invoice.yard_id,
      yard: invoice.yard,
      total_amount: invoice.total_amount,
      vat_amount: invoice.vat_amount,
      total_with_holding_tax: invoice.total_with_holding_tax,
      total_discount: invoice.total_discount,
      net_total: invoice.net_total,
      grand_total: invoice.grand_total,
      payment_total: invoice.payment_total,
      status_id: invoice.status_id,
      status: invoice.status,
      wht_status: invoice.wht_status,
      note: invoice.note,
      payment_method: invoice.payment_method || 'เงินสด/โอน',
      create_user: invoice.create_user,
      create_datetime: invoice.create_datetime,
      update_user: invoice.update_user,
      update_datetime: invoice.update_datetime,
      eir_id: invoice.eir_id,
      detail: invoice.detail || []
    }))

    return {
      ...eirResponse.data,
      tasks: tasksResponse.data || [],
      invoices: formattedInvoices
    }
  } catch (error) {
    console.error(`Error fetching complete data for EIR ${eirId}:`, error)
    return null
  }
}
</script>
