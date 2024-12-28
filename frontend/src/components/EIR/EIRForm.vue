<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import Multiselect from 'vue-multiselect'
import CONFIG from '../../config/config'
import FlatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import ExportToPdf from '../../components/EIR/ExportToPdf.vue'
import InvoiceForm from '../../components/EIR/InvoiceForm.vue'
import AddDetentionModal from './components/AddDetentionModal.vue'
import AttachmentGallery from './components/AttachmentGallery.vue'
import TaskManager from './components/TaskManager.vue'

import moment from 'moment' // Import Moment.js

import { Thai } from 'flatpickr/dist/l10n/th.js'

const props = defineProps({
  isEditMode: Boolean,
  receiptId: Number
})

const emit = defineEmits(['formSubmitted'])
const router = useRouter()
const invoiceList = ref([])
const detentionLogs = ref([]) // เพิ่มตัวแปรสำหรับเก็บ detention logs
const currentTasks = ref([])
const submitButton = ref(null)

const handleTasksUpdated = (updatedTasks) => {
  currentTasks.value = updatedTasks
}

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

const loading = ref(true) // เพิ่มตัวแปร loading
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
const matching_eir_id = ref(null)
const activeTab = ref(0)
const isEditing = ref(false)
const editForm = ref({
  driver_name: '',
  truck_license: '',
  tel: ''
})

const startEditing = () => {
  isEditing.value = true
  editForm.value = {
    driver_name: equipmentInterchangeReceipt.value.driver_name,
    truck_license: equipmentInterchangeReceipt.value.truck_license,
    tel: equipmentInterchangeReceipt.value.tel
  }
}

const saveEdit = () => {
  equipmentInterchangeReceipt.value.driver_name = editForm.value.driver_name
  equipmentInterchangeReceipt.value.truck_license = editForm.value.truck_license
  equipmentInterchangeReceipt.value.tel = editForm.value.tel
  isEditing.value = false
}

const cancelEdit = () => {
  isEditing.value = false
}

// สร้าง computed property สำหรับจัดรูปแบบข้อมูลที่จะส่งให้ ExportToPdf
const pdfData = computed(() => ({
  0: equipmentInterchangeReceipt.value,
  tasks: currentTasks.value
}))

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

const fetchDetentionLogs = async (eirId) => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/detentionLogs?EIR_ID=${eirId}`)
    detentionLogs.value = response.data
    // console.log(detentionLogs.value);
  } catch (error) {
    console.error('Error fetching detention logs', error)
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

const config = {
  enableTime: true,
  dateFormat: 'Y-m-d H:i',
  defaultDate: new Date(),
  altInput: true,
  altFormat: 'j M Y H:i',
  locale: Thai, // กำหนด locale เป็นภาษาไทย
  thaiBuddhist: true
}

const watchSelectedColor = () => {
  if (selectedColor.value) {
    equipmentInterchangeReceipt.value.container_color = selectedColor.value.name
  } else {
    equipmentInterchangeReceipt.value.container_color = ''
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

const validateContainerNumber = async () => {
  equipmentInterchangeReceipt.value.container =
    equipmentInterchangeReceipt.value.container.toUpperCase()
  const regex = /^[A-Z]{4}\d{7}$/

  if (!regex.test(equipmentInterchangeReceipt.value.container)) {
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
        params: { container: equipmentInterchangeReceipt.value.container }
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
    equipmentInterchangeReceipt.value.yard = yard.yard_name
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

const checkRequiredFields = () => {
  let isValid = true
  let missingFields = []

  requiredFields.forEach((field) => {
    if (!equipmentInterchangeReceipt.value[field]) {
      isValid = false
      missingFields.push(fieldNames[field])
    }
  })

  if (equipmentInterchangeReceipt.value.entry_type === 'OUT') {
    if (!equipmentInterchangeReceipt.value.seal_no) {
      isValid = false
      missingFields.push(fieldNames['seal_no'])
    }
    if (
      equipmentInterchangeReceipt.value.tare == null ||
      equipmentInterchangeReceipt.value.tare === 0.0
    ) {
      isValid = false
      missingFields.push(fieldNames['tare'])
    }
  }

  if (equipmentInterchangeReceipt.value.conditions.length === 0) {
    isValid = false
    missingFields.push('สภาพอุปกรณ์')
  }

  if (!isValid) {
    Swal.fire('Error', `กรุณากรอกข้อมูลให้ครบถ้วน: ${missingFields.join(', ')}`, 'error')
  }

  return isValid
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

const fetchReceiptData = async (id) => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/EIR/get?id=${id}`)
    const receiptData = response.data[0]
    // แปลง tinyint(1) เป็น boolean
    receiptData.drop_container = receiptData.drop_container === 1
    Object.assign(equipmentInterchangeReceipt.value, receiptData)
    selectedAgent.value = agents.value.find((agent) => agent.agent_id === receiptData.agent_id)
    selectedClient.value = clients.value.find(
      (client) => client.client_id === receiptData.client_id
    )
    selectedDriver.value = drivers.value.find((drivers) => drivers.id === receiptData.driver_id)
    selectedZone.value = zones.value.find((zones) => zones.zone_id === receiptData.zone_id)
    selectedColor.value = colors.find(
      (color) => color.name === equipmentInterchangeReceipt.value.container_color
    )
    selectedYard.value = yards.value.find((yard) => yard.yard_id === receiptData.yard_id)
    conditions.value.forEach((condition) => {
      condition.checked = equipmentInterchangeReceipt.value.conditions.some(
        (c) => c.condition_id === condition.id
      )
    })
  } catch (error) {
    handleError(error, 'Error fetching equipment interchange receipt data')
  }
}

