<template>
  <div class="container mx-auto p-2 box mb-6 border rounded-lg">
    <div class="flex justify-between items-center mb-2">
      <div>
        <h2 class="text-2xl font-bold text-secondary">Invoice No: {{ form.invoice_no }}</h2>
        <p class="text-m text-gray-600">วันที่ : {{ formattedInvoiceDate }}</p>
      </div>

      <div class="flex justify-between items-center">
        <ExportInvoiceToPDF
          :invoice-data="[
            {
              form: form,
              equipmentInterchangeReceipt: equipmentInterchangeReceipt
            }
          ]"
        />

        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost m-1">
            <i class="fa-solid fa-bars"></i>
          </div>
          <ul
            tabindex="0"
            class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li @click="confirmCancelInvoice">
              <a><i class="fa-solid fa-times"></i> ยกเลิก Invoice</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <form class="space-y-4">
      <div class="flex justify-between items-center flex-wrap">
        <div>
          <label class="block text-gray-700 text-sm mb-2">Invoice Language:</label>
          <div class="flex items-center space-x-4">
            <label class="inline-flex items-center">
              <input v-model="form.invoice_language" type="radio" value="TH" class="radio" />
              <span class="ml-2 text-sm">TH</span>
            </label>
            <label class="inline-flex items-center">
              <input v-model="form.invoice_language" type="radio" value="ENG" class="radio" />
              <span class="ml-2 text-sm">ENG</span>
            </label>
          </div>
        </div>
        <div class="flex justify-center items-center flex-wrap">
          <ul v-if="form.status_id === 3" class="timeline timeline-vertical lg:timeline-horizontal">
            <li>
              <div class="timeline-start timeline-box text-xs sm:text-sm">สร้าง Invoice</div>
              <div class="timeline-middle">
                <i class="fa-solid fa-circle-check text-success text-xs sm:text-sm"></i>
              </div>
              <hr class="bg-success" />
            </li>
            <li>
              <hr class="bg-success" />
              <div class="timeline-start timeline-box bg-warning text-xs sm:text-sm">รอชำระ</div>
              <div class="timeline-middle">
                <i class="fa-solid fa-circle-check text-success text-xs sm:text-sm"></i>
              </div>
              <hr />
            </li>
            <li>
              <hr />
              <a
                class="timeline-start timeline-box btn btn-outline btn-success btn-xs sm:btn-sm text-xs sm:text-sm"
                @click="confirmPayment()"
                >ชำระแล้ว</a
              >
              <div class="timeline-middle">
                <i class="fa-solid fa-circle-check text-base-300 text-xs sm:text-sm"></i>
              </div>
            </li>
          </ul>
          <ul v-if="form.status_id === 4" class="timeline timeline-vertical lg:timeline-horizontal">
            <li>
              <div class="timeline-start timeline-box text-xs sm:text-sm">สร้าง Invoice</div>
              <div class="timeline-middle">
                <i class="fa-solid fa-circle-check text-success text-xs sm:text-sm"></i>
              </div>
              <hr class="bg-success" />
            </li>
            <li>
              <hr class="bg-success" />
              <div class="timeline-start timeline-box text-xs sm:text-sm">รอชำระ</div>
              <div class="timeline-middle">
                <i class="fa-solid fa-circle-check text-success text-xs sm:text-sm"></i>
              </div>
              <hr class="bg-success" />
            </li>
            <li>
              <hr class="bg-success" />
              <a class="timeline-start timeline-box bg-success text-xs sm:text-sm">ชำระแล้ว</a>
              <div class="timeline-middle">
                <i class="fa-solid fa-circle-check text-success text-xs sm:text-sm"></i>
              </div>
            </li>
          </ul>
          <ul v-if="form.status_id === 5" class="timeline timeline-vertical lg:timeline-horizontal">
            <li>
              <div class="timeline-start timeline-box text-base-300 text-xs sm:text-sm">
                สร้าง Invoice
              </div>
              <div class="timeline-middle">
                <i class="fa-solid fa-circle-check text-error text-xs sm:text-sm"></i>
              </div>
              <hr class="bg-error" />
            </li>
            <li>
              <hr class="bg-error" />
              <div class="timeline-start timeline-box text-base-300 text-xs sm:text-sm">รอชำระ</div>
              <div class="timeline-middle">
                <i class="fa-solid fa-circle-check text-error text-xs sm:text-sm"></i>
              </div>
              <hr class="bg-error" />
            </li>
            <li>
              <hr class="bg-error" />
              <a class="timeline-start timeline-box bg-error text-xs sm:text-sm">ยกเลิก</a>
              <div class="timeline-middle">
                <i class="fa-solid fa-circle-check text-error text-xs sm:text-sm"></i>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="form.invoice_language === 'TH'">
        <div class="flex flex-wrap -mx-2 mb-4">
          <div class="w-full md:w-1/2 px-2">
            <label for="customer_name" class="block text-gray-700 text-sm mb-2">ชื่อลูกค้า:</label>
            <div class="join w-full">
              <input
                v-model="form.customer_name"
                id="customer_name"
                type="text"
                class="input input-bordered w-full text-sm join-item"
              />
              <a class="btn join-item btn-outline rounded-btn" @click="openCustomerModal"
                >เปลี่ยนลูกค้า</a
              >
            </div>
          </div>
          <div class="w-full md:w-1/2 px-2">
            <label for="payment_method" class="block text-gray-700 text-sm mb-2"
              >วิธีการชำระเงิน:</label
            >
            <div class="flex items-center space-x-4">
              <label class="inline-flex items-center">
                <input
                  v-model="form.payment_method"
                  type="radio"
                  value="เงินสด/โอน"
                  class="radio"
                />
                <span class="ml-2 text-sm">เงินสด/โอน</span>
              </label>
              <label class="inline-flex items-center">
                <input v-model="form.payment_method" type="radio" value="เครดิต" class="radio" />
                <span class="ml-2 text-sm">เครดิต</span>
              </label>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap -mx-2 mb-4">
          <div class="mb-4 w-full md:w-1/2 px-2">
            <label for="customer_address" class="block text-gray-700 text-sm mb-2"
              >ที่อยู่ลูกค้า:</label
            >
            <textarea
              v-model="form.customer_address"
              id="customer_address"
              class="textarea textarea-bordered w-full text-sm h-24"
            ></textarea>
          </div>
          <div class="w-full md:w-1/3 px-2">
            <label for="customer_address_branch" class="block text-gray-700 text-sm mb-2"
              >สาขาลูกค้า:</label
            >
            <input
              v-model="form.customer_address_branch"
              id="customer_address_branch"
              type="text"
              class="input input-bordered w-full text-sm"
            />
          </div>
        </div>
        <div class="flex flex-wrap -mx-2 mb-4">
          <div class="w-full md:w-1/3 px-2">
            <label for="tax_id" class="block text-gray-700 text-sm mb-2"
              >เลขประจำตัวผู้เสียภาษี:</label
            >
            <input
              v-model="form.tax_id"
              id="tax_id"
              type="text"
              class="input input-bordered w-full text-sm"
            />
          </div>
          <div class="w-full md:w-1/2 px-2">
            <label for="note" class="block text-gray-700 text-sm mb-2">หมายเหตุ:</label>
            <input
              v-model="form.note"
              id="note"
              type="text"
              class="input input-bordered w-full text-sm"
            />
          </div>
        </div>
      </div>

      <div v-else>
        <div class="flex flex-wrap -mx-2 mb-4">
          <div class="w-full md:w-1/2 px-2">
            <label for="customer_name_eng" class="block text-gray-700 text-sm mb-2"
              >Customer Name:</label
            >
            <div class="join w-full">
              <input
                v-model="form.customer_name_eng"
                id="customer_name_eng"
                type="text"
                class="input input-bordered w-full text-sm join-item"
              />
              <a class="btn join-item btn-outline rounded-btn" @click="openCustomerModal"
                >เปลี่ยนลูกค้า</a
              >
            </div>
          </div>
          <div class="w-full md:w-1/2 px-2">
            <label for="payment_method" class="block text-gray-700 text-sm mb-2"
              >Payment Method:</label
            >
            <div class="flex items-center space-x-4">
              <label class="inline-flex items-center">
                <input
                  v-model="form.payment_method"
                  type="radio"
                  value="เงินสด/โอน"
                  class="radio"
                />
                <span class="ml-2 text-sm">เงินสด/โอน</span>
              </label>
              <label class="inline-flex items-center">
                <input v-model="form.payment_method" type="radio" value="เครดิต" class="radio" />
                <span class="ml-2 text-sm">เครดิต</span>
              </label>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap -mx-2 mb-4">
          <div class="mb-4 w-full md:w-1/2 px-2">
            <label for="customer_address_eng" class="block text-gray-700 text-sm mb-2"
              >Customer Address:</label
            >
            <textarea
              v-model="form.customer_address_eng"
              id="customer_address_eng"
              class="textarea textarea-bordered w-full text-sm h-24"
            ></textarea>
          </div>
          <div class="w-full md:w-1/3 px-2">
            <label for="customer_address_branch_eng" class="block text-gray-700 text-sm mb-2"
              >Customer Branch:</label
            >
            <input
              v-model="form.customer_address_branch_eng"
              id="customer_address_branch_eng"
              type="text"
              class="input input-bordered w-full text-sm"
            />
          </div>
        </div>
        <div class="flex flex-wrap -mx-2 mb-4">
          <div class="w-full md:w-1/3 px-2">
            <label for="tax_id" class="block text-gray-700 text-sm mb-2">Tax ID:</label>
            <input
              v-model="form.tax_id"
              id="tax_id"
              type="text"
              class="input input-bordered w-full text-sm"
            />
          </div>
          <div class="w-full md:w-1/2 px-2">
            <label for="note" class="block text-gray-700 text-sm mb-2">Note:</label>
            <input
              v-model="form.note"
              id="note"
              type="text"
              class="input input-bordered w-full text-sm"
            />
          </div>
        </div>
      </div>
      <div class="tab-container">
        <InvoiceDetailItem
          v-if="!is_invoice_load"
          :detail-items="form.detail"
          :form="form"
          :equipmentInterchangeReceipt="equipmentInterchangeReceipt"
          @remove-detail="removeDetail"
          @add-item="addItem"
          :invoice_no="form.invoice_no"
          :invoice_id="form.id"
        />
      </div>
      <div class="flex justify-end items-center mb-6">
        <button type="button" @click="updateInvoice" class="btn btn-primary w-full md:w-auto">
          อัพเดทเอกสาร
        </button>
      </div>

      <div></div>
    </form>
    <!-- Modal -->
    <dialog :id="'customerModal_' + form.id" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">เลือกชื่อลูกค้า</h3>
        <div class="h-48">
          <Multiselect
            v-model="selectedCustomer"
            :options="clients"
            label="name"
            track-by="client_code"
            placeholder="เลือกชื่อลูกค้า"
          />
        </div>
        <div class="modal-action">
          <button class="btn" @click="closeCustomerModal">ปิด</button>
          <button class="btn btn-success" @click="confirmCustomerChange">ตกลง</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import moment from 'moment'
