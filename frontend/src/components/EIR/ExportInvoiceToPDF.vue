<template>
  <div>
    <button class="btn  btn-ghost "  @click="handlePreviewInvoice"><i class="fa-regular fa-file-pdf text-2xl"></i> Preview</button>
    <button class="btn  btn-ghost "  @click="handleDownloadInvoice"><i class="fa-solid fa-file-arrow-down text-2xl"> </i>Download</button>
  </div>
</template>


<script setup>
import { jsPDF } from 'jspdf'
import font_config from '../../config/font_config'
import moment from 'moment'
import invoiceTemplateImage from '../../assets/media/pdf_template/invoice_template.png'
import Swal from 'sweetalert2'

const checkSVGBase64 = `data:image/png;base64,${font_config.check_png}`

function formatNumberValue(value, minimum_fix = 2) {
  if (!isNaN(value)) {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: minimum_fix,
      maximumFractionDigits: 2
    })
  } else {
    return ''
  }
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

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  equipmentInterchangeReceipt: {
    type: Object,
    required: true
  }
})

const handlePreviewInvoice = () => {
  generatePDF(true, true);
  /*
  Swal.fire({
    title: 'Preview Invoice',
    text: 'ดูตัวอย่าง Invoice พร้อม Copy?',
    input: 'checkbox',
    inputValue: 1,
    inputPlaceholder: 'แสดง Invoice ทั้ง ต้นฉบับและสำเนา',
    confirmButtonText: 'แสดง Preview',
    cancelButtonText: 'ยกเลิก',
    showCancelButton: true
  }).then((result) => {
    if (result.isConfirmed) {
      const includeCopy = result.value ? true : false
      generatePDF(includeCopy, true)
    }
  })
    */
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

const generatePDF = (includeCopy, isPreview = false) => {
  const doc = new jsPDF('p', 'pt', 'a4', { LineHeightFactor: 1 })

  const image = new Image()
  image.src = invoiceTemplateImage

  image.onload = () => {
    // Create the first page
    createInvoicePage(doc, image, includeCopy ? '(ต้นฉบับ)' : '')

    if (includeCopy) {
      // Create the second page (สำเนา)
      doc.addPage()
      createInvoicePage(doc, image, '(สำเนา)')
    }

    if (isPreview) {
      // Open PDF in new window/tab for preview
      // สร้าง Blob URL แทนการ save file
      const pdfBlob = doc.output('blob')
      const blobUrl = URL.createObjectURL(pdfBlob)
      window.open(blobUrl, '_blank')

      // Cleanup URL เมื่อไม่ใช้แล้ว
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
    } else {
      // Download the PDF
      doc.save(`${props.form.invoice_no}.pdf`)
    }
  }
}

const createInvoicePage = (doc, image, copyType) => {
  doc.addImage(image, 'PNG', 0, 0, 595.28, 841.89)

  doc.addFileToVFS('THSarabunNew.ttf', font_config.thSarabunBBase64)
  doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal')
  doc.setFont('THSarabunNew')

  doc.setFont('THSarabunNew', 'normal')
  doc.setFontSize(14)

  const invoice = props.form
  const EIR = props.equipmentInterchangeReceipt
  const lang = invoice.invoice_language

  if (invoice.status_id === 5) {
    doc.setFontSize(34)
    doc.setTextColor(255, 29, 25)
    doc.text('ยกเลิก', 450, 160)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
  }

  // Original or Copy
  if (copyType) {
    doc.setFontSize(28)
    if (copyType === '(ต้นฉบับ)') {
      doc.setTextColor(40, 40, 244)
    } else {
      doc.setTextColor(150, 150, 150)
    }
    doc.text(copyType, 560, 41, { align: 'right' })
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
  }

  // Header
  doc.text(invoice.invoice_no, 450, 107)
  doc.text(moment(invoice.invoice_date).format('D/M/YYYY'), 450, 120)
  doc.text(invoice.payment_method, 450, 133)

  // Customer Info
  const customerInfo =
    invoice[`customer_name${lang === 'ENG' ? '_eng' : ''}`] +
    ' (' +
    invoice[`customer_address_branch${lang === 'ENG' ? '_eng' : ''}`] +
    ')'

  if (customerInfo.length > 30) {
    doc.setFontSize(12)
  }

  doc.text(customerInfo, 85, 107, { maxWidth: 320, lineHeightFactor: 0.6 })

  // Reset font size back to 14
  doc.setFontSize(14)

  doc.text(invoice[`customer_address${lang === 'ENG' ? '_eng' : ''}`], 60, 133, {
    maxWidth: 350,
    lineHeightFactor: 0.75
  })
  doc.text(invoice.tax_id, 133, 170)

  // Invoice Details
  // LINE 1
  if (EIR.agent_code === "NON") {
    EIR.agent_code = "-";
  }
  doc.text(EIR.agent_code, 95, 198)
  // EIR Client Code
  const clientCode = EIR.client_code

  if (clientCode.length > 30) {
    doc.setFontSize(12)
    doc.text(clientCode, 225, 194, { maxWidth: 180, lineHeightFactor: 0.6 })
  }
  else {
    doc.text(clientCode, 225, 198, { maxWidth: 180, lineHeightFactor: 0.6 })
  }



  // Reset font size back to 14
  doc.setFontSize(14)
  doc.text(EIR.booking_bl, 440, 198)

  // LINE 2
  doc.text(EIR.container, 95, 213)
  doc.text(EIR.size_type, 225, 213)
  doc.text(EIR.vessel, 306, 213)
  doc.text(EIR.voyage, 440, 213)

  // LINE 3
  doc.text(EIR.truck_company, 95, 228)
  doc.text(EIR.driver_name, 306, 228)
  doc.text(EIR.truck_license, 440, 228)

  // Line Items
  invoice.detail.forEach((item, index) => {
    const y = 290 + index * 15
    doc.text(item[`description${lang === 'ENG' ? '_eng' : ''}`], 100, y)
    doc.text(formatNumberValue(item.quantity, 0), 385, y, { align: 'right' })
    doc.text(formatNumberValue(item.unit_price), 450, y, { align: 'right' })
    doc.text(formatNumberValue(item.amount), 520, y, { align: 'right' })
  })

  // Note
  doc.text(invoice.note || '', 95, 540)

  // Totals
  doc.text(formatNumberValue(invoice.total_amount), 520, 514, { align: 'right' })
  doc.text(
    invoice.total_discount ? '-' + formatNumberValue(invoice.total_discount) : '-',
    520,
    527,
    { align: 'right' }
  )
  doc.text(invoice.vat_amount ? formatNumberValue(invoice.vat_amount) : '-', 520, 540, {
    align: 'right'
  })
  doc.setFontSize(18)
  doc.text(invoice.grand_total ? formatNumberValue(invoice.grand_total) : '-', 520, 560, {
    align: 'right'
  })
  doc.setFontSize(14)
  doc.text(
    invoice.total_with_holding_tax ? formatNumberValue(invoice.total_with_holding_tax) : '-',
    520,
    575,
    { align: 'right' }
  )
  doc.text(invoice.payment_total ? formatNumberValue(invoice.payment_total) : '-', 520, 588, {
    align: 'right'
  })

  // Add converted Thai Baht text
  const thaiBahtText =
    '(' +
    (lang === 'ENG'
      ? convertToEnglishBaht(invoice.grand_total)
      : convertToThaiBaht(invoice.grand_total)) +
    ')'
  doc.text(thaiBahtText, 80, 594)
}
</script>

<style scoped>
.example {
  margin: 0 auto;
}
</style>