const createReceipt = async () => {
  mapSelectedToReceipt()
  if (!checkRequiredFields()) {
    return
  }

  try {
    const response = await axios.post(
      `${CONFIG.API_SERVER}/api/EIR/add`,
      equipmentInterchangeReceipt.value
    )
    Swal.fire('Success', 'สร้างข้อมูลสำเร็จ', 'success').then(async () => {
      emit('formSubmitted')
      if (matching_eir_id.value) {
        // เรียก API /api/eir_match/add
        await axios.post(`${CONFIG.API_SERVER}/api/eir_match/add`, {
          eir_in: matching_eir_id.value,
          eir_out: response.data.equipment_interchange_receipt_id,
          is_active: true
        })

        // ตรวจสอบเงื่อนไข drop_container = true และ entry_type = OUT
        if (
          equipmentInterchangeReceipt.value.drop_container &&
          equipmentInterchangeReceipt.value.entry_type === 'OUT'
        ) {
          // เรียก API /api/EIR/createInvoiceDetailsforDropOut
          await axios.post(`${CONFIG.API_SERVER}/api/EIR/createInvoiceDetailsforDropOut`, {
            equipmentId: response.data.equipment_interchange_receipt_id,
            invoiceHeaderId: response.data.invoice_id // ตรวจสอบว่ามี invoice_id ที่ถูกต้อง
          })
        }
      }
      // รีไดเรกต์ไปหน้า EIR แล้วรีเฟรชหน้าเว็บ
      router.push({ path: `/EIR/${response.data.equipment_interchange_receipt_id}` }).then(() => {
        router.go(0) // รีเฟรชหน้าเว็บ
      })
    })
  } catch (error) {
    handleError(error, 'Error creating equipment interchange receipt')
  }
}

const notMatchEIR = async () => {
  if (equipmentInterchangeReceipt.value.eir_match_no == null) {
    Swal.fire({
      title: 'คุณไม่ต้องการ Match EIR ใบนี้ ใช่หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#CCC',
      confirmButtonText: 'ใช่, ไม่ต้องการ Match',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const matchResponse = await axios.post(`${CONFIG.API_SERVER}/api/eir_match/add`, {
            eir_in: equipmentInterchangeReceipt.value.id,
            eir_out: equipmentInterchangeReceipt.value.id,
            is_active: true
          })
          Swal.fire('Success', 'สร้างข้อมูลสำเร็จ', 'success').then(async () => {
            router.go(0) // รีเฟรชหน้าเว็บ
          })
        } catch (error) {
          handleError(error, 'Error Matching EIR')
        }
      }
    })
  } else {
    Swal.fire({
      title: 'EIR ใบนี้ถูกตั้งค่า Match แล้ว',
      icon: 'info',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'ตกลง'
    })
  }
}

const formatDate = (date) => {
  return moment(date).format('DD/MM/YYYY HH:mm')
}

