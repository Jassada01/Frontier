<template>
    <div class="invoice-table p-4 overflow-x-auto">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">รายการใบแจ้งหนี้</h1>
            <div class="form-control">
                <label class="cursor-pointer label">
                    <input type="checkbox" id="activeStatusFilter" class="checkbox checkbox-info" checked />
                    <span class="label-text ml-2">แสดงเฉพาะที่ใช้งาน</span>
                </label>
            </div>
        </div>
        <table id="invoiceTable" class="display table table-zebra">
            <thead>
                <tr>
                    <th class="p-4">เลขที่ใบแจ้งหนี้</th>
                    <th class="p-4">วันที่ใบแจ้งหนี้</th>
                    <th class="p-4">ชื่อลูกค้า</th>
                    <th class="p-4">รหัสตัวแทน</th>
                    <th class="p-4">ตู้คอนเทนเนอร์</th>
                    <th class="p-4">Booking BL</th>
                    <th class="p-4">ยอดรวม</th>
                    <th class="p-4">ภาษีมูลค่าเพิ่ม</th>
                    <th class="p-4">ยอดรวมทั้งหมด</th>
                    <th class="p-4">เลขที่ EIR</th>
                    <th class="p-4">วิธีการชำระเงิน</th>
                    <th class="p-4">สถานะ</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="invoice in invoices" :key="invoice.id">
                    <td class="p-4 whitespace-nowrap">
                        <router-link :to="`/EIR/${invoice.eir_id}?inv=${invoice.invoice_no}`">
                            <a class="text-primary">{{ invoice.invoice_no }}</a>
                        </router-link>
                    </td>
                    <td class="p-4">{{ formatDate(invoice.invoice_date) }}</td>
                    <td class="p-4">{{ invoice.customer_name }}</td>
                    <td class="p-4">{{ invoice.agent_code }}</td>
                    <td class="p-4">{{ invoice.container }}</td>
                    <td class="p-4">{{ invoice.booking_bl }}</td>
                    <td class="p-4">{{ formatNumber(invoice.total_amount) }}</td>
                    <td class="p-4">{{ formatNumber(invoice.vat_amount) }}</td>
                    <td class="p-4">{{ formatNumber(invoice.grand_total) }}</td>
                    <td class="p-4">
                        <router-link :to="`/EIR/${invoice.eir_id}`">
                            <a class="text-primary">{{ invoice.receipt_no }}</a>
                        </router-link>
                    </td>
                    <td class="p-4">{{ invoice.payment_method }}</td>
                    <td class="p-4">
                        <div :class="{
                            'badge badge-warning whitespace-nowrap': invoice.status === 'รอชำระ',
                            'badge badge-success whitespace-nowrap': invoice.status === 'ชำระแล้ว',
                            'badge badge-error whitespace-nowrap': invoice.status === 'ยกเลิก'
                        }">
                            {{ invoice.status }}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import moment from 'moment';
import 'datatables.net-dt';

import $ from 'jquery';
import 'datatables.net';
import CONFIG from '../../config/config';

const invoices = ref([]);

const formatDate = (date) => {
    return moment(date).format('D/M/YYYY');
}

const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
}

onMounted(async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/invoices/get`);
        invoices.value = response.data;

        // Extend DataTables sorting for dates
        $.fn.dataTable.moment = function (format, locale) {
            var types = $.fn.dataTable.ext.type;

            // Add type detection
            types.detect.unshift(function (d) {
                return moment(d, format, locale, true).isValid() ? 'moment-' + format : null;
            });

            // Add sorting method - use an integer for the sorting
            types.order['moment-' + format + '-pre'] = function (d) {
                return moment(d, format, locale, true).unix();
            };
        };

        // Call the function with the format used in your data
        $.fn.dataTable.moment('D/M/YYYY');

        await nextTick();
        const table = $('#invoiceTable').DataTable({
            order: [[1, 'desc']], // Order by the second column (index 1) in descending order
            pageLength: 50 // Set the number of rows to display per page
        });

        // Add event listener for the active status filter
        $('#activeStatusFilter').on('change', function () {
            if (this.checked) {
                table.column(11).search('รอชำระ|ชำระแล้ว', true, false).draw();
            } else {
                table.column(11).search('').draw();
            }
        });

        // Apply initial filter for active status
        table.column(11).search('รอชำระ|ชำระแล้ว', true, false).draw();

    } catch (error) {
        console.error('Error fetching invoices:', error);
    }
});
</script>

<style scoped></style>
