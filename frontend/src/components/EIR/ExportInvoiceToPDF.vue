<template>
  <div>
    <div class="flex">
      <div class="join">
        <!-- ปุ่ม Preview -->
        <button @click="handlePreviewInvoice" class="btn btn-ghost btn-sm join-item">
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
          อินวอยซ์
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
        @click="handleDownloadInvoice"
        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <i class="fa-solid fa-file-arrow-down text-xl"> </i> ดาวน์โหลด PDF
      </button>
    </div>
  </div>
</template>

<script setup>
import { jsPDF } from 'jspdf'
import { ref } from 'vue'

import font_config from '../../config/font_config'
import moment from 'moment'
// รูป background (A5 แนวนอน) ให้เปลี่ยน path ตามไฟล์ที่มี
import invoiceTemplateImage from '../../assets/media/pdf_template/invoice_template_A5.png'
import Swal from 'sweetalert2'

const openDropdown = ref(false)
function toggleDropdown() {
  openDropdown.value = !openDropdown.value
}

const props = defineProps({
  invoiceData: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(
        (item) =>
          item.hasOwnProperty('form') &&
          item.hasOwnProperty('equipmentInterchangeReceipt') &&
          typeof item.form === 'object' &&
          typeof item.equipmentInterchangeReceipt === 'object'
      )
    }
  }
})

function formatNumberValue(value, minimum_fix = 2) {
  if (!isNaN(value)) {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: minimum_fix,
      maximumFractionDigits: 2
    })
  }
  return ''
}

function convertToThaiBaht(amount) {
  const number = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
  const digit = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']

  amount = parseFloat(amount).toFixed(2).toString()
  let bahtText = ''
  let [integer, satang] = amount.split('.')

  if (parseInt(integer) === 0) {
    bahtText = 'ศูนย์บาท'
  } else {
    let count = integer.length
    for (let i = 0; i < count; i++) {
      let numberStr = integer[i]
      if (numberStr !== '0') {
        if (numberStr === '1' && i === count - 1) {
          bahtText += 'เอ็ด'
        } else if (numberStr === '2' && i === count - 2) {
          bahtText += 'ยี่'
        } else {
          bahtText += number[parseInt(numberStr)]
        }
        bahtText += digit[count - i - 1]
      }
    }
    bahtText += 'บาท'
  }

  if (parseInt(satang) === 0) {
    bahtText += 'ถ้วน'
  } else {
    if (satang < 10) {
      bahtText += number[parseInt(satang[1])] + 'สตางค์'
    } else {
      if (satang[1] === '0') {
        bahtText += number[parseInt(satang[0])] + 'สิบสตางค์'
      } else {
        bahtText += number[parseInt(satang[0])] + 'สิบ' + number[parseInt(satang[1])] + 'สตางค์'
      }
    }
  }

  return bahtText
}

function convertToEnglishBaht(amount) {
  const number = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen'
  ]
  const tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety'
  ]
  const scales = ['', 'thousand', 'million', 'billion', 'trillion']

  amount = parseFloat(amount).toFixed(2).toString()
  let bahtText = ''
  let [integer, satang] = amount.split('.')

  if (parseInt(integer) === 0) {
    bahtText = 'zero baht'
  } else {
    let chunks = []
    while (integer.length > 0) {
      chunks.push(integer.slice(-3))
      integer = integer.slice(0, -3)
    }
    chunks = chunks.reverse()

    chunks.forEach((chunk, index) => {
      let chunkText = ''
      const num = parseInt(chunk)

      if (num >= 100) {
        chunkText += number[Math.floor(num / 100)] + ' hundred '
        chunk = num % 100
      }

      if (chunk >= 20) {
        chunkText += tens[Math.floor(chunk / 10)] + ' '
        if (chunk % 10 > 0) {
          chunkText += number[chunk % 10] + ' '
        }
      } else if (chunk > 0) {
        chunkText += number[chunk] + ' '
      }

      if (chunkText) {
        bahtText += chunkText + scales[chunks.length - 1 - index] + ' '
      }
    })
    bahtText += 'baht'
  }

  if (parseInt(satang) > 0) {
    bahtText += ' and '
    if (parseInt(satang) < 20) {
      bahtText += number[parseInt(satang)] + ' satang'
    } else {
      bahtText += tens[Math.floor(parseInt(satang) / 10)] + ' '
      if (parseInt(satang) % 10 > 0) {
        bahtText += number[parseInt(satang) % 10] + ' '
      }
      bahtText += 'satang'
    }
  } else {
    bahtText += ' only'
  }

  return bahtText.trim()
}

const handlePreviewInvoice = () => {
  generatePDF(true, true)
}

const handleDownloadInvoice = () => {
  Swal.fire({
    title: 'Download Invoice',
    text: 'ดาวน์โหลด Invoice พร้อม Copy?',
    input: 'checkbox',
    inputValue: 1,
    inputPlaceholder: 'ดาวน์โหลด Invoice ทั้ง ต้นฉบับและสำเนา',
    confirmButtonText: 'ดาวน์โหลด',
    cancelButtonText: 'ยกเลิก',
    showCancelButton: true
  }).then((result) => {
    if (result.isConfirmed) {
      const includeCopy = result.value ? true : false
      generatePDF(includeCopy, false)
    }
  })
}

/**
 * สร้าง PDF ตามเทมเพลต A5 แนวนอน
 */
const generatePDF = (includeCopy, isPreview = false) => {
  const doc = new jsPDF('landscape', 'pt', 'a5', { LineHeightFactor: 1 })
  const image = new Image()
  image.src = invoiceTemplateImage

  image.onload = () => {
    props.invoiceData.forEach((data, index) => {
      if (index > 0) {
        doc.addPage()
      }
      createInvoicePage(doc, image, '(ต้นฉบับ)', data.form, data.equipmentInterchangeReceipt)
      if (includeCopy) {
        doc.addPage()
        createInvoicePage(doc, image, '(สำเนา)', data.form, data.equipmentInterchangeReceipt)
      }
    })

    if (isPreview) {
      const pdfBlob = doc.output('blob')
      const blobUrl = URL.createObjectURL(pdfBlob)
      window.open(blobUrl, '_blank')
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    } else {
      doc.save(`${props.invoiceData[0].form.invoice_no}.pdf`)
    }
  }
}

function createInvoicePage(doc, image, copyType, invoice, EIR) {
  // ขนาด A5 แนวนอน ~ 595.28 (กว้าง) x 420.94 (สูง)
  doc.addImage(image, 'PNG', 0, 0, 595.28, 420.94)

  doc.addFileToVFS('THSarabunNew.ttf', font_config.thSarabunBBase64)
  doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal')
  doc.setFont('THSarabunNew')
  doc.setFontSize(12)

  const lang = invoice.invoice_language

  // ถ้าเป็นสถานะยกเลิก
  if (invoice.status_id === 5) {
    doc.setFontSize(24)
    doc.setTextColor(255, 29, 25)
    doc.text('ยกเลิก', 500, 40)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
  }

  // (ต้นฉบับ) หรือ (สำเนา)
  if (copyType) {
    doc.setFontSize(18)
    if (copyType === '(ต้นฉบับ)') {
      doc.setTextColor(40, 40, 244)
    } else {
      doc.setTextColor(150, 150, 150)
    }
    doc.text(copyType, 575, 48, { align: 'right' })
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
  }

  // ข้อมูลเอกสาร (เลขที่เอกสาร / วันที่ / เงื่อนไข) มุมขวาบน
  doc.text(invoice.invoice_no || '-', 515, 60, { align: 'left' })
  doc.text(moment(invoice.invoice_date).format('D/M/YYYY'), 515, 71, { align: 'left' })
  doc.text(invoice.payment_method || '-', 515, 82, { align: 'left' })

  // ---------------------------
  // ข้อมูลลูกค้า (ซ้ายบน)
  // ---------------------------
  let customerNamePrint = invoice[`customer_name${lang === 'ENG' ? '_eng' : ''}`] || '-';
  let customerBranchPrint = invoice[`customer_address_branch${lang === 'ENG' ? '_eng' : ''}`] || '-';
  let customerName_and_Branch = `${customerNamePrint} (${customerBranchPrint}) `
  doc.text(customerName_and_Branch, 85, 60)
  // ที่อยู่
  // ส่วนของการแสดงที่อยู่
  const address = invoice[`customer_address${lang === 'ENG' ? '_eng' : ''}`] || '-'
  const splitAddress = doc.splitTextToSize(address, 250)

  // ถ้าที่อยู่เกิน 3 บรรทัด ให้รวมเป็นบรรทัดเดียว
  let displayAddress
  if (splitAddress.length > 3) {
    displayAddress = [address.replace(/\s+/g, ' ')] // รวมทุกบรรทัดและกำจัด whitespace ที่ไม่จำเป็น
  } else {
    displayAddress = splitAddress
  }

  let yPos = 71
  displayAddress.forEach((line) => {
    doc.text(line, 85, yPos,{
    maxWidth: 380
  })
    yPos += 10
  })
  // ---------------------------
  // เลขผู้เสียภาษี (ถ้ามี)
  // ---------------------------
  doc.text(invoice.tax_id ? `${invoice.tax_id}` : '-', 125, 103)

  // ---------------------------
  // ข้อมูล EIR - แสดงต่อจากนั้น
  // ตัวอย่างจัดแถวตามภาพคร่าว ๆ
  // ---------------------------
  // Liner Agent
  doc.text(EIR.agent_code === 'NON' ? '-' : EIR.agent_code, 75, 115)
  // Shipper
  doc.text(EIR.client_code || '-', 190, 115)
  // Booking/BL
  doc.text(EIR.booking_bl || '-', 490, 115)

  // LINE 2 ------------------
  // Driver
  doc.text(EIR.driver_name || '-', 270, 128)
  // License
  doc.text(EIR.truck_license || '-', 375, 128)
  // truck_company
  doc.setFontSize(10)
  doc.text(EIR.truck_company || '-', 480, 128)

  doc.setFontSize(12)
  // Container
  doc.text(EIR.container || '-', 75, 128)
  // Size Type
  doc.text(EIR.size_type || '-', 190, 128)
  // (ถ้ามี vessel, voyage ก็ระบุเช่นเดียวกัน)

  // ----------------------------------------------------
  // ส่วนตารางรายการ (detail) เริ่มประมาณ y = 170-180
  // ----------------------------------------------------
  let startY = 171
  invoice.detail.forEach((item, idx) => {
    const rowY = startY + idx * 15
    // คอลัมน์คำอธิบาย
    doc.text(item[`description${lang === 'ENG' ? '_eng' : ''}`] || '-', 60, rowY)
    // จำนวน
    doc.text(formatNumberValue(item.quantity, 0), 390, rowY, { align: 'right' })
    // ราคาต่อหน่วย
    doc.text(formatNumberValue(item.unit_price), 460, rowY, { align: 'right' })
    // รวม
    doc.text(formatNumberValue(item.amount), 540, rowY, { align: 'right' })
  })

  // ---------------------------
  // หมายเหตุ
  // ---------------------------
  doc.text(invoice.note || '-', 80, 300)

  // ---------------------------
  // สรุปราคาต่าง ๆ (มุมขวาล่าง)
  // ---------------------------
  // ยอดรวม
  doc.text(formatNumberValue(invoice.total_amount), 540, 280, { align: 'right' })
  // ส่วนลด
  doc.text(
    invoice.total_discount ? '-' + formatNumberValue(invoice.total_discount) : '-',
    540,
    290,
    { align: 'right' }
  )
  // VAT
  doc.text(formatNumberValue(invoice.vat_amount || '-'), 540, 300, { align: 'right' })
  // ยอดรวมทั้งหมด
  doc.setFontSize(15)
  doc.text(formatNumberValue(invoice.grand_total || '-'), 540, 315, { align: 'right' })
  doc.setFontSize(12)
  // ภาษีหัก ณ ที่จ่าย
  doc.text(formatNumberValue(invoice.total_with_holding_tax || '-'), 540, 329, { align: 'right' })
  // ยอดชำระ
  doc.text(formatNumberValue(invoice.payment_total || '-'), 540, 338, { align: 'right' })

  // ---------------------------
  // จำนวนเงินเป็นตัวหนังสือ
  // ---------------------------
  const bahtText =
    '(' +
    (lang === 'ENG'
      ? convertToEnglishBaht(invoice.grand_total)
      : convertToThaiBaht(invoice.grand_total)) +
    ')'
  doc.text(bahtText, 250, 340, { maxWidth: 300 })
}
</script>
