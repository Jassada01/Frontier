<template>
  <div class="relative inline-block text-left">
    <div class="flex">
      <div class="join">
        <!-- ปุ่ม Preview -->
        <button @click="generatePDF(true)" class="btn btn-ghost btn-sm join-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
            />
          </svg>
          EIR
        </button>

        <!-- ปุ่มแสดงเมนู -->
        <button @click="toggleDropdown" class="btn btn-ghost btn-sm join-item">
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
      <button
        @click="handleDownloadClick"
        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <i class="fa-solid fa-file-arrow-down text-xl"></i> ดาวน์โหลด PDF
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { jsPDF } from 'jspdf'
// moment ถ้าไม่ต้องใช้ก็ลบออกได้ค่ะ
import moment from 'moment'

// นำเข้าฟอนต์และ checkmark base64
import font_config from '../../config/font_config'
// ตรงนี้เปลี่ยนเป็น path ของรูป template ใหม่ A5 landscape
import eirTemplateImage from '../../assets/media/pdf_template/eir_template_a5.png'

// state ของ dropdown
const openDropdown = ref(false)

// Props รับข้อมูล container/tasks
const props = defineProps({
  items: {
    type: [Object, Array],
    required: true,
    validator: (value) => {
      if (!Array.isArray(value)) {
        return typeof value === 'object' && value !== null
      }
      return value.every(
        (item) => typeof item === 'object' && item !== null && '0' in item && 'tasks' in item
      )
    }
  }
})

// แปลงข้อมูลเป็นรูปแบบที่ใช้ได้ง่าย
const processedItems = computed(() => {
  if (!Array.isArray(props.items)) {
    return {
      data: props.items['0'],
      tasks: props.items.tasks || []
    }
  }
  return props.items.map((item) => ({
    data: item['0'],
    tasks: item.tasks || []
  }))
})


function toggleDropdown() {
  openDropdown.value = !openDropdown.value
}

function handleDownloadClick() {
  generatePDF(false)
}

function formatNumberValue(numValue) {
  if (!isNaN(numValue)) {
    return Number(numValue).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  } else {
    return ''
  }
}

// check icon เป็น base64
const checkSVGBase64 = `data:image/png;base64,${font_config.check_png}`

// ฟังก์ชันเพิ่มเครื่องหมายถูก
function generateCheckMarkObject(doc, entryType, dropContainer) {
  // ตัวอย่างการวาง checkbox
  doc.setFontSize(32)
  doc.setFont('times', 'bold') // ใช้ Helvetica ตัวหนา

  doc.text(entryType || '-', 85, 96, { align: 'center' })

  /*
  if (entryType === 'IN') {
    // ตัวอย่างตำแหน่ง (x=40, y=60) ปรับตามเทมเพลตจริง
    //doc.addImage(checkSVGBase64, 'PNG', 40, 60, 15, 15)
  } else if (entryType === 'OUT') {
    //doc.addImage(checkSVGBase64, 'PNG', 40, 86, 15, 15)
    doc.text(entryType || '-', 85, 96, { align: 'center' })
  }
  */

  if (dropContainer) {
    doc.addImage(checkSVGBase64, 'PNG', 63, 102, 15, 15)
  }
  doc.setFont('THSarabunNew', 'normal')
}