import Swal from 'sweetalert2'
import Multiselect from 'vue-multiselect'
import CONFIG from '../../config/config'
import InvoiceDetailItem from './InvoiceDetailItem.vue'
import ExportInvoiceToPDF from '../../components/EIR/ExportInvoiceToPDF.vue'

const props = defineProps({
  equipmentInterchangeReceipt: Object,
  invoiceId: Number
})

const is_invoice_load = ref(true)
const form = ref({
  id: 0,
  invoice_no: '',
  invoice_date: '',
  client_id: 0,
  customer_name: '',
  customer_name_eng: '',
  customer_address: '',
  customer_address_eng: '',
  customer_address_branch: '',
  customer_address_branch_eng: '',
  tax_id: '',
  invoice_language: 'TH',
  agent_id: 0,
  agent_code: '',
  driver_id: 0,
  driver: '',
  truck_license: '',
  truck_company: '',
  container: '',
  size_type: '',
  shipper: '',
  vessel: '',
  voyage: '',
  booking_bl: '',
  yard_id: 0,
  yard: '',
  total_amount: 0,
  vat_amount: 0,
  total_with_holding_tax: 0,
  total_discount: 0,
  net_total: 0,
  grand_total: 0,
  payment_total: 0,
  status_id: 0,
  status: '',
  wht_status: 0,
  note: '',
  payment_method: '',
  create_user: 0,
  create_datetime: '',
  update_user: 0,
  update_datetime: '',
  eir_id: 0,
  detail: []
})

