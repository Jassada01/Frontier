<template>
    <div class="detention-logs-table p-4 overflow-x-auto">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">Detention</h2>
        </div>
        <table id="detentionLogsTable" class="display table table-auto">
            <thead>
                <tr>
                    <th>เลขที่ EIR</th>
                    <th>วันที่และเวลา Detention</th>
                    <th>เลขที่ Booking</th>
                    <th>ตู้คอนเทนเนอร์</th>
                    <th>เอเย่นต์</th>
                    <th>ประเภทขนาด</th>
                    <th>ลาน</th>
                    <th>หมายเหตุของ Detention</th>
                    <th>สถานะเวลา</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="log in detentionLogs" :key="log.id">
                    <td>
                        <router-link :to="`/EIR/${log.EIR_ID}`" class="text-blue-500 hover:underline">
                            {{ log.receipt_no }}
                        </router-link>
                    </td>
                    <td>{{ moment(log.detention_datetime).format('DD/MM/YYYY HH:mm') }}</td>
                    <td>{{ log.booking_bl }}</td>
                    <td>{{ log.container }}</td>
                    <td>{{ log.agent_code }}</td>
                    <td>{{ log.size_type }}</td>
                    <td>{{ log.yard }}</td>
                    <td>{{ log.remark }}</td>
                    <td>
                        <div :class="getBadgeClass(log.detention_datetime)">
                            {{ getRemainingTimeText(log.detention_datetime) }}
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
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net-dt';

import CONFIG from '../../config/config';
import $ from 'jquery';
import 'datatables.net';
import moment from 'moment';
import 'moment/locale/th'; // Import the Thai locale

moment.locale('th'); // Set moment to use the Thai locale

const detentionLogs = ref([]);

const getBadgeClass = (detentionDatetime) => {
    const now = moment();
    const detentionTime = moment(detentionDatetime);
    const duration = moment.duration(detentionTime.diff(now));
    const hours = duration.asHours();

    if (hours < 0) {
        return 'badge badge-red'; // Red if detention time has passed
    } else if (hours < 8) {
        return 'badge badge-orange'; // Orange if less than 8 hours remaining
    } else if (hours < 24) {
        return 'badge badge-yellow'; // Yellow if less than 1 day remaining
    } else {
        return 'badge badge-green'; // Default green
    }
};

const getRemainingTimeText = (detentionDatetime) => {
    const now = moment();
    const detentionTime = moment(detentionDatetime);
    const duration = moment.duration(detentionTime.diff(now));
    const hours = duration.asHours();

    if (hours < 0) {
        return 'เกินเวลาแล้ว';
    } else if (hours < 8) {
        return `น้อยกว่า 8 ชั่วโมง`;
    } else if (hours < 24) {
        return `น้อยกว่า 1 วัน`;
    } else {
        return `มากกว่า 1 วัน`;
    }
};

onMounted(async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/common/getDetentionLogs`);
        detentionLogs.value = response.data;
        await nextTick();
        $('#detentionLogsTable').DataTable();
    } catch (error) {
        console.error('Error fetching detention logs:', error);
    }
});
</script>

<style scoped>
.badge {
    padding: 0.5em 1em;
    border-radius: 0.5em;
    color: white;
    text-align: center;
}

.badge-green {
    background-color: green;
}

.badge-yellow {
    background-color: yellow;
    color: black;
    /* สีดำเพื่อให้อ่านง่ายขึ้น */
}

.badge-orange {
    background-color: orange;
}

.badge-red {
    background-color: red;
}

.text-blue-500 {
    color: #3b82f6;
}

.hover\:underline:hover {
    text-decoration: underline;
}
</style>