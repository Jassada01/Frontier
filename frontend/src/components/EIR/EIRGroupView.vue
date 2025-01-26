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
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6 space-y-6">
            <!-- Top Section: Title, Date, Export -->
            <div
              class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <!-- Title and Info -->
              <div class="flex items-start gap-4">
                <div class="bg-blue-100 rounded-xl p-2.5 shrink-0">
                  <span class="i-lucide-boxes h-6 w-6 text-blue-600"></span>
                </div>
                <div class="space-y-1">
                  <h1 class="text-2xl font-bold text-gray-900">{{ groupData.group_code }}</h1>
                  <div class="flex flex-wrap items-center gap-3 text-sm">
                    <div class="flex items-center gap-1.5 text-gray-600">
                      <span class="i-lucide-package h-4 w-4"></span>
                      <span>{{ groupData.booking_bl }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-gray-600">
                      <span class="i-lucide-calendar h-4 w-4"></span>
                      <span>{{ formatDate(groupData.create_date) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Export Buttons -->
              <div class="flex items-center gap-3 md:ml-auto">
                <ExportToPdf :items="completeEIRData">
                  <span class="i-lucide-file-text h-4 w-4"></span>
                  <span>Export PDF</span>
                </ExportToPdf>
                <ExportInvoiceToPDF :invoiceData="formattedInvoiceData" />
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <!-- จำนวนตู้ -->
              <div
                class="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100"
              >
                <div class="flex flex-col justify-between h-full">
                  <div class="flex items-center gap-2 mb-3">
                    <span class="i-lucide-container h-5 w-5 text-blue-600"></span>
                    <p class="font-medium text-gray-700">จำนวนตู้ทั้งหมด</p>
                  </div>
                  <div class="flex items-baseline justify-end gap-2">
                    <span class="text-3xl font-bold text-blue-900">{{
                      groupData.eirs.length
                    }}</span>
                    <span class="text-blue-600 font-medium">ตู้</span>
                  </div>
                </div>
              </div>

              <!-- ยอดรวม -->
              <div
                class="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-xl border border-emerald-100"
              >
                <div class="flex flex-col justify-between h-full">
                  <div class="flex items-center gap-2 mb-3">
                    <span class="i-lucide-receipt h-5 w-5 text-emerald-600"></span>
                    <p class="font-medium text-gray-700">ยอดรวมทั้งหมด</p>
                  </div>
                  <p class="text-2xl font-bold text-emerald-700 text-right">
                    {{ formatAmount(getTotalInvoiceAmount) }}
                  </p>
                </div>
              </div>

              <!-- ยอดหัก ณ ที่จ่าย -->
              <div
                class="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border border-orange-100"
              >
                <div class="flex flex-col justify-between h-full">
                  <div class="flex items-center gap-2 mb-3">
                    <span class="i-lucide-percent h-5 w-5 text-orange-600"></span>
                    <p class="font-medium text-gray-700">ยอดหัก ณ ที่จ่าย</p>
                  </div>
                  <p class="text-2xl font-bold text-orange-700 text-right">
                    {{ formatAmount(getTotalWithholdingTax) }}
                  </p>
                </div>
              </div>

              <!-- ยอดที่ต้องชำระ -->
              <div
                class="bg-gradient-to-br from-violet-50 to-white p-4 rounded-xl border border-violet-100"
              >
                <div class="flex flex-col justify-between h-full">
                  <div class="flex items-center gap-2 mb-3">
                    <span class="i-lucide-calculator h-5 w-5 text-violet-600"></span>
                    <p class="font-medium text-gray-700">ยอดที่ต้องชำระ</p>
                  </div>
                  <p class="text-2xl font-bold text-violet-700 text-right">
                    {{ formatAmount(getTotalNetAmount) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- EIR Cards Grid -->
        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
          
          <EIRTicketCard
            v-for="eir in completeEIRData"
            :key="eir[0].id"
            :eir="{
              id: eir[0].id,
              receipt_no: eir[0].receipt_no,
              container: eir[0].container,
              size_type: eir[0].size_type,
              vessel: eir[0].vessel,
              voyage: eir[0].voyage,
              status: {
                th: eir[0].status_name_th,
                en: eir[0].status_name_en
              },
              invoices: eir.invoices?.map((invoice) => ({
                id: invoice.id,
                invoice_no: invoice.invoice_no,
                invoice_date: invoice.invoice_date,
                total_amount: invoice.grand_total,
                payment_total: invoice.payment_total,
                total_with_holding_tax: invoice.total_with_holding_tax,
                status: invoice.status
              }))
            }"/>

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
    const nowEIR = eir[0]

    if (eir.invoices && eir.invoices.length > 0) {
      eir.invoices.forEach((invoice) => {
        allInvoices.push({
          form: invoice,
          equipmentInterchangeReceipt: {
            agent_code: nowEIR.agent_code || 'NON',
            client_code: nowEIR.client_code || '',
            booking_bl: nowEIR.booking_bl || '',
            container: nowEIR.container || '',
            size_type: nowEIR.size_type || '',
            vessel: nowEIR.vessel || '',
            voyage: nowEIR.voyage || '',
            truck_company: nowEIR.truck_company || '',
            driver_name: nowEIR.driver_name || '',
            truck_license: nowEIR.truck_license || ''
          }
        })
      })
    }
  })

  return allInvoices
})

// console.log(formattedInvoiceData);

const completeEIRData = ref([])

const getTotalInvoiceAmount = computed(() => {
  if (!Array.isArray(completeEIRData.value)) return 0

  return completeEIRData.value.reduce((sum, eir) => {
    if (!eir || !Array.isArray(eir.invoices)) return sum

    return (
      sum +
      eir.invoices.reduce((invoiceSum, invoice) => {
        const grandTotal = typeof invoice?.grand_total === 'number' 
          ? parseFloat(invoice.grand_total.toFixed(2)) 
          : 0
        return parseFloat((invoiceSum + grandTotal).toFixed(2))
      }, 0)
    )
  }, 0)
})

const getTotalNetAmount = computed(() => {
  if (!Array.isArray(completeEIRData.value)) return 0

  return completeEIRData.value.reduce((sum, eir) => {
    if (!eir || !Array.isArray(eir.invoices)) return sum

    return (
      sum +
      eir.invoices.reduce((invoiceSum, invoice) => {
        const paymentTotal = typeof invoice?.payment_total === 'number' 
          ? parseFloat(invoice.payment_total.toFixed(2)) 
          : 0
        return parseFloat((invoiceSum + paymentTotal).toFixed(2))
      }, 0)
    )
  }, 0)
})

const getTotalWithholdingTax = computed(() => {
  if (!Array.isArray(completeEIRData.value)) return 0

  return completeEIRData.value.reduce((sum, eir) => {
    if (!eir || !Array.isArray(eir.invoices)) return sum

    return (
      sum +
      eir.invoices.reduce((invoiceSum, invoice) => {
        const withHoldingTax = typeof invoice?.total_with_holding_tax === 'number' 
          ? parseFloat(invoice.total_with_holding_tax.toFixed(2)) 
          : 0
        return parseFloat((invoiceSum + withHoldingTax).toFixed(2))
      }, 0)
    )
  }, 0)
})


// ปรับปรุงฟังก์ชัน fetchGroupDetails
const fetchGroupDetails = async () => {
  try {
    loading.value = true
    // ดึงข้อมูล Group EIR ก่อน
    const response = await axios.get(`${CONFIG.API_SERVER}/api/group-eir/${props.groupId}`)

    if (response.data.success) {
      groupData.value = response.data.data
      console.log(response.data.data)

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
