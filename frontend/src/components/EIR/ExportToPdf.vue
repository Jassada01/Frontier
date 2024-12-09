<template>
  <div>
    <button class="btn  btn-ghost " @click="generatePDF">
      <i class="fa-regular fa-file-pdf text-2xl"></i> Preview
    </button>
    <button class="btn  btn-ghost " @click="generatePDF(false)">
      <i class="fa-solid fa-file-arrow-down text-2xl"> </i>Download
    </button>
    <!-- เพิ่ม iframe สำหรับแสดง PDF -->
    <div v-if="showPdfPreview" class="pdf-preview">
      <iframe :src="pdfUrl" width="100%" height="600px" frameborder="0"></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs } from 'vue'
import { jsPDF } from 'jspdf'
import font_config from '../../config/font_config'
import moment from 'moment'
import eirTemplateImage from '../../assets/media/pdf_template/eir_template.png'

const pdfUrl = ref('')
const showPdfPreview = ref(false)

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
  }
})

const { data } = toRefs(props)

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

  image.onload = () => {
    doc.addImage(image, 'PNG', 0, 0, 595.28, 841.89)

    generateCheckMarkObject(doc, data.value.entry_type, data.value.drop_container)

    // นำเข้าฟอนต์ TH Sarabun New
    doc.addFileToVFS('THSarabunNew.ttf', font_config.thSarabunBBase64)
    doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal')
    doc.setFont('THSarabunNew')

    doc.setFont('THSarabunNew', 'normal')
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

    // PIC Name
    doc.setFontSize(16)
    doc.text(data.value.update_user_name, 465, 735, { align: 'center' }, { maxWidth: 50 })


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