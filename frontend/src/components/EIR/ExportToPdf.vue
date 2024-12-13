<template>
  <div class="relative inline-block text-left">
    <div class="flex">
      <!-- ปุ่ม Preview -->
      <button @click="generatePDF(true)" class="btn btn-ghost">
        <i class="fa-regular fa-file-pdf text-2xl"></i> Preview
      </button>
      <!-- ปุ่มแสดงเมนู -->
      <button @click="toggleDropdown" class="btn btn-ghost ">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </div>

    <!-- Dropdown Menu -->
    <div v-if="openDropdown"
      class="absolute right-0 z-10 w-44 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg">
      <button @click="handleDownloadClick" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        <i class="fa-solid fa-file-arrow-down text-2xl"> </i> Download PDF
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs } from 'vue'
import { jsPDF } from 'jspdf'
import font_config from '../../config/font_config'
import moment from 'moment'
import eirTemplateImage from '../../assets/media/pdf_template/eir_template.png'

const openDropdown = ref(false)

function toggleDropdown() {
  openDropdown.value = !openDropdown.value
}

function handleDownloadClick() {
  // ถ้าอยากให้คลิกแล้วปิด dropdown ก็ใช้ code นี้: 
  // openDropdown.value = false
  // แล้วตามด้วยฟังก์ชัน generatePDF(false)
  generatePDF(false)
}


function formatNumberValue(tareValue) {
  if (!isNaN(tareValue)) {
    return Number(tareValue).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  } else {
    return ''
  }
}

const checkSVGBase64 = `data:image/png;base64,${font_config.check_png}`

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  tasks: {
    type: Array,
    default: () => []
  }
});

const { data, tasks } = toRefs(props);

function generateCheckMarkObject(doc, entryType, dropContainer) {
  if (entryType === 'IN') {
    doc.addImage(checkSVGBase64, 'PNG', 65, 130, 15, 15)
  } else if (entryType === 'OUT') {
    doc.addImage(checkSVGBase64, 'PNG', 65, 160, 15, 15)
  }

  if (dropContainer) {
    doc.addImage(checkSVGBase64, 'PNG', 168, 160, 15, 15)
  }
}

const generatePDF = (isPreview = true) => {
  const doc = new jsPDF('p', 'pt', 'a4')

  const image = new Image()
  image.src = eirTemplateImage

  const addPage = (pageType = "Original") => {
    doc.addImage(image, 'PNG', 0, 0, 595.28, 841.89)

    generateCheckMarkObject(doc, data.value.entry_type, data.value.drop_container)



    // นำเข้าฟอนต์ TH Sarabun New
    doc.addFileToVFS('THSarabunNew.ttf', font_config.thSarabunBBase64)
    doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal')
    doc.setFont('THSarabunNew')

    doc.setFont('THSarabunNew', 'normal')

    // Add copy watermark if it's the second page
    doc.setFontSize(35);

    switch (pageType) {
      case 'Copy':
        doc.setTextColor(200, 200, 200);
        doc.text('(สำเนา)', 480, 60);
        break;
      case 'Original':
        doc.setTextColor(40, 40, 244);
        doc.text('(ต้นฉบับ)', 480, 60);
        break;
      case 'Task Order':
        doc.setTextColor(10, 10, 10);
        doc.text('ใบสั่งงาน', 480, 60);
        break;
    }

    doc.setTextColor(0, 0, 0); // Reset to black


    doc.setFontSize(16)



    // Header
    doc.text(data.value.receipt_no, 425, 142)
    doc.text(moment(data.value.date).format('D/M/YYYY H:mm'), 425, 167)

    // Info Line 1
    if (data.value.agent_code === "NON") {
      data.value.agent_code = "-";
    }
    doc.text(data.value.agent_code, 105, 212)
    doc.text(data.value.container, 265, 212)
    doc.text(data.value.booking_bl, 470, 212)

    if (data.value.status_id === 2) {
      doc.setFontSize(34)
      doc.setTextColor(255, 29, 25)
      doc.text('ยกเลิก', 450, 120)
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
    }

    // Info Line 2
    const dataClientCode = data.value.client_code

    if (dataClientCode.length > 40) {
      doc.setFontSize(12)
      doc.text(dataClientCode, 105, 230, { maxWidth: 200, lineHeightFactor: 0.6 })
    }
    else {
      doc.text(dataClientCode, 105, 234, { maxWidth: 200, lineHeightFactor: 0.6 })
    }

    // Reset font size back to 16
    doc.setFontSize(16)
    doc.text(data.value.size_type, 365, 234)
    doc.text(formatNumberValue(data.value.tare), 470, 234)

    // Info Line 3
    doc.text(data.value.seal_no, 105, 255)
    doc.text(data.value.vessel, 265, 255)
    doc.text(data.value.voyage, 470, 255)

    // Driver Info 1
    doc.text(data.value.truck_license, 108, 317)
    doc.text(data.value.truck_company, 360, 317)

    // Driver Info 2
    doc.text(data.value.driver_name, 108, 340)
    doc.text(data.value.tel, 360, 340)

    // Original Yard
    doc.text(data.value.yard, 108, 362)

    // Add conditions dynamically
    data.value.conditions.forEach((condition) => {
      doc.addImage(checkSVGBase64, 'PNG', condition.position_x, condition.position_y, 15, 15)
    })

    // Color
    doc.setFontSize(10)
    doc.text(data.value.container_color, 90, 670, { align: 'center' }, { maxWidth: 50 })
    // Remark
    doc.setFontSize(12)
    doc.text(data.value.remark, 330, 490, { maxWidth: 200 })


    // Add Task if 3rd Page
    if (pageType === "Task Order") {
      doc.setFontSize(14);
      doc.text('รายการ:', 250, 520);

      let yPosition = 540;
      tasks.value.forEach((task, index) => {
        // ตรวจสอบว่า task นั้นเสร็จแล้วหรือยัง
        const status = task.complete_datetime ? '✓' : '○';
        const taskText = `${status} ${task.task_name}`;

        // ถ้า task เสร็จแล้ว แสดงเวลาที่เสร็จด้วย
        doc.text('[  ] ' + taskText, 260, yPosition);

        yPosition += 17; // เพิ่มระยะห่างระหว่าง tasks

        // ถ้า tasks มีจำนวนมากและจะล้นหน้า ให้จำกัดการแสดง
        if (yPosition > 700) {
          doc.text('...', 260, yPosition);
          return;
        }
      });
    }

    // PIC Name
    doc.setFontSize(16)
    doc.text(data.value.update_user_name, 465, 735, { align: 'center' }, { maxWidth: 50 })
  }

  // Add first page (Original)
  addPage("Original")

  // Add second page (Copy)
  doc.addPage()
  addPage("Copy")

  // Add page if Task Exist
  if (tasks.value && tasks.value.length > 0) {
    // Add second page (Copy)
    doc.addPage()
    addPage("Task Order")
  }

  if (isPreview) {
    // สร้าง Blob URL แทนการ save file
    const pdfBlob = doc.output('blob')
    const blobUrl = URL.createObjectURL(pdfBlob)
    window.open(blobUrl, '_blank')

    // Cleanup URL เมื่อไม่ใช้แล้ว
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
  } else {
    // Download the PDF
    doc.save(`${data.value.receipt_no}.pdf`)
  }
}

</script>

<style scoped>
.example {
  margin: 0 auto;
}

.pdf-preview {
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 10px;
}
</style>