<template>
    <button class="btn btn-outline btn-success" @click="exportToExcel">
        <i class="fas fa-file-excel"></i> Export to Excel
    </button>

</template>

<script setup>
import ExcelJS from 'exceljs';
import moment from 'moment';
import { saveAs } from 'file-saver';

const props = defineProps({
    invoices: {
        type: Array,
        required: true
    }
});

// Array of Thai month names
const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoices');

    // Determine the tax period based on invoice dates
    const uniqueMonths = new Set();
    props.invoices.forEach(invoice => {
        const date = moment(invoice.invoice_date);
        const monthYear = date.format('MM-YYYY');
        uniqueMonths.add(monthYear);
    });

    const sortedMonths = Array.from(uniqueMonths).sort((a, b) => moment(a, 'MM-YYYY').diff(moment(b, 'MM-YYYY')));
    const startMonthIndex = parseInt(sortedMonths[0].split('-')[0], 10) - 1;
    const endMonthIndex = parseInt(sortedMonths[sortedMonths.length - 1].split('-')[0], 10) - 1;
    const startMonth = thaiMonths[startMonthIndex];
    const endMonth = thaiMonths[endMonthIndex];
    const year = parseInt(sortedMonths[0].split('-')[1], 10) + 543;

    let taxPeriod = `สำหรับงวดภาษี เดือน ${startMonth} ปี ${year}`;
    let fileName = `ภาษี ภ.พ.${startMonth} ปี ${year}.xlsx`;
    if (startMonth !== endMonth) {
        taxPeriod = `สำหรับงวดภาษี เดือน ${startMonth}-${endMonth} ปี ${year}`;
        fileName = `ภาษี ภ.พ.${startMonth}-${endMonth} ปี ${year}.xlsx`;
    }

    // Add header information
    const headerInfo = [
        'รายงานภาษีขาย',
        taxPeriod,
        'ชื่อผู้ประกอบการ บริษัท ยีราฟ คอนเทนเนอร์ จำกัด เลขประจำผู้เสียภาษีอากร 0205567019082',
        'ชื่อสถานที่ประกอบการ เลขที่ 50/18 ม.1 ต.ตะเคียนเตี้ย อ.บางละมุง จ.ชลบุรี 20230 สำนักงาน/สาขา สำนักงานใหญ่',
        ''
    ];

    headerInfo.forEach((text, index) => {
        const row = worksheet.getRow(index + 1);
        row.getCell(1).value = text;
        worksheet.mergeCells(`A${index + 1}:J${index + 1}`);
        row.getCell(1).alignment = { horizontal: 'center' };
        row.getCell(1).font = { bold: true };
    });

    // Define the headers for the Excel sheet starting from row 6
    const headerRow = worksheet.getRow(6);
    headerRow.values = [
        'ลำดับที่', 'วัน/เดือน/ปี', 'เลขที่เอกสาร', 'ชื่อลูกค้า', 'เลขผู้เสียภาษี', 'สำนักงานใหญ่/สาขา', 'มูลค่า', 'ภาษีมูลค่าเพิ่ม', 'หักภาษี ณ ที่จ่าย', 'หมายเหตุ'
    ];

    // Apply styles to the header row
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '000000' } // Black background
        };
        cell.font = {
            color: { argb: 'FFFFFF' }, // White text
            bold: true
        };
        cell.alignment = { horizontal: 'center' };
    });

    worksheet.columns = [
        { key: 'index', width: 10 },
        { key: 'date', width: 20 },
        { key: 'invoice_no', width: 20 },
        { key: 'customer_name', width: 30 },
        { key: 'tax_id', width: 25 },
        { key: 'customer_address_branch', width: 25 },
        { key: 'total_amount', width: 15, style: { numFmt: '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"??_-;_-@_-' } },
        { key: 'vat_amount', width: 20, style: { numFmt: '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"??_-;_-@_-' } },
        { key: 'total_with_holding_tax', width: 20, style: { numFmt: '_-* #,##0.00_-;-* #,##0.00_-;_-* "-"??_-;_-@_-' } },
        { key: 'note', width: 30 }
    ];

    let totalAmountSum = 0;
    let vatAmountSum = 0;
    let totalWithHoldingTaxSum = 0;

    // Populate the worksheet with data
    props.invoices.forEach((invoice, index) => {
        const customerName = invoice.invoice_language === 'ENG' ? invoice.customer_name_eng : invoice.customer_name;
        const customerAddressBranch = invoice.invoice_language === 'ENG' ? invoice.customer_address_branch_eng : invoice.customer_address_branch;

        // Apply conditions for status_id = 5
        const totalAmount = invoice.status_id === 5 ? 0 : invoice.total_amount;
        const vatAmount = invoice.status_id === 5 ? 0 : invoice.vat_amount;
        const totalWithHoldingTax = invoice.status_id === 5 ? 0 : invoice.total_with_holding_tax;
        const note = invoice.status_id === 5 ? 'ยกเลิก' : '';

        totalAmountSum += totalAmount;
        vatAmountSum += vatAmount;
        totalWithHoldingTaxSum += totalWithHoldingTax;

        const row = worksheet.addRow({
            index: index + 1,
            date: moment(invoice.invoice_date).format('DD/MM/YYYY'),
            invoice_no: invoice.invoice_no,
            customer_name: customerName,
            tax_id: invoice.tax_id,
            customer_address_branch: customerAddressBranch,
            total_amount: totalAmount,
            vat_amount: vatAmount,
            total_with_holding_tax: totalWithHoldingTax,
            note: note
        });

        // Apply formatting to the tax_id cell
        row.getCell('tax_id').numFmt = '0 0000 00000 00 0';

        // Apply border to the row
        row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });

    // Add summary row
    const summaryRow = worksheet.addRow({
        customer_address_branch: 'ยอดรวมทั้งหมด',
        total_amount: totalAmountSum,
        vat_amount: vatAmountSum,
        total_with_holding_tax: totalWithHoldingTaxSum,
        note: ''
    });

    summaryRow.getCell('customer_address_branch').font = { bold: true };
    summaryRow.getCell('total_amount').font = { bold: true };
    summaryRow.getCell('vat_amount').font = { bold: true };
    summaryRow.getCell('total_with_holding_tax').font = { bold: true };

    summaryRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'double' }, // Double bottom border
            right: { style: 'thin' }
        };
    });

    // Write the workbook to a buffer and save as an Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), fileName);
};
</script>