const updateReceipt = async () => {
  mapSelectedToReceipt()
  if (!checkRequiredFields()) {
    return
  }

  try {
    //console.log(equipmentInterchangeReceipt.value);
    await axios.put(
      `${CONFIG.API_SERVER}/api/EIR/update/${props.receiptId}`,
      equipmentInterchangeReceipt.value
    )
    Swal.fire('Success', 'อัพเดทข้อมูลสำเร็จ', 'success').then(() => {
      window.location.reload()
    })
  } catch (error) {
    handleError(error, 'Error updating equipment interchange receipt')
  }
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

const cancelReceipt = () => {
  Swal.fire({
    title: 'คุณต้องการยกเลิกใบ EIR นี้หรือไม่?',
    text: 'หากยกเลิกแล้ว ไม่สามารถแก้ไขได้',
    icon: 'warning',
    input: 'textarea',
    inputPlaceholder: 'กรุณากรอกสาเหตุในการยกเลิก...',
    inputAttributes: {
      'aria-label': 'กรุณากรอกสาเหตุในการยกเลิก'
    },
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#CCC',
    confirmButtonText: 'ใช่, ยกเลิกใบEIR',
    cancelButtonText: 'ไม่ยกเลิก',
    preConfirm: (reason) => {
      if (!reason) {
        Swal.showValidationMessage('กรุณากรอกสาเหตุในการยกเลิก')
        return false
      }
      return reason
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`${CONFIG.API_SERVER}/api/eir_match/delete`, {
          data: {
            eir_id: equipmentInterchangeReceipt.value.id,
            type: equipmentInterchangeReceipt.value.entry_type
          }
        })
        equipmentInterchangeReceipt.value.status_id = 2
        equipmentInterchangeReceipt.value.remark = result.value
        updateReceipt()
      } catch (error) {
        handleError(error, 'Error deleting EIR match')
      }
    }
  })
}

// CompleteReceipt
const CompleteReceipt = () => {
  Swal.fire({
    title: 'คุณต้องการเสร็จสิ้นใบ EIR นี้หรือไม่?',
    text: 'หากเสร็จสิ้นแล้ว ไม่สามารถแก้ไขได้',
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#CCC',
    confirmButtonText: 'ใช่, EIR นี้เสร็จสิ้นแล้ว',
    cancelButtonText: 'ไม่'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        equipmentInterchangeReceipt.value.status_id = 6
        updateReceipt()
      } catch (error) {
        handleError(error, 'Error Complete EIR')
      }
    }
  })
}

const createNewInvoice = () => {
  Swal.fire({
    title: 'คุณต้องการสร้างใบ Invoice ใหม่สำหรับ EIR นี้หรือไม่?',
    text: 'หากสร้างแล้ว ไม่สามารถย้อนกลับได้',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ใช่, สร้างใบ Invoice',
    cancelButtonText: 'ไม่สร้าง'
  }).then((result) => {
    if (result.isConfirmed) {
      createInvoiceManual()
    }
  })
}

const createInvoiceManual = async () => {
  const data = {
    equipmentId: equipmentInterchangeReceipt.value.id,
    date: equipmentInterchangeReceipt.value.date,
    agent_id: equipmentInterchangeReceipt.value.agent_id || 0,
    yard_id: equipmentInterchangeReceipt.value.yard_id || 0,
    size_type: equipmentInterchangeReceipt.value.size_type,
    entry_type: equipmentInterchangeReceipt.value.entry_type
  }

  try {
    const response = await axios.post(`${CONFIG.API_SERVER}/api/EIR/createInvoiceManual`, data)
    Swal.fire({
      title: 'สร้าง Invoice ใหม่แล้ว',
      icon: 'success'
    }).then(() => {
      window.location.reload()
    })
    // Handle the response as needed
  } catch (error) {
    console.error('Error creating invoice:', error)
    // Handle the error as needed
  }
}

