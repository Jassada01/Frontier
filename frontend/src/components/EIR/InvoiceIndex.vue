<template>
    <div class="invoice-table p-4 overflow-x-auto">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">รายการใบแจ้งหนี้ <span class="text-base">{{ displayDateRange }}</span></h1>
            <div class="flex space-x-4 items-center">
                <div class="form-control">
                    <label class="cursor-pointer label">
                        <input type="checkbox" id="activeStatusFilter" class="checkbox checkbox-info" checked />
                        <span class="label-text ml-2">แสดงเฉพาะที่ใช้งาน</span>
                    </label>
                </div>
                <div>
                    <input id="dateRangePicker" class="input input-bordered" placeholder="เลือกช่วงวันที่" readonly />
                </div>
                <ExportInvoiceToExcel :invoices="invoices" />
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
                        <div v-if="invoice.status === 'รอชำระ'" class="dropdown dropdown-bottom dropdown-end">
                            <div tabindex="0" role="button" class="badge badge-warning whitespace-nowrap">รอชำระ</div>
                            <ul tabindex="0"
                                class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                <li>
                                    <a @click="updateStatusToPaid(invoice.id)">ชำระแล้ว</a>
                                </li>
                            </ul>
                        </div>
                        <div v-else :class="{
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
import flatpickr from 'flatpickr';
import Swal from 'sweetalert2';
import 'flatpickr/dist/flatpickr.css';

import $ from 'jquery';
import 'datatables.net';
import { useRoute, useRouter } from 'vue-router';
import CONFIG from '../../config/config';
import ExportInvoiceToExcel from './ExportInvoiceToExcel.vue'; // Import component

const invoices = ref([]);
const displayDateRange = ref('');

const formatDate = (date) => {
    return moment(date).format('D/M/YYYY');
}

const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
}

const getDefaultStartDate = () => {
    return moment().subtract(0, 'months').startOf('month').format('YYYY-MM-DD');
};

const getDefaultEndDate = () => {
    return moment().endOf('month').format('YYYY-MM-DD');
};



const updateStatusToPaid = async (id) => {
    try {
        const result = await Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: "คุณต้องการเปลี่ยนสถานะเป็น 'ชำระแล้ว' หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ใช่, ฉันแน่ใจ',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            await axios.put(`${CONFIG.API_SERVER}/api/invoices/updateStatusToPaid`, null, {
                params: { id }
            });
            Swal.fire(
                'สำเร็จ!',
                'สถานะใบแจ้งหนี้ถูกเปลี่ยนเป็นชำระแล้ว.',
                'success'
            ).then(() => {
                window.location.reload(); // Refresh the page
            });
        }
    } catch (error) {
        console.error('Error updating invoice status:', error);
        Swal.fire(
            'เกิดข้อผิดพลาด',
            'ไม่สามารถเปลี่ยนสถานะใบแจ้งหนี้ได้.',
            'error'
        );
    }
};


onMounted(async () => {
    const route = useRoute();
    const router = useRouter();
    const startDate = route.query.startdate || getDefaultStartDate();
    const endDate = route.query.enddate || getDefaultEndDate();

    displayDateRange.value = `${moment(startDate).format("D/M/yyyy")} - ${moment(endDate).format("D/M/yyyy")} `;
    flatpickr('#dateRangePicker', {
        mode: 'range',
        defaultDate: startDate && endDate ? [moment(startDate).toDate(), moment(endDate).toDate()] : [],
        dateFormat: 'd/m/Y',
        onClose: function (selectedDates) {
            if (selectedDates.length === 2) {
                const startdate = moment(selectedDates[0]).format('YYYY-MM-DD');
                const enddate = moment(selectedDates[1]).format('YYYY-MM-DD');
                router.push(`/InvoiceIndex?startdate=${startdate}&enddate=${enddate}`).then(() => {
                    router.go(0); // รีเฟรชหน้าเว็บ
                });

            }
        }
    });




    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/invoices/get`, {
            params: {
                start_date: startDate,
                end_date: endDate
            }
        });
        invoices.value = response.data;
        // console.log(invoices.value);

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
