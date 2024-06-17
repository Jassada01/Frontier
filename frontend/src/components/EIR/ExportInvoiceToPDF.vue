<template>
  <div>
    <li @click="generatePDF">
      <a><i class="fa-solid fa-file-pdf"></i> Print Invoice</a>
    </li>
  </div>
</template>

<script setup>
import { jsPDF } from 'jspdf'
import font_config from '../../config/font_config'
import moment from 'moment'
import invoiceTemplateImage from '../../assets/media/pdf_template/invoice_template.png' // นำเข้า template ที่อัพโหลดมาใหม่

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
  const number = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
  const digit = ['', 'ten', 'hundred', 'thousand', 'ten thousand', 'hundred thousand', 'million']
  amount = parseFloat(amount).toFixed(2).toString()
  let bahtText = ''
  let [integer, satang] = amount.split('.')

  if (parseInt(integer) === 0) {
    bahtText = 'zero baht'
  } else {
    let count = integer.length
    for (let i = 0; i < count; i++) {
      let numberStr = integer[i]
      if (numberStr !== '0') {
        if (numberStr === '1' && i === count - 1) {
          bahtText += 'one'
        } else {
          bahtText += number[parseInt(numberStr)]
        }
        bahtText += ' ' + digit[count - i - 1] + ' '
      }
    }
    bahtText += 'baht'
  }

  if (parseInt(satang) === 0) {
    bahtText += ' only'
  } else {
    if (satang < 10) {
      bahtText += ' ' + number[parseInt(satang[1])] + ' satang'
    } else {
      if (satang[1] === '0') {
        bahtText += ' ' + number[parseInt(satang[0])] + ' ten satang'
      } else {
        bahtText +=
          ' ' + number[parseInt(satang[0])] + ' ten ' + number[parseInt(satang[1])] + ' satang'
      }
    }
  }

  return bahtText
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

const generatePDF = () => {
  const doc = new jsPDF('p', 'pt', 'a4')

  const image = new Image()
  image.src = invoiceTemplateImage

  image.onload = () => {
    // Create the first page (ต้นฉบับ)
    createInvoicePage(doc, image, '(ต้นฉบับ)')

    // Create the second page (สำเนา)
    doc.addPage()
    createInvoicePage(doc, image, '(สำเนา)')

    doc.save(`${props.form.invoice_no}.pdf`)
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
  doc.setFontSize(28)
  if (copyType == "(ต้นฉบับ)")
  {
    doc.setTextColor(40, 40, 244)
  }
  else
  {
    doc.setTextColor(150, 150, 150)
  }
 
  doc.text(copyType, 560, 41, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)

  // Header
  doc.text(invoice.invoice_no, 450, 107)
  doc.text(moment(invoice.invoice_date).format('D/M/YYYY'), 450, 120)
  doc.text(invoice.payment_method, 450, 133)

  // Customer Info
  doc.text(
    invoice[`customer_name${lang === 'ENG' ? '_eng' : ''}`] +
      ' (' +
      invoice[`customer_address_branch${lang === 'ENG' ? '_eng' : ''}`] +
      ')',
    85,
    107
  )
  doc.text(invoice[`customer_address${lang === 'ENG' ? '_eng' : ''}`], 60, 133, {
    maxWidth: 350,
    lineHeightFactor: 0.75
  })
  doc.text(invoice.tax_id, 133, 170)

  // Invoice Details
  // LINE 1
  doc.text(EIR.agent_code, 95, 198)
  doc.text(EIR.client_code, 225, 198)
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
  doc.text(invoice.note || "", 95, 540);

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
  const thaiBahtText = '(' + convertToThaiBaht(invoice.grand_total) + ')'
  doc.text(thaiBahtText, 80, 594)
}
</script>

<style scoped>
.example {
  margin: 0 auto;
}
</style>