// แก้ไขฟังก์ชัน disableForm
const disableForm = () => {
  document.querySelectorAll('input, select, textarea').forEach((element) => {
    element.disabled = true
  })
  if (submitButton.value) {
    submitButton.value.disabled = true
  }
}
// เพิ่มฟังก์ชันใหม่สำหรับดึงข้อมูล eir_match
const fetchEirMatch = async (entry_type) => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/eir_match/get`, {
      params: {
        entry_type: entry_type,
        eir_id: props.receiptId
      }
    })
    const matchData = response.data

    if (matchData.length > 0) {
      if (entry_type == 'IN') {
        equipmentInterchangeReceipt.value.eir_match_no = matchData[0].eir_out_no
      } else {
        equipmentInterchangeReceipt.value.eir_match_no = matchData[0].eir_in_no
      }
    } else {
      equipmentInterchangeReceipt.value.eir_match_no = null
    }
  } catch (error) {
    handleError(error, 'Error fetching EIR match data')
  }
}

const matchOut = () => {
  const initialData = {
    ...equipmentInterchangeReceipt.value,
    entry_type: 'OUT',
    receipt_no: 'เลขอัตโนมัติ', // ตั้งค่าใหม่
    date: new Date(), // ตั้งค่าใหม่
    client_id: null,
    client_code: '',
    yard_id: null,
    yard: '',
    booking_bl: '',
    remark: '',
    status_id: 1,
    status_name_th: 'แบบร่าง',
    status_name_en: 'Draft',
    remark: '',
    driver_sign: '',
    receiver_sign: '',
    create_user: null,
    create_user_name: '',
    update_user: null,
    update_user_name: '',
    truck_license: '',
    driver_id: null,
    driver_name: '',
    truck_company: '',
    tel: '',
    request_id: '',
    request_detail_id: '',
    request_type: '',
    conditions: [...equipmentInterchangeReceipt.value.conditions]
  }

  const encodedData = encodeURIComponent(JSON.stringify(initialData))

  router
    .push({
      path: '/EIR',
      query: {
        initialData: encodedData
      }
    })
    .then(() => {
      router.go(0) // รีเฟรชหน้าเว็บ
    })
}

// ฟังก์ชั่นใหม่สำหรับดึงข้อมูล invoice
async function fetchInvoiceByEirId(eirId) {
  try {
    const response = await axios.get(
      `${CONFIG.API_SERVER}/api/invoices/getInvoiceByEirId?eir_id=${eirId}`
    )
    invoiceList.value = response.data
    //console.log(invoiceList.value);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // จัดการกรณีที่สถานะเป็น 404
      console.error('ไม่พบข้อมูล Invoice (404)')
      // คุณสามารถตั้งค่า invoiceList ให้เป็นอาเรย์ว่าง หรือแสดงข้อความให้ผู้ใช้ทราบ
      invoiceList.value = []
    } else {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล Invoice:', error)
      // จัดการข้อผิดพลาดอื่น ๆ ตามความเหมาะสม
      Swal.fire('เกิดข้อผิดพลาดในการดึงข้อมูล Invoice', error.message, 'error')
    }
  }
}

function getBadgeClass(status_id) {
  if (status_id === 3) {
    return 'badge-warning'
  } else if (status_id === 4) {
    return 'badge-success'
  } else if (status_id === 5) {
    return 'badge-error'
  }
  return ''
}
// Function to handle detention saved event
const onDetentionSaved = async () => {
  await fetchDetentionLogs(props.receiptId)
}

onMounted(async () => {
  loading.value = true // เริ่มโหลดข้อมูล
  if (props.isEditMode) {
    await fetchAgents()
    await fetchClients()
    await fetchDrivers()
    await fetchYards()
    await fetchZones()
    await fetchConditions()
    await fetchReceiptData(props.receiptId)
    await fetchDetentionLogs(props.receiptId)
    // ดึงข้อมูล invoice ตาม eir_id
    await fetchInvoiceByEirId(props.receiptId)

    // ตรวจสอบและดึงข้อมูล eir_match เมื่อ entry_type เป็น IN
    if (equipmentInterchangeReceipt.value.entry_type === 'IN') {
      await fetchEirMatch('IN')
    }
    if (equipmentInterchangeReceipt.value.entry_type === 'OUT') {
      await fetchEirMatch('OUT')
    }

    if (equipmentInterchangeReceipt.value.status_id === 2) {
      disableForm()
      Swal.fire('ใบ EIR นี้ยกเลิกแล้ว', '', 'warning')
    }
    if (equipmentInterchangeReceipt.value.status_id === 6) {
      disableForm()
    }
    await fetchUserData()

    // ตั้งค่า activeTab ตาม query parameter
    const query = router.currentRoute.value.query
    if (query.inv) {
      const targetInvoice = invoiceList.value.find((invoice) => invoice.invoice_no === query.inv)
      if (targetInvoice) {
        activeTab.value = targetInvoice.invoice_id
      }
    }
  } else {
    const initialData = router.currentRoute.value.query.initialData
      ? JSON.parse(decodeURIComponent(router.currentRoute.value.query.initialData))
      : null
    if (initialData) {
      await fetchAgents()
      await fetchClients()
      await fetchDrivers()
      await fetchYards()
      await fetchZones()
      initialData.conditions = [
        {
          condition_id: 1
        }
      ]
      Object.assign(equipmentInterchangeReceipt.value, initialData)
      selectedAgent.value = agents.value.find((agent) => agent.agent_id === initialData.agent_id)
      selectedClient.value = clients.value.find(
        (client) => client.client_id === initialData.client_id
      )
      selectedDriver.value = drivers.value.find((drivers) => drivers.id === initialData.driver_id)
      selectedZone.value = zones.value.find((zones) => zones.zone_id === initialData.zone_id)
      selectedColor.value = colors.find(
        (color) => color.name === equipmentInterchangeReceipt.value.container_color
      )
      selectedYard.value = yards.value.find((yard) => yard.yard_id === initialData.yard_id)
      equipmentInterchangeReceipt.value.date = config.defaultDate
      matching_eir_id.value = initialData.id
      await fetchUserData()
      await fetchConditions()
      console.log(equipmentInterchangeReceipt)
      conditions.value.forEach((condition) => {
        condition.checked = equipmentInterchangeReceipt.value.conditions.some(
          (c) => c.condition_id === condition.id
        )
      })
    } else {
      await fetchUserData()
      fetchAgents()
      fetchClients()
      fetchDrivers()
      fetchYards()
      fetchZones()
      await fetchConditions()
      equipmentInterchangeReceipt.value.date = config.defaultDate
      conditions.value.forEach((condition) => {
        condition.checked = equipmentInterchangeReceipt.value.conditions.some(
          (c) => c.condition_id === condition.id
        )
      })
    }
  }
  loading.value = false // เสร็จสิ้นการโหลดข้อมูล
})
</script>

<template>
  <div class="relative">
    <div
      v-if="loading"
      class="absolute inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center z-50"
    >
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div class="tab-container">
      <div
        role="tablist"
        class="tabs tabs-bordered flex justify-start overflow-x-auto whitespace-nowrap"
      >
        <a
          role="tab"
          class="tab inline text-primary"
          :class="{ 'tab-active': activeTab === 0 }"
          @click="activeTab = 0"
        >
          <div class="badge badge-primary badge-xs"></div>
          ใบ EIR
        </a>
        <a
          v-for="invoice in invoiceList"
          :key="invoice.invoice_id"
          role="tab"
          class="tab inline text-secondary"
          :class="{ 'tab-active': activeTab === invoice.invoice_id }"
          @click="activeTab = invoice.invoice_id"
        >
          <div :class="getBadgeClass(invoice.status_id)" class="badge badge-xs"></div>
          {{ invoice.invoice_no }}
        </a>
        <a
          v-if="isEditMode"
          role="tab"
          class="tab inline text-neutral-content"
          @click="createNewInvoice"
        >
          <i class="fa-solid fa-circle-plus"></i> สร้าง Invoice เพิ่ม
        </a>
      </div>
    </div>

    <div v-show="activeTab === 0" class="bg-base-100 border-base-300 rounded-box p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="text-center flex-grow">
          <h2 class="text-2xl font-bold">
            {{ isEditMode ? 'แก้ไขข้อมูล EIR' : 'สร้างข้อมูลใหม่' }}
          </h2>
          <div v-if="isEditMode">
            <div v-for="log in detentionLogs" :key="log.id">
              <span class="text-base text-error subpixel-antialiased"
                >Detention : {{ formatDate(log.detention_datetime) }}</span
              >
            </div>
          </div>
        </div>
        <div
          v-if="
            isEditMode &&
            equipmentInterchangeReceipt.entry_type === 'IN' &&
            !equipmentInterchangeReceipt.eir_match_no
          "
        >
          <add-detention-modal :eirId="props.receiptId" @detentionSaved="onDetentionSaved" />
        </div>
        <div v-if="isEditMode">
          <ExportToPdf :items="pdfData" />
        </div>

        <div v-if="isEditMode" class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost m-1">
            <i class="fa-solid fa-bars"></i>
          </div>
          <ul
            tabindex="0"
            class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a @click="createNewInvoice"
                ><i class="fa-solid fa-file-circle-plus"></i> เพิ่มใบ Invoice ใหม่</a
              >
            </li>
            <li>
              <a @click="notMatchEIR"><i class="fa-solid fa-not-equal"></i> ไม่ Match EIR ใบนี้</a>
            </li>
            <div class="divider my-1"></div>
            <li><a @click="cancelReceipt">ยกเลิก</a></li>
          </ul>
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
            class="absolute top-0 right-0 left-0 p-2 flex justify-between bg-white bg-opacity-40 backdrop-blur-sm"
          >
            <div class="flex gap-2">
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

            <div>
              <router-link
                v-if="equipmentInterchangeReceipt.group_code"
                :to="'/eirGroupView/' + equipmentInterchangeReceipt.group_id"
                class="px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-sm bg-gradient-to-r from-blue-500 to-blue-600 flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                {{ equipmentInterchangeReceipt.group_code }}
              </router-link>
            </div>
          </div>

          <!-- Main Content with Increased Top Padding -->
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
                :readonly="props.isEditMode"
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
                :disabled="props.isEditMode"
              />
            </div>

            <!-- Entry Type -->
            <div class="w-full md:w-1/4 px-2 mb-4">
              <label class="block mb-2 text-sm font-medium" for="entry_type">
                ประเภท/Type<span class="text-error font-bold">*</span>
              </label>
              <select
                v-model="equipmentInterchangeReceipt.entry_type"
                class="input input-bordered w-full text-sm bg-white bg-opacity-70 backdrop-blur-sm"
                id="entry_type"
                :disabled="props.isEditMode"
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
                      :disabled="props.isEditMode"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Match EIR Section -->
            <div
              v-if="isEditMode"
              class="w-full px-4 md:w-2/4 ms-10 mb-4 flex items-center justify-end"
            >
              <div v-if="equipmentInterchangeReceipt.eir_match_no">
                <label class="block text-sm font-medium" for="eir_match_no">Matching EIR No.</label>
                <div
                  v-if="
                    equipmentInterchangeReceipt.eir_match_no ==
                    equipmentInterchangeReceipt.receipt_no
                  "
                >
                  <span class="text-sm text-error">ไม่ Match EIR ใบนี้</span>
                </div>
                <div v-else>
                  <input
                    v-model="equipmentInterchangeReceipt.eir_match_no"
                    class="input w-full text-sm text-error bg-white bg-opacity-70 backdrop-blur-sm"
                    type="text"
                    id="eir_match_no"
                    autocomplete="off"
                    readonly
                  />
                </div>
              </div>
              <div v-else>
                <button
                  class="btn btn-primary text-sm shadow-md hover:shadow-lg transition-all"
                  @click="matchOut"
                >
                  {{ equipmentInterchangeReceipt.drop_container ? 'Drop' : 'Match' }} ตู้ Out
                </button>
              </div>
              <button
                v-if="equipmentInterchangeReceipt.status_id == 1"
                class="ms-5 btn btn-outline btn-success shadow-md hover:shadow-lg transition-all"
                @click="CompleteReceipt"
              >
                เสร็จสิ้นแล้ว
              </button>
              <span
                v-if="equipmentInterchangeReceipt.status_id == 6"
                class="ms-5 text-success subpixel-antialiased text-lg font-bold"
              >
                เสร็จสิ้นแล้ว
              </span>
            </div>
          </div>
        </div>

        <!-- กลุ่มที่ 2 -->
        <div class="box mb-6 p-4 border rounded-lg">
          <div class="flex flex-wrap -mx-2">
            <div class="w-full md:w-1/2 px-2 mb-4">
              <label class="block mb-2 text-sm" for="agent">
                ตัวแทน/Agent <span class="text-error font-bold"> *</span></label
              >
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
                ลูกค้า/Shipper <span class="text-error font-bold"> *</span></label
              >
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
                ลานเดิม/Original Yard <span class="text-error font-bold"> *</span></label
              >
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
                Booking/BL <span class="text-error font-bold"> *</span></label
              >
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

        <!-- กลุ่มที่ 3 -->
        <div class="box mb-6 p-4 border rounded-lg">
          <div class="flex flex-wrap -mx-2">
            <div class="w-full md:w-1/3 px-2 mb-4">
              <label class="block mb-2 text-sm" for="container">
                หมายเลขตู้/Container No. <span class="text-error font-bold"> *</span></label
              >
              <input
                v-model="equipmentInterchangeReceipt.container"
                class="input input-bordered w-full text-sm"
                type="text"
                id="container"
                autocomplete="off"
                @blur="validateContainerNumber"
              />
            </div>
            <div class="w-full md:w-1/3 px-2 mb-4">
              <label class="block mb-2 text-sm" for="container_color"> สีตู้/Color </label>
              <multiselect
                v-model="selectedColor"
                :options="colors"
                label="name"
                track-by="name"
                @update:modelValue="watchSelectedColor"
                class="text-sm"
                placeholder="เลือกสีตู้"
              >
                <template #option="{ option }">
                  <span
                    class="inline-block w-4 h-4 rounded-full mr-2"
                    :style="{ backgroundColor: option.color }"
                  ></span>
                  {{ option.name }}
                </template>
                <template #singleLabel="{ option }">
                  <span
                    class="inline-block w-4 h-4 rounded-full mr-2"
                    :style="{ backgroundColor: option.color }"
                  ></span>
                  {{ option.name }}
                </template>
              </multiselect>
            </div>

            <div class="w-full md:w-1/3 px-2 mb-4">
              <label class="block mb-2 text-sm" for="size_type">
                ขนาดและประเภท/Size <span class="text-error font-bold"> *</span></label
              >
              <multiselect
                v-model="equipmentInterchangeReceipt.size_type"
                :options="sizeOptions"
                class="text-sm"
                placeholder="เลือกขนาดและประเภท"
              />
            </div>

            <div class="w-full md:w-1/3 px-2 mb-4">
              <label class="block mb-2 text-sm" for="seal_no">
                หมายเลขซีล/Seal No.
                <span
                  v-if="equipmentInterchangeReceipt.entry_type == 'OUT'"
                  class="text-error font-bold"
                >
                  *</span
                ></label
              >
              <input
                v-model="equipmentInterchangeReceipt.seal_no"
                class="input input-bordered w-full text-sm"
                type="text"
                id="seal_no"
                autocomplete="off"
              />
            </div>
            <div class="w-full md:w-1/3 px-2 mb-4">
              <label class="block mb-2 text-sm" for="vessel"> เรือ/Vassel </label>
              <input
                v-model="equipmentInterchangeReceipt.vessel"
                class="input input-bordered w-full text-sm"
                type="text"
                id="vessel"
                autocomplete="off"
              />
            </div>
            <div class="w-full md:w-1/3 px-2 mb-4">
              <label class="block mb-2 text-sm" for="tare">
                น้ำหนักตู้เปล่า/Tare
                <span
                  v-if="equipmentInterchangeReceipt.entry_type == 'OUT'"
                  class="text-error font-bold"
                >
                  *</span
                ></label
              >
              <label class="input input-bordered flex items-center gap-2">
                <input
                  v-model="equipmentInterchangeReceipt.tare"
                  type="text"
                  id="tare"
                  autocomplete="off"
                  class="grow"
                  placeholder="Search"
                />
                <span>Kg</span>
              </label>
            </div>
            <div class="w-full md:w-1/3 px-2 mb-4">
              <label class="block mb-2 text-sm" for="voyage"> เที่ยวเรือ/Voyage </label>
              <input
                v-model="equipmentInterchangeReceipt.voyage"
                class="input input-bordered w-full text-sm"
                type="text"
                id="voyage"
                autocomplete="off"
              />
            </div>
          </div>
        </div>

        <!-- Attachment -->
        <div v-if="isEditMode" class="box mb-6 p-4 rounded-lg">
          <div class="flex flex-wrap -mx-2">
            <div class="w-full">
              <AttachmentGallery
                v-if="equipmentInterchangeReceipt.entry_type !== ''"
                :type="equipmentInterchangeReceipt.entry_type"
                :relate-eir="props.receiptId"
              />
            </div>
          </div>
        </div>
        <div role="tablist" class="tabs tabs-lifted mb-6">
          <input
            type="radio"
            name="my_tabs_2"
            role="tab"
            class="tab"
            aria-label="คนขับ"
            checked="checked"
          />
          <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
            <!-- กลุ่มที่ 4 -->
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
                      <span
                        ><img
                          :src="option.driver_image_path"
                          class="inline-block w-6 h-6 rounded-full mr-2"
                        />
                        {{ option.label }}</span
                      >
                    </template>
                    <template #singleLabel="{ option }">
                      <span
                        ><img
                          :src="option.driver_image_path"
                          class="inline-block w-6 h-6 rounded-full mr-2"
                        />
                        {{ option.label }}</span
                      >
                    </template>
                  </multiselect>
                </div>
                <div class="w-full md:w-2/3 px-2 mb-4">
                  <div v-if="selectedDriver" class="card card-side bg-base-100 shadow-sm relative">
                    <button
                      @click="startEditing"
                      class="btn btn-sm btn-outline btn-neutral absolute top-2 right-2"
                    >
                      <i class="fas fa-edit"></i> แก้ไข
                    </button>
                    <figure>
                      <img :src="selectedDriver.driver_image_path" alt="Truck" class="w-64" />
                    </figure>
                    <div class="card-body">
                      <h2 class="card-title">
                        <span v-if="!isEditing">{{ equipmentInterchangeReceipt.driver_name }}</span>
                        <input v-else v-model="editForm.driver_name" class="input input-bordered" />
                      </h2>
                      <p>
                        ทะเบียนรถบรรทุก:
                        <span v-if="!isEditing">{{
                          equipmentInterchangeReceipt.truck_license
                        }}</span>
                        <input
                          v-else
                          v-model="editForm.truck_license"
                          class="input input-bordered"
                        />
                      </p>
                      <p>รหัสคนขับ: {{ selectedDriver.id }}</p>
                      <p>บริษัทขนส่ง: {{ selectedDriver.truck_company_name }}</p>
                      <p>
                        เบอร์โทร:
                        <span v-if="!isEditing">{{ equipmentInterchangeReceipt.tel }}</span>
                        <input v-else v-model="editForm.tel" class="input input-bordered" />
                      </p>
                      <div v-if="isEditing" class="mt-4">
                        <button @click="saveEdit" class="btn btn-sm btn-success mr-2">
                          เปลี่ยน
                        </button>
                        <button @click="cancelEdit" class="btn btn-sm btn-error">ยกเลิก</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <input
            v-if="isEditMode"
            type="radio"
            name="my_tabs_2"
            role="tab"
            class="tab"
            aria-label="สั่งงาน"
          />
          <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
            <TaskManager
              v-if="equipmentInterchangeReceipt.id"
              :eirId="equipmentInterchangeReceipt.id"
              @tasksSaved="fetchEIRTasks"
              @tasksUpdated="handleTasksUpdated"
            />
          </div>
        </div>

        <!-- กลุ่มที่ 5 -->
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
                      <span class="label-text ms-3"
                        ><span class="text-base">{{ condition.name_en }}</span>
                        <span class="text-xs text-slate-700">{{ condition.name_th }}</span></span
                      >
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

        <!-- กลุ่มที่ 6 -->
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

        <!-- กลุ่มที่ 7 
                <div class="box mb-6 p-4 border rounded-lg">
                    <div class="flex flex-wrap -mx-2">
                        <div class="w-full md:w-1/2 px-2 mb-4">
                            <label class="block mb-2 text-sm" for="driver_sign"> ลายเซ็นคนขับ </label>
                            <input v-model="equipmentInterchangeReceipt.driver_sign"
                                class="input input-bordered w-full text-sm" type="text" id="driver_sign"
                                autocomplete="off" />
                        </div>
                        <div class="w-full md:w-1/2 px-2 mb-4">
                            <label class="block mb-2 text-sm" for="receiver_sign"> ลายเซ็นผู้รับ </label>
                            <input v-model="equipmentInterchangeReceipt.receiver_sign"
                                class="input input-bordered w-full text-sm" type="text" id="receiver_sign"
                                autocomplete="off" />
                        </div>
                    </div>
                </div>
                -->
        <div class="flex items-center justify-end">
          <button
            ref="submitButton"
            class="btn btn-primary text-sm"
            type="button"
            @click="isEditMode ? updateReceipt() : createReceipt()"
          >
            {{ isEditMode ? 'อัปเดตข้อมูล' : 'สร้างข้อมูล' }}
          </button>
        </div>
      </form>
    </div>

    <div
      v-for="invoice in invoiceList"
      :key="invoice.invoice_id"
      v-show="activeTab === invoice.invoice_id"
      class="bg-base-100 border-base-300 rounded-box p-6"
    >
      <InvoiceForm
        v-if="!loading"
        :equipmentInterchangeReceipt="equipmentInterchangeReceipt"
        :invoiceId="invoice.invoice_id"
      />
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    colorLabel(option) {
      return `<span class="inline-block w-4 h-4 rounded-full" style="background-color: ${option.color};"></span> ${option.name}`
    }
  }
}
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