// ฟังก์ชันสร้าง PDF สำหรับ container 1 ชุด
const generateSinglePDF = (doc, data, tasks) => {
  const image = new Image()
  image.src = eirTemplateImage

  const addPage = (pageType = 'Original') => {
    // เพิ่มรูป template เต็มหน้ากระดาษ A5 (landscape)
    // หน้ากระดาษ A5 แนวนอน: 595(width) x 420(height) โดยประมาณ
    doc.addImage(image, 'PNG', 0, 0, 595, 420)

    // นำเข้าฟอนต์ TH Sarabun New
    doc.addFileToVFS('THSarabunNew.ttf', font_config.thSarabunBBase64)
    doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal')
    doc.setFont('THSarabunNew')
    doc.setFontSize(14)

    // เพิ่มเครื่องหมาย check ถ้าจำเป็น
    generateCheckMarkObject(doc, data.entry_type, data.drop_container)
    doc.setFontSize(14)
    // มุมบนขวา ลองไว้เป็นเลขที่ / วันเวลา
    /*
    if (pageType === 'Original') {
      doc.setTextColor(40, 40, 244)
      doc.text('(ต้นฉบับ)', 535, 32)
    } else if (pageType === 'Copy') {
      doc.setTextColor(200, 200, 200)
      doc.text('(สำเนา)', 535, 32)
    }

    */

    switch (pageType) {
      case 'Copy':
        doc.setTextColor(200, 200, 200)
        doc.text('(สำเนา)', 535, 18)
        break
      case 'Original':
        doc.setTextColor(40, 40, 244)
        doc.text('(ต้นฉบับ)', 535, 18)
        break
      case 'TaskOrder':
        doc.setTextColor(200, 10, 10)
        doc.setFontSize(26)
        doc.text('ใบสั่งงาน', 535, 25, { align: 'center' })
        break
    }
    doc.setFontSize(12)
    // Reset สีเป็นดำ
    doc.setTextColor(0, 0, 0)

    // ตัวอย่างวางข้อมูล Header
    doc.text(`${data.receipt_no || ''}`, 480, 45)
    doc.text(`${moment(data.date).format('DD/MM/YYYY HH:mm') || ''}`, 480, 60)

    // ตัวอย่างตำแหน่ง agent / shipper / seal
    doc.text(data.agent_code === 'NON' ? '-' : data.agent_code || '-', 176, 85) // Liner Agent
    // Set initial font size based on text length
    const shipperText = data.client_code || '-'
    if (shipperText.length > 32) {
      doc.setFontSize(11)
    } else {
      doc.setFontSize(12)
    }
    doc.text(shipperText, 176, 100) // Shipper
    doc.setFontSize(14)
    doc.text(data.seal_no || '-', 176, 116) // Seal no

    // ตัวอย่างตำแหน่ง container/size/tare
    doc.setFontSize(16)
    doc.text(data.container || '-', 340, 85)
    doc.setFontSize(14)
    doc.text(data.size_type || '-', 420, 100)
    doc.text(formatNumberValue(data.tare) || '-', 498, 102)

    // ตัวอย่างตำแหน่ง booking/ vessel / voyage
    doc.text(data.booking_bl || '-', 480, 85)
    doc.setFontSize(12)
    doc.text(data.vessel || '-', 255, 115)
    doc.text(data.voyage || '-', 393, 115)
    doc.setFontSize(14)
    doc.text(formatNumberValue(data.gross_weight) || '-', 498, 117)

    // driver info
    doc.text(data.truck_license || '-', 176, 145)
    doc.text(data.driver_name || '-', 176, 158)
    doc.text(data.yard || '-', 176, 173) // yard

    doc.text(data.truck_company || '-', 365, 145)
    doc.text(data.tel || '-', 365, 158)

    //doc.addImage(checkSVGBase64, 'PNG', 278, 194, 15, 15)
    //doc.addImage(checkSVGBase64, 'PNG', 278, 213, 15, 15)
    //doc.addImage(checkSVGBase64, 'PNG', 278, 232, 15, 15)

    //doc.addImage(checkSVGBase64, 'PNG', 365, 194, 15, 15)
    //doc.addImage(checkSVGBase64, 'PNG', 452, 194, 15, 15)

    // Add conditions dynamically
    if (Array.isArray(data.conditions)) {
      data.conditions.forEach((condition) => {
        if (condition.position_x && condition.position_y) {
          doc.addImage(checkSVGBase64, 'PNG', condition.position_x, condition.position_y, 15, 15)
        }
      })
    }

    // หมายเหตุ
    doc.setFontSize(10)
    doc.text(data.remark || '-', 365, 278, { maxWidth: 150 })

    doc.setFontSize(8)
    doc.text(data.container_color  || '-', 56, 338, { align: 'center' })

    if (pageType === 'TaskOrder' && Array.isArray(tasks)) {
      doc.setFontSize(14)
      doc.text('รายการ:', 195, 260)

      let yPosition = 275
      tasks.forEach((task) => {
        const status = task.complete_datetime ? '✓' : '○'
        const taskText = `${status} ${task.task_name || ''}`
        doc.text('[  ] ' + taskText, 210, yPosition)
        yPosition += 13

        if (yPosition > 700) {
          doc.text('...', 200, yPosition)
          return
        }
      })
    }

    // เซ็นชื่อหรือผู้รับ
    doc.setFontSize(12)
    doc.text(data.update_user_name || '', 510, 382, { align: 'center' })
  }

  // สร้างหน้า (ต้นฉบับ, สำเนา) ถ้าต้องการ
  addPage('Original')
  doc.addPage()
  addPage('Copy')

  // ถ้ามี tasks อยากออกใบสั่งงานด้วย ก็สามารถทำเพิ่ม
  if (tasks && tasks.length > 0) {
    doc.addPage()
    addPage('TaskOrder')
    // ใส่รายละเอียด tasks ต่างๆ เพิ่มได้
  }
}

// ฟังก์ชันสำหรับรวม PDF หากส่ง items มาเป็น array หลาย container
const generateBatchPDF = (isPreview = true) => {
  // A5 landscape
  const doc = new jsPDF('l', 'pt', 'a5')

  processedItems.value.forEach((item, index) => {
    if (index > 0) {
      doc.addPage()
    }
    generateSinglePDF(doc, item.data, item.tasks)
  })

  if (isPreview) {
    const pdfBlob = doc.output('blob')
    const blobUrl = URL.createObjectURL(pdfBlob)
    window.open(blobUrl, '_blank')
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
  } else {
    const firstReceiptNo = processedItems.value[0]?.data.receipt_no || 'batch'
    doc.save(`${firstReceiptNo}.pdf`)
  }
}

// ฟังก์ชันสร้าง PDF หลัก (รองรับเดี่ยวและหลาย)
const generatePDF = (isPreview = true) => {
  if (Array.isArray(props.items)) {
    generateBatchPDF(isPreview)
  } else {
    // A5 landscape
    const doc = new jsPDF('l', 'pt', 'a5')
    generateSinglePDF(doc, processedItems.value.data, processedItems.value.tasks)

    if (isPreview) {
      const pdfBlob = doc.output('blob')
      const blobUrl = URL.createObjectURL(pdfBlob)
      window.open(blobUrl, '_blank')
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    } else {
      doc.save(`${processedItems.value.data.receipt_no || 'eir'}.pdf`)
    }
  }
}
</script>

<style scoped>
.pdf-preview {
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 10px;
}
</style>
