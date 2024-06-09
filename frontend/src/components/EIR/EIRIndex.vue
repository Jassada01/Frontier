<template>
    <div class="eir-table p-4 overflow-x-auto">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">รายการ EIR</h1>
            <router-link to="/EIR">
                <button class="btn btn-primary">
                    <i class="fa fa-plus-circle mr-2"></i> เพิ่ม EIR
                </button>
            </router-link>
        </div>
        <div></div>
        <div class="overflow-x-auto">
            <table id="eirTable" class="table  table-zebra">
                <thead>
                    <tr>
                        <th class="p-4">ประเภท</th>
                        <th class="p-4">ตุ้ Drop</th>
                        <th class="p-4">เลขที่ EIR</th>
                        <th class="p-4">วันที่</th>
                        <th class="p-4">Agent</th>
                        <th class="p-4">ลุกค้า</th>
                        <th class="p-4">Booking/BL</th>
                        <th class="p-4">เบอร์ตู้</th>
                        <th class="p-4">ขนาด</th>
                        <th class="p-4">ทะเบียน</th>
                        <th class="p-4">ชื่อคนขับ</th>
                        <th class="p-4">ลาน</th>
                        <th class="p-4">สถานะ</th>
                        <th class="p-4"></th>

                    </tr>
                </thead>
                <tbody>
                    <tr v-for="eir in eirs" :key="eir.id">
                        <td class="p-4">
                            <div class="grid justify-items-center">
                                <span :class="eir.entry_type === 'IN' ? 'badge badge-success' : 'badge badge-error'">
                                    {{ eir.entry_type }}
                                </span>
                            </div>
                        </td>
                        <td class="p-4 ">
                            <div class="grid justify-items-center">
                                <div v-if="eir.drop_container" class="badge badge-primary badge-outline">Drop</div>
                            </div>
                        </td>
                        <td class="p-4  whitespace-nowrap">{{ eir.receipt_no }}</td>
                        <td class="p-4  whitespace-nowrap">{{ formatDate(eir.date) }}</td>
                        <td class="p-4">{{ eir.agent_code }}</td>
                        <td class="p-4">{{ eir.client_code }}</td>
                        <td class="p-4">{{ eir.booking_bl }}</td>
                        <td class="p-4">{{ eir.container }}</td>
                        <td class="p-4">{{ eir.size_type }}</td>
                        <td class="p-4">{{ eir.truck_license }}</td>
                        <td class="p-4">{{ eir.driver_name }}</td>
                        <td class="p-4">{{ eir.yard }}</td>
                        <td class="p-4">
                            <div
                                :class="eir.status_name_th === 'ใช้งาน' ? 'badge badge-primary badge-outline whitespace-nowrap' : 'badge badge-error badge-outline whitespace-nowrap'">
                                {{ eir.status_name_th }}
                            </div>
                        </td>
                        <td class="p-4">
                            <div class="grid justify-items-center">
                                <router-link :to="`/EIR/${eir.id}`">
                                    <button class="btn btn-circle">
                                        <i class="fa fa-pencil-alt"></i>
                                    </button>
                                </router-link>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import moment from 'moment';
import CONFIG from '../../config/config';




// Import DataTables and jQuery
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net-dt';
import $ from 'jquery';
import 'datatables.net';


const eirs = ref([]);
const router = useRouter();

const formatDate = (date) => {
    return moment(date).format('D/M/YYYY H:mm');
};

const goToEIR = (id) => {
    router.push(`/EIR/${id}`);
};

onMounted(async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/EIR/get`);
        eirs.value = response.data;

        // Initialize DataTables
        setTimeout(() => {
            $('#eirTable').DataTable();
        }, 0);

    } catch (error) {
        console.error('Error fetching EIRs:', error);
    }
});
</script>

<style scoped>
.eir-table {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
}
</style>