const formattedInvoiceDate = computed(() => {
  return moment(form.value.invoice_date).format('DD/MM/YYYY')
})

const clients = ref([])
const selectedCustomer = ref(null)

const loadClients = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/client/get?active=true`)
    clients.value = response.data.map((client) => ({
      client_id: client.client_id,
      client_code: client.client_code,
      name: client.name,
      name_eng: client.name_eng,
      address: client.address,
      address_eng: client.billing_address_eng,
      branch: client.branch,
      branch_eng: client.branch_eng,
      tax_id: client.tax_id
    }))
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

const loadInvoiceData = async () => {
  try {
    const response = await axios.get(
      `${CONFIG.API_SERVER}/api/invoices/get?id=${props.invoiceId}&eir_id=${props.equipmentInterchangeReceipt.id}`
    )
    const invoice = response.data[0] // Assuming we only get one invoice
    form.value = {
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
    }
    is_invoice_load.value = false
  } catch (error) {
    console.error('Error fetching invoice data:', error)
  }
}

const removeDetail = (index) => {
  form.value.detail.splice(index, 1)
}

const addItem = (item) => {
  item.invoice_header_id = form.value.id
  form.value.detail.push(item)
}

const confirmPayment = () => {
  Swal.fire({
    title: 'ยืนยันการชำระเงิน',
    text: 'คุณต้องการยืนยันการชำระเงินหรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      updateInvoiceStatus(4, 'ชำระแล้ว')
    }
  })
}

const confirmCancelInvoice = () => {
  Swal.fire({
    title: 'คุณต้องการยกเลิก Invoice ใช่หรือไม่?',
    text: 'หากยกเลิกแล้ว ไม่สามารถแก้ไขได้',
    icon: 'warning',
    input: 'textarea',
    inputPlaceholder: 'กรุณากรอกสาเหตุในการยกเลิก...',
    inputAttributes: {
      'aria-label': 'กรุณากรอกสาเหตุในการยกเลิก'
    },
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#ccc',
    confirmButtonText: 'ยืนยันยกเลิก Invoice',
    cancelButtonText: 'ไม่',
    preConfirm: (reason) => {
      if (!reason) {
        Swal.showValidationMessage('กรุณากรอกสาเหตุในการยกเลิก')
        return false
      }
      return reason
    }
  }).then((result) => {
    if (result.isConfirmed) {
      if (form.value.note) {
        form.value.note += '\nยกเลิกเนื่องจาก: ' + result.value
      } else {
        form.value.note = 'ยกเลิกเนื่องจาก: ' + result.value
      }
      updateInvoiceStatus(5, 'ยกเลิก')
    }
  })
}

const updateInvoiceStatus = (status_id, status_text) => {
  form.value.status_id = status_id
  form.value.status = status_text
  updateInvoice()
}

const updateInvoice = async () => {
  //console.log(form.value);
  try {
    await axios.put(`${CONFIG.API_SERVER}/api/invoices/update/${form.value.id}`, form.value)
    Swal.fire({
      title: 'สำเร็จ!',
      text: 'อัพเดท Invoice เสร็จสิ้น',
      icon: 'success',
      confirmButtonText: 'OK'
    }).then(() => {
      loadInvoiceData()
    })
  } catch (error) {
    console.error('Error updating invoice:', error)
    Swal.fire({
      title: 'เกิดข้อผิดพลาด',
      text: 'Error updating invoice',
      icon: 'error',
      confirmButtonText: 'OK'
    })
  }
}

const openCustomerModal = () => {
  document.getElementById(`customerModal_${form.value.id}`).showModal()
}

const closeCustomerModal = () => {
  document.getElementById(`customerModal_${form.value.id}`).close()
}

const confirmCustomerChange = () => {
  if (selectedCustomer.value) {
    form.value.client_id = selectedCustomer.value.client_id
    form.value.customer_name = selectedCustomer.value.name
    form.value.customer_name_eng = selectedCustomer.value.name_eng
    form.value.customer_address = selectedCustomer.value.address
    form.value.customer_address_eng = selectedCustomer.value.address_eng
    form.value.customer_address_branch = selectedCustomer.value.branch
    form.value.customer_address_branch_eng = selectedCustomer.value.branch_eng
    form.value.tax_id = selectedCustomer.value.tax_id
  }
  closeCustomerModal()
  updateInvoice()
}

onMounted(() => {
  loadInvoiceData()
  loadClients()
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
</style>
