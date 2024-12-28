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
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </div>
  </div>

    <!-- Dropdown Menu -->
    <div v-if="openDropdown"
      class="absolute right-0 z-10 w-44 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg">
      <button @click="handleDownloadClick" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        <i class="fa-solid fa-file-arrow-down text-xl"> </i>  ดาวน์โหลด PDF
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { jsPDF } from 'jspdf'
import font_config from '../../config/font_config'
import moment from 'moment'
import eirTemplateImage from '../../assets/media/pdf_template/eir_template.png'

const openDropdown = ref(false)

const props = defineProps({
  items: {
    type: [Object, Array],
    required: true,
    validator: (value) => {
      if (!Array.isArray(value)) {
        return typeof value === 'object' && value !== null;
      }
      return value.every(item => 
        typeof item === 'object' && 
        item !== null && 
        '0' in item && 
        'tasks' in item
      );
    }
  }
});

// แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้งานได้
const processedItems = computed(() => {
  if (!Array.isArray(props.items)) {
    return {
      data: props.items['0'],
      tasks: props.items.tasks || []
    };
  }
  return props.items.map(item => ({
    data: item['0'],
    tasks: item.tasks || []
  }));
});

function toggleDropdown() {
  openDropdown.value = !openDropdown.value
}

function handleDownloadClick() {
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

const generateSinglePDF = (doc, data, tasks) => {
  const image = new Image()
  image.src = eirTemplateImage

  const addPage = (pageType = "Original") => {
    doc.addImage(image, 'PNG', 0, 0, 595.28, 841.89)

    generateCheckMarkObject(doc, data.entry_type, data.drop_container)

    // นำเข้าฟอนต์ TH Sarabun New
    doc.addFileToVFS('THSarabunNew.ttf', font_config.thSarabunBBase64)
    doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal')
    doc.setFont('THSarabunNew')

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

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16)

    // Header
    doc.text(data.receipt_no || '', 425, 142)
    doc.text(moment(data.date).format('D/M/YYYY H:mm') || '', 425, 167)

    // Info Line 1
    doc.text(data.agent_code === "NON" ? "-" : (data.agent_code || ''), 105, 212)
    doc.text(data.container || '', 265, 212)
    doc.text(data.booking_bl || '', 470, 212)

    if (data.status_id === 2) {
      doc.setFontSize(34)
      doc.setTextColor(255, 29, 25)
      doc.text('ยกเลิก', 450, 120)
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
    }

    // Info Line 2
    const dataClientCode = data.client_code || '';
    if (dataClientCode.length > 40) {
      doc.setFontSize(12)
      doc.text(dataClientCode, 105, 230, { maxWidth: 200, lineHeightFactor: 0.6 })
    } else {
      doc.text(dataClientCode, 105, 234, { maxWidth: 200, lineHeightFactor: 0.6 })
    }

    doc.setFontSize(16)
    doc.text(data.size_type || '', 365, 234)
    doc.text(formatNumberValue(data.tare) || '', 470, 234)

    // Info Line 3
    doc.text(data.seal_no || '', 105, 255)
    doc.text(data.vessel || '', 265, 255)
    doc.text(data.voyage || '', 470, 255)

    // Driver Info 1
    doc.text(data.truck_license || '', 108, 317)
    doc.text(data.truck_company || '', 360, 317)

    // Driver Info 2
    doc.text(data.driver_name || '', 108, 340)
    doc.text(data.tel || '', 360, 340)

    // Original Yard
    doc.text(data.yard || '', 108, 362)

    // Add conditions dynamically
    if (Array.isArray(data.conditions)) {
      data.conditions.forEach((condition) => {
        if (condition.position_x && condition.position_y) {
          doc.addImage(checkSVGBase64, 'PNG', condition.position_x, condition.position_y, 15, 15)
        }
      })
    }

    // Color
    doc.setFontSize(10)
    doc.text(data.container_color || '', 90, 670, { align: 'center' }, { maxWidth: 50 })
    
    // Remark
    doc.setFontSize(12)
    doc.text(data.remark || '', 330, 490, { maxWidth: 200 })

    if (pageType === "Task Order" && Array.isArray(tasks)) {
      doc.setFontSize(14);
      doc.text('รายการ:', 250, 520);

      let yPosition = 540;
      tasks.forEach((task) => {
        const status = task.complete_datetime ? '✓' : '○';
        const taskText = `${status} ${task.task_name || ''}`;
        doc.text('[  ] ' + taskText, 260, yPosition);
        yPosition += 17;

        if (yPosition > 700) {
          doc.text('...', 260, yPosition);
          return;
        }
      });
    }

    // PIC Name
    doc.setFontSize(16)
    doc.text(data.update_user_name || '', 465, 735, { align: 'center' }, { maxWidth: 50 })
  }

  // Add pages
  addPage("Original")
  doc.addPage()
  addPage("Copy")

  if (tasks && tasks.length > 0) {
    doc.addPage()
    addPage("Task Order")
  }
}

// ฟังก์ชันสำหรับการ generate PDF แบบ batch
const generateBatchPDF = (isPreview = true) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  
  processedItems.value.forEach((item, index) => {
    if (index > 0) {
      doc.addPage();
    }
    generateSinglePDF(doc, item.data, item.tasks);
  });

  if (isPreview) {
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } else {
    const firstReceiptNo = processedItems.value[0]?.data.receipt_no || 'batch';
    doc.save(`${firstReceiptNo}.pdf`);
  }
};

// ฟังก์ชันหลักสำหรับการสร้าง PDF
const generatePDF = (isPreview = true) => {
  if (Array.isArray(props.items)) {
    generateBatchPDF(isPreview);
  } else {
    const doc = new jsPDF('p', 'pt', 'a4');
    generateSinglePDF(doc, processedItems.value.data, processedItems.value.tasks);
    
    if (isPreview) {
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } else {
      doc.save(`${processedItems.value.data.receipt_no}.pdf`);
    }
  }
};
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