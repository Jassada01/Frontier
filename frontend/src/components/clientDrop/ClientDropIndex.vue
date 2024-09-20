<template>
    <div class="client-drop-period-table p-4 overflow-x-auto">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">ระยะเวลาฟรีของลูกค้า</h1>
            <button @click="openModal()" class="btn btn-primary">
                <i class="fa fa-clock mr-2"></i> เพิ่มระยะเวลาฟรี
            </button>
        </div>

        <!-- ตารางข้อมูล -->
        <table id="clientDropTable" class="display table table-zebra">
            <thead>
                <tr>
                    <th class="p-4">รหัสลูกค้า</th>
                    <th class="p-4">ชื่อลูกค้า</th>
                    <th class="p-4">ระยะเวลา (วัน)</th>
                    <th class="p-4">วันที่หมดอายุ</th>
                    <th class="p-4">สถานะ</th>
                    <th class="p-4"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="period in clientFreeDropPeriods" :key="period.id">
                    <td class="p-4">{{ period.client_id }}</td>
                    <td class="p-4">{{ period.name }}</td>
                    <td class="p-4">{{ period.free_period }}</td>
                    <td class="p-4">{{ formatDisplayDate(period.expire_date) }}</td>
                    <td class="p-4">
                        <div
                            :class="period.is_active ? 'badge badge-primary badge-outline whitespace-nowrap' : 'badge badge-error badge-outline whitespace-nowrap'">
                            {{ period.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                        </div>
                    </td>
                    <td class="p-4">
                        <button @click="openModal(period)" class="btn btn-sm btn-circle">
                            <i class="fa fa-pencil-alt"></i>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- DaisyUI Modal -->
        <input type="checkbox" id="modal-client-free-drop" class="modal-toggle" v-model="isModalOpen" />
        <div class="modal">
            <div class="modal-box">
                <h2 class="text-xl mb-4">{{ isEditMode ? 'แก้ไขระยะเวลาฟรี' : 'เพิ่มระยะเวลาฟรี' }}</h2>

                <!-- ฟอร์มการเพิ่ม/แก้ไข -->
                <form @submit.prevent="saveClientFreeDropPeriod">
                    <div class="mb-4">
                        <label for="client_id" class="block">เลือกลูกค้า</label>
                        <select v-model="form.client_id" id="client_id" class="select select-bordered w-full">
                            <option v-for="client in clients" :key="client.client_id" :value="client.client_id">
                                {{ client.name }}
                            </option>
                        </select>
                    </div>

                    <div class="mb-4">
                        <label for="free_period" class="block">ระยะเวลา (วัน)</label>
                        <input v-model="form.free_period" type="number" id="free_period"
                            class="input input-bordered w-full" required>
                    </div>

                    <div class="mb-4">
                        <label for="expire_date" class="block">วันที่หมดอายุ</label>
                        <input v-model="formattedExpireDate" type="text" id="expire_date"
                            class="input input-bordered w-full" placeholder="DD/MM/YYYY" required>
                    </div>

                    <div class="mb-4">
                        <label for="is_active" class="block">สถานะ</label>
                        <input v-model="form.is_active" type="checkbox" id="is_active" class="toggle toggle-primary">
                        <span>ใช้งาน</span>
                    </div>

                    <div class="modal-action">
                        <button type="button" @click="closeModal()" class="btn">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary">{{ isEditMode ? 'บันทึก' : 'เพิ่ม' }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'datatables.net-dt';
import $ from 'jquery';
import 'datatables.net';
import CONFIG from '../../config/config';

const clientFreeDropPeriods = ref([]);
const clients = ref([]);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const form = ref({
    client_id: '',
    free_period: '',
    expire_date: '',
    is_active: true
});
const formattedExpireDate = ref('');
let editingId = null;

const formatDate = (date) => {
    const d = new Date(date);
    const day = (`0${d.getDate()}`).slice(-2);
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const formatDisplayDate = (date) => {
    return formatDate(date);
};

const openModal = (period = null) => {
    if (period) {
        isEditMode.value = true;
        form.value = {
            ...period,
            expire_date: formatDate(period.expire_date),
            is_active: Boolean(period.is_active) // แปลงค่าเป็น boolean
        };
        formattedExpireDate.value = formatDate(period.expire_date);
        editingId = period.id;
    } else {
        isEditMode.value = false;
        form.value = {
            client_id: '',
            free_period: '',
            expire_date: '',
            is_active: true
        };
        formattedExpireDate.value = '31/12/2999';
        editingId = null;
    }
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const saveClientFreeDropPeriod = async () => {
    try {
        const [day, month, year] = formattedExpireDate.value.split('/');
        form.value.expire_date = `${year}-${month}-${day}`;

        // แปลง is_active เป็น boolean ก่อนส่งไปยัง API
        form.value.is_active = Boolean(form.value.is_active);

        if (isEditMode.value && editingId) {
            await axios.put(`${CONFIG.API_SERVER}/api/client_free_drop_period/update/${editingId}`, form.value);
            Swal.fire({
                icon: 'success',
                title: 'อัปเดตข้อมูลสำเร็จ',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.reload();
            });
        } else {
            await axios.post(`${CONFIG.API_SERVER}/api/client_free_drop_period/add`, form.value);
            Swal.fire({
                icon: 'success',
                title: 'เพิ่มข้อมูลสำเร็จ',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.reload();
            });
        }
        closeModal();
    } catch (error) {
        console.error('Error saving data:', error);
    }
};

const fetchClients = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/client/get?active=true`);
        clients.value = response.data;
    } catch (error) {
        console.error('Error fetching clients:', error);
    }
};

const fetchClientFreeDropPeriods = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/client_free_drop_period/get`);
        clientFreeDropPeriods.value = response.data;
        await nextTick();
        $('#clientDropTable').DataTable({
            pageLength: 50,
        });
    } catch (error) {
        console.error('Error fetching client free drop periods:', error);
    }
};

onMounted(() => {
    fetchClients();
    fetchClientFreeDropPeriods();
});
</script>

<style scoped></style>