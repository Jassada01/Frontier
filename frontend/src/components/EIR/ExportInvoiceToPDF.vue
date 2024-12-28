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
import invoiceTemplateImage from '../../assets/media/pdf_template/invoice_template.png'
import Swal from 'sweetalert2'

const openDropdown = ref(false)
function toggleDropdown() {
  openDropdown.value = !openDropdown.value
}

// Define props to receive array of invoice data
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

// Format number to display with commas and decimal places
function formatNumberValue(value, minimum_fix = 2) {
  if (!isNaN(value)) {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: minimum_fix,
      maximumFractionDigits: 2
    })
  }
  return ''
}

// Convert number to Thai baht text
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

// Convert number to English baht text
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

// Handle preview button click
const handlePreviewInvoice = () => {
  generatePDF(true, true)
}

// Handle download button click
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

// Main function to generate PDF
const generatePDF = (includeCopy, isPreview = false) => {
  const doc = new jsPDF('p', 'pt', 'a4', { LineHeightFactor: 1 })
  const image = new Image()
  image.src = invoiceTemplateImage

  image.onload = () => {
    // Loop through each invoice data and create pages
    props.invoiceData.forEach((data, index) => {
      if (index > 0) {
        doc.addPage()
      }

      // Create original page
      createInvoicePage(doc, image, '(ต้นฉบับ)', data.form, data.equipmentInterchangeReceipt)

      if (includeCopy) {
        // Create copy page
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

// Create individual invoice page
const createInvoicePage = (doc, image, copyType, invoice, EIR) => {
  // Add background template
  doc.addImage(image, 'PNG', 0, 0, 595.28, 841.89)

  // Set up font
  doc.addFileToVFS('THSarabunNew.ttf', font_config.thSarabunBBase64)
  doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal')
  doc.setFont('THSarabunNew')
  doc.setFontSize(14)

  const lang = invoice.invoice_language

  // Add cancel watermark if status is 5
  if (invoice.status_id === 5) {
    doc.setFontSize(34)
    doc.setTextColor(255, 29, 25) // แยกค่า RGB
    doc.text('ยกเลิก', 450, 160)
    doc.setTextColor(0, 0, 0) // reset to black
    doc.setFontSize(14)
  }

  // Add copy type text (Original/Copy)
  if (copyType) {
    doc.setFontSize(28)
    if (copyType === '(ต้นฉบับ)') {
      doc.setTextColor(40, 40, 244) // สีน้ำเงิน
    } else {
      doc.setTextColor(150, 150, 150) // สีเทา
    }
    doc.text(copyType, 560, 41, { align: 'right' })
    doc.setTextColor(0, 0, 0) // reset to black
    doc.setFontSize(14)
  }

  // Add header information
  doc.text(invoice.invoice_no, 450, 107)
  doc.text(moment(invoice.invoice_date).format('D/M/YYYY'), 450, 120)
  doc.text(invoice.payment_method, 450, 133)

  // Add customer information
  const customerInfo =
    invoice[`customer_name${lang === 'ENG' ? '_eng' : ''}`] +
    ' (' +
    invoice[`customer_address_branch${lang === 'ENG' ? '_eng' : ''}`] +
    ')'

  if (customerInfo.length > 30) {
    doc.setFontSize(12)
  }
  doc.text(customerInfo, 85, 107, { maxWidth: 320, lineHeightFactor: 0.6 })
  doc.setFontSize(14)

  // Add remaining invoice details
  doc.text(invoice[`customer_address${lang === 'ENG' ? '_eng' : ''}`], 60, 133, {
    maxWidth: 350,
    lineHeightFactor: 0.75
  })
  doc.text(invoice.tax_id, 133, 170)

  // Add equipment details
  doc.text(EIR.agent_code === 'NON' ? '-' : EIR.agent_code, 95, 198)

  const clientCode = EIR.client_code
  if (clientCode.length > 30) {
    doc.setFontSize(12)
    doc.text(clientCode, 225, 194, { maxWidth: 180, lineHeightFactor: 0.6 })
  } else {
    doc.text(clientCode, 225, 198)
  }
  doc.setFontSize(14)

  // Add additional equipment details
  doc.text(EIR.booking_bl, 440, 198)
  doc.text(EIR.container, 95, 213)
  doc.text(EIR.size_type, 225, 213)
  doc.text(EIR.vessel, 306, 213)
  doc.text(EIR.voyage, 440, 213)
  doc.text(EIR.truck_company, 95, 228)
  doc.text(EIR.driver_name, 306, 228)
  doc.text(EIR.truck_license, 440, 228)

  // Add invoice items
  invoice.detail.forEach((item, index) => {
    const y = 290 + index * 15
    doc.text(item[`description${lang === 'ENG' ? '_eng' : ''}`], 100, y)
    doc.text(formatNumberValue(item.quantity, 0), 385, y, { align: 'right' })
    doc.text(formatNumberValue(item.unit_price), 450, y, { align: 'right' })
    doc.text(formatNumberValue(item.amount), 520, y, { align: 'right' })
  })

  // Add note
  doc.text(invoice.note || '', 95, 540)

  // Add totals
  doc.text(formatNumberValue(invoice.total_amount), 520, 514, { align: 'right' })
  doc.text(
    invoice.total_discount ? '-' + formatNumberValue(invoice.total_discount) : '-',
    520,
    527,
    { align: 'right' }
  )
  doc.text(formatNumberValue(invoice.vat_amount || '-'), 520, 540, { align: 'right' })

  doc.setFontSize(18)
  doc.text(formatNumberValue(invoice.grand_total || '-'), 520, 560, { align: 'right' })
  doc.setFontSize(14)

  doc.text(formatNumberValue(invoice.total_with_holding_tax || '-'), 520, 575, { align: 'right' })
  doc.text(formatNumberValue(invoice.payment_total || '-'), 520, 588, { align: 'right' })

  // Add amount in words
  const thaiBahtText =
    '(' +
    (lang === 'ENG'
      ? convertToEnglishBaht(invoice.grand_total)
      : convertToThaiBaht(invoice.grand_total)) +
    ')'
  doc.text(thaiBahtText, 80, 594)
}
</script>
