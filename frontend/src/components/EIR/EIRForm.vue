<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import Multiselect from 'vue-multiselect';
import CONFIG from '../../config/config';
import FlatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import ExportToPdf from '../../components/EIR/ExportToPdf.vue'

import { Thai } from 'flatpickr/dist/l10n/th.js';


const props = defineProps({
    isEditMode: Boolean,
    receiptId: Number
});

const emit = defineEmits(['formSubmitted']);
const router = useRouter();

const equipmentInterchangeReceipt = ref({
    entry_type: '',
    drop_container: false,
    receipt_no: 'เลขอัตโนมัติ',
    date: '',
    agent_id: null,
    agent_code: '',
    client_id: null,
    client_code: '',
    booking_bl: '',
    container: '',
    container_color: '',  // เพิ่ม container_color
    size_type: '',
    seal_no: '',
    vessel: '',
    zone_id: null,
    zone: '',
    path_map: '',
    tare: 0.0,
    voyage: '',
    truck_license: '',
    driver_id: null,
    driver_name: '',
    truck_company: '',
    tel: '',
    yard_id: null,
    yard: '',
    status_id: 1,
    status_name_th: 'แบบร่าง',
    status_name_en: 'Draft',
    remark: '',
    driver_sign: '',
    receiver_sign: '',
    create_user: null,
    create_user_name: '',
    update_user: null,
    update_user_name: '',
    conditions: [{
        "condition_id": 1
    }]
});

const loading = ref(false); // เพิ่มตัวแปร loading
const agents = ref([]);
const selectedAgent = ref(null);
const clients = ref([]);
const selectedClient = ref(null);
const sizeOptions = CONFIG.CONTAINE_SIZE;
const colors = CONFIG.CONTAINE_COLOR;
const drivers = ref([]);
const selectedDriver = ref(null);
const yards = ref([]);
const selectedYard = ref(null);
const zones = ref([]);
const selectedZone = ref(null);
const conditions = ref([]);
const selectedColor = ref(null);


const fetchUserData = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/users/status`, {
            withCredentials: true
        });
        equipmentInterchangeReceipt.value.create_user = response.data.user_id;
        equipmentInterchangeReceipt.value.update_user = response.data.user_id;
    } catch (error) {
        console.error('Error fetching user data', error);
    }
};


const fetchDrivers = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/drivers/get?active=true`);
        drivers.value = response.data.map(driver => ({
            id: driver.id,
            driver_name: driver.driver_name,
            license_plate: driver.license_plate,
            province: driver.province,
            phone_number: driver.phone_number,
            truck_company_name: driver.truck_company_name,
            driver_image_path: driver.driver_image_path,
            truck_image_path: driver.truck_image_path,
            label: `${driver.driver_name} : ${driver.license_plate} - ${driver.province}`
        }));
    } catch (error) {
        handleError(error, 'Error fetching drivers data');
    }
};

const config = {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    defaultDate: new Date(),
    altInput: true,
    altFormat: "j M Y H:i",
    locale: Thai, // กำหนด locale เป็นภาษาไทย
    thaiBuddhist: true,
};

const watchSelectedColor = () => {
    if (selectedColor.value) {
        equipmentInterchangeReceipt.value.container_color = selectedColor.value.name;
    } else {
        equipmentInterchangeReceipt.value.container_color = '';
    }
};

const fetchYards = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/yards/get?active=true`);
        yards.value = response.data.map(yard => ({
            yard_id: yard.id,
            yard_name: yard.yard_name,
            short_name: yard.short_name,
            label: `${yard.short_name} - ${yard.yard_name}`
        }));
    } catch (error) {
        handleError(error, 'Error fetching yards data');
    }
};

const validateContainerNumber = () => {
    equipmentInterchangeReceipt.value.container = equipmentInterchangeReceipt.value.container.toUpperCase();
    const regex = /^[A-Z]{4}\d{7}$/;

    if (!regex.test(equipmentInterchangeReceipt.value.container)) {
        Swal.fire({
            icon: 'error',
            title: 'รูปแบบไม่ถูกต้อง',
            text: 'หมายเลขตู้ต้องอยู่ในรูปแบบ AAAAXXXXXXX โดยที่ A เป็นตัวอักษรภาษาอังกฤษและ X เป็นตัวเลข',
        });
        //equipmentInterchangeReceipt.value.container = "";
    }
};

const handleYardSelection = (yard) => {
    if (yard) {
        equipmentInterchangeReceipt.value.yard_id = yard.yard_id;
        equipmentInterchangeReceipt.value.yard = yard.yard_name;
    } else {
        equipmentInterchangeReceipt.value.yard_id = null;
        equipmentInterchangeReceipt.value.yard = '';
    }
};

const handleDriverSelection = (driver) => {
    if (driver) {
        equipmentInterchangeReceipt.value.driver_id = driver.id;
        equipmentInterchangeReceipt.value.driver_name = driver.driver_name;
        equipmentInterchangeReceipt.value.truck_license = driver.license_plate;
        equipmentInterchangeReceipt.value.truck_company = driver.truck_company_name;
        equipmentInterchangeReceipt.value.tel = driver.phone_number;
    } else {
        equipmentInterchangeReceipt.value.driver_id = null;
        equipmentInterchangeReceipt.value.driver_name = '';
        equipmentInterchangeReceipt.value.truck_license = '';
        equipmentInterchangeReceipt.value.truck_company = '';
        equipmentInterchangeReceipt.value.tel = '';
    }
};

const fetchAgents = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/agents/get?active=true`);
        agents.value = response.data.map(agent => ({
            agent_id: agent.agent_id,
            agent_code: agent.agent_code,
            label: `${agent.agent_code} - ${agent.company_name}`
        }));
    } catch (error) {
        handleError(error, 'Error fetching agents data');
    }
};

const fetchClients = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/client/get?active=true`);
        clients.value = response.data.map(client => ({
            client_id: client.client_id,
            client_code: client.client_code,
            label: `${client.client_code} - ${client.name}`
        }));
    } catch (error) {
        handleError(error, 'Error fetching clients data');
    }
};

const fetchConditions = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/common/getConditions`);
        conditions.value = response.data.map(condition => ({
            id: condition.id,
            name_th: condition.condition_name_th,
            name_en: condition.condition_name_en,
            checked: false
        }));
    } catch (error) {
        handleError(error, 'Error fetching conditions data');
    }
};

const requiredFields = ['entry_type', 'receipt_no', 'date', 'container'];

const checkRequiredFields = () => {
    for (const field of requiredFields) {
        if (!equipmentInterchangeReceipt.value[field]) {
            Swal.fire('Error', `กรุณากรอกข้อมูลให้ครบถ้วน`, 'error');
            return false;
        }
    }
    if (equipmentInterchangeReceipt.value.conditions.length === 0) {
        Swal.fire('Error', 'กรุณาเพิ่มข้อมูลสภาพอุปกรณ์', 'error');
        return false;
    }
    return true;
};
const fetchZones = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/zones/get?active=true`);
        zones.value = response.data.map(zone => ({
            zone_id: zone.id,
            zone_name: zone.zone,
            yard_name: zone.yard_name,
            path_map: zone.path_map,
            label: `${zone.zone}`
        }));
    } catch (error) {
        console.error('Error fetching zones data', error);
    }
};

const handleZoneSelection = (zone) => {
    if (zone) {
        equipmentInterchangeReceipt.value.zone_id = zone.zone_id;
        equipmentInterchangeReceipt.value.zone = zone.zone_name;
        equipmentInterchangeReceipt.value.path_map = zone.path_map;
        selectedZone.value = zone;
    } else {
        equipmentInterchangeReceipt.value.zone_id = null;
        equipmentInterchangeReceipt.value.zone = '';
        equipmentInterchangeReceipt.value.path_map = '';
        selectedZone.value = null;
    }

};

const fetchReceiptData = async (id) => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/EIR/get?id=${id}`);
        const receiptData = response.data[0];
        // แปลง tinyint(1) เป็น boolean
        receiptData.drop_container = receiptData.drop_container === 1;
        Object.assign(equipmentInterchangeReceipt.value, receiptData);
        selectedAgent.value = agents.value.find(agent => agent.agent_id === receiptData.agent_id);
        selectedClient.value = clients.value.find(client => client.client_id === receiptData.client_id);
        selectedDriver.value = drivers.value.find(drivers => drivers.id === receiptData.driver_id)
        selectedZone.value = zones.value.find(zones => zones.zone_id === receiptData.zone_id)
        selectedColor.value = colors.find(color => color.name === equipmentInterchangeReceipt.value.container_color);
        selectedYard.value = yards.value.find(yard => yard.yard_id === receiptData.yard_id);
        conditions.value.forEach(condition => {
            condition.checked = equipmentInterchangeReceipt.value.conditions.some(c => c.condition_id === condition.id);
        });
    } catch (error) {
        handleError(error, 'Error fetching equipment interchange receipt data');
    }
};

const createReceipt = async () => {
    if (!checkRequiredFields()) {
        return;
    }
    mapSelectedToReceipt();

    try {
        const response = await axios.post(`${CONFIG.API_SERVER}/api/EIR/add`, equipmentInterchangeReceipt.value);
        Swal.fire('Success', 'สร้างข้อมูลสำเร็จ', 'success').then(() => {
            emit('formSubmitted');
            router.push({ path: `/EIR/${response.data.equipment_interchange_receipt_id}` }).then(() => {
                router.go(0); // รีเฟรชหน้าเว็บ
            });
        });
    } catch (error) {
        handleError(error, 'Error creating equipment interchange receipt');
    }
};


const updateReceipt = async () => {
    if (!checkRequiredFields()) {
        return;
    }
    mapSelectedToReceipt();

    try {
        console.log(equipmentInterchangeReceipt.value);
        await axios.put(`${CONFIG.API_SERVER}/api/EIR/update/${props.receiptId}`, equipmentInterchangeReceipt.value);
        Swal.fire('Success', 'อัพเดทข้อมูลสำเร็จ', 'success').then(() => {
            window.location.reload();
        });
    } catch (error) {
        handleError(error, 'Error updating equipment interchange receipt');
    }
};

const mapSelectedToReceipt = () => {
    equipmentInterchangeReceipt.value.agent_id = selectedAgent.value.agent_id;
    equipmentInterchangeReceipt.value.agent_code = selectedAgent.value.agent_code;
    equipmentInterchangeReceipt.value.client_id = selectedClient.value.client_id;
    equipmentInterchangeReceipt.value.client_code = selectedClient.value.client_code;
    equipmentInterchangeReceipt.value.conditions = conditions.value.filter(condition => condition.checked).map(condition => ({
        condition_id: condition.id
    }));
};

const handleConditionChange = (condition) => {
    if (condition.checked) {
        equipmentInterchangeReceipt.value.conditions.push({ condition_id: condition.id });
    } else {
        equipmentInterchangeReceipt.value.conditions = equipmentInterchangeReceipt.value.conditions.filter(
            c => c.condition_id !== condition.id
        );
    }
};

const handleError = (error, message) => {
    Swal.fire('Error', `${message}: ${error.response?.data?.message || error.message}`, 'error');
};

const cancelReceipt = () => {
    Swal.fire({
        title: 'คุณต้องการยกเลิกใบ EIR นี้หรือไม่?',
        text: 'หากยกเลิกแล้ว ไม่สามารถแก้ไขได้',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#CCC',
        confirmButtonText: 'ใช่, ยกเลิกใบEIR',
        cancelButtonText: 'ไม่ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            equipmentInterchangeReceipt.value.status_id = 2;
            updateReceipt();
        }
    });
};

const disableForm = () => {
    document.querySelectorAll('input, select, textarea, button').forEach(element => {
        element.disabled = true;
    });
};


// เพิ่มฟังก์ชันใหม่สำหรับดึงข้อมูล eir_match
const fetchEirMatch = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/eir_match/get`, {
            params: {
                entry_type: 'IN',
                eir_id: props.receiptId
            }
        });
        const matchData = response.data;

        if (matchData.length > 0) {
            equipmentInterchangeReceipt.value.eir_out_no = matchData[0].eir_out_no;
        } else {
            equipmentInterchangeReceipt.value.eir_out_no = null;
        }
    } catch (error) {
        handleError(error, 'Error fetching EIR match data');
    }
};

const matchOut = () => {
    const initialData = {
        ...equipmentInterchangeReceipt.value,
        entry_type: 'OUT',
        receipt_no: 'เลขอัตโนมัติ', // ตั้งค่าใหม่
        date: new Date(), // ตั้งค่าใหม่
        conditions: [...equipmentInterchangeReceipt.value.conditions]
    };

    const encodedData = encodeURIComponent(JSON.stringify(initialData));

    router.push({
        path: '/EIR',
        query: {
            initialData: encodedData
        }
    }).then(() => {
        router.go(0); // รีเฟรชหน้าเว็บ
    });
};




onMounted(async () => {
    loading.value = true; // เริ่มโหลดข้อมูล
    if (props.isEditMode) {
        await fetchAgents();
        await fetchClients();
        await fetchDrivers();
        await fetchYards();
        await fetchZones();
        await fetchConditions();
        await fetchReceiptData(props.receiptId);

        // ตรวจสอบและดึงข้อมูล eir_match เมื่อ entry_type เป็น IN
        if (equipmentInterchangeReceipt.value.entry_type === 'IN') {
            await fetchEirMatch();
        }

        if (equipmentInterchangeReceipt.value.status_id === 2) {
            disableForm();
            Swal.fire('ใบ EIR นี้ยกเลิกแล้ว', '', 'warning');
        }
        await fetchUserData();
    }
    else {
        const initialData = router.currentRoute.value.query.initialData
            ? JSON.parse(decodeURIComponent(router.currentRoute.value.query.initialData))
            : null;
        if (initialData) {
            await fetchAgents();
            await fetchClients();
            await fetchDrivers();
            await fetchYards();
            await fetchZones();
            console.log(initialData);
            Object.assign(equipmentInterchangeReceipt.value, initialData);
            selectedAgent.value = agents.value.find(agent => agent.agent_id === initialData.agent_id);
            selectedClient.value = clients.value.find(client => client.client_id === initialData.client_id);
            selectedDriver.value = drivers.value.find(drivers => drivers.id === initialData.driver_id)
            selectedZone.value = zones.value.find(zones => zones.zone_id === initialData.zone_id)
            selectedColor.value = colors.find(color => color.name === equipmentInterchangeReceipt.value.container_color);
            selectedYard.value = yards.value.find(yard => yard.yard_id === initialData.yard_id);
            equipmentInterchangeReceipt.value.date = config.defaultDate;
            await fetchUserData();
        }
        else {
            await fetchUserData();
            fetchAgents();
            fetchClients();
            fetchDrivers();
            fetchYards();
            fetchZones();
            await fetchConditions();
            
            conditions.value.forEach(condition => {
                condition.checked = equipmentInterchangeReceipt.value.conditions.some(c => c.condition_id === condition.id);
            });
        }
    }
    loading.value = false; // เสร็จสิ้นการโหลดข้อมูล
});



</script>

<template>
    <div class="relative">
        <div v-if="loading" class="absolute inset-0 bg-gray-200 bg-opacity-75 flex items-center justify-center z-50">
            <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div role="tablist" class="tabs tabs-lifted">
            <input type="radio" name="my_tabs_2" role="tab" class="tab whitespace-nowrap" aria-label="ใบ EIR" checked />
            <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-bold text-center flex-grow">
                        {{ isEditMode ? 'แก้ไขข้อมูล' : 'สร้างข้อมูลใหม่' }}
                    </h2>
                    <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-ghost m-1 "><i class="fa-solid fa-bars"></i>
                        </div>
                        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                            <ExportToPdf :data="equipmentInterchangeReceipt" />
                            <div class="divider my-1"></div>
                            <li><a @click="cancelReceipt">ยกเลิก</a></li>
                        </ul>
                    </div>
                </div>
                <form @submit.prevent>
                    <!-- กลุ่มที่ 1 -->
                    <div class="glass box mb-6 p-4 border rounded-lg">
                        <div class="flex w-full flex-wrap -mx-2">
                            <div class="w-full md:w-1/4 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="receipt_no"> EIR No. <span
                                        class="text-error">*</span>
                                </label>
                                <input v-model="equipmentInterchangeReceipt.receipt_no"
                                    class="input input-bordered w-full text-sm" type="text" id="receipt_no"
                                    autocomplete="off" :readonly="props.isEditMode" />
                            </div>
                            <div class="w-full md:w-2/4 px-2 mb-4"></div>
                            <div class="w-full md:w-1/4 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="date"> วันที่/Date : <span
                                        class="text-error">*</span>
                                </label>
                                <flat-pickr v-model="equipmentInterchangeReceipt.date"
                                    class="input input-bordered w-full text-sm" :config="config"
                                    :disabled="props.isEditMode" />
                            </div>
                            <div class="w-full md:w-1/4 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="entry_type"> ประเภท/Type<span
                                        class="text-error">*</span>
                                </label>
                                <select v-model="equipmentInterchangeReceipt.entry_type"
                                    class="input input-bordered w-full text-sm" id="entry_type"
                                    :disabled="props.isEditMode">
                                    <option value="" disabled selected>เลือกประเภท</option>
                                    <option value="IN">IN</option>
                                    <option value="OUT">OUT</option>
                                </select>
                            </div>
                            <div class="w-full px-4 md:w-2/4 md:px-10 mb-4 flex items-center justify-start">
                                <label class="block text-sm mr-2" for="drop_container"> Drop </label>
                                <div class="form-control">
                                    <input v-model="equipmentInterchangeReceipt.drop_container"
                                        class="toggle toggle-primary" type="checkbox" id="drop_container"
                                        :disabled="props.isEditMode" />
                                </div>
                            </div>

                            <!-- การแสดงผล eir_out_no หรือปุ่ม Match Out -->
                            <div v-if="isEditMode && equipmentInterchangeReceipt.entry_type === 'IN'"
                                class="box mb-6 p-4 border rounded-lg">
                                <div v-if="equipmentInterchangeReceipt.eir_out_no">
                                    <label class="block mb-2 text-sm" for="eir_out_no"> EIR Out No. </label>
                                    <input v-model="equipmentInterchangeReceipt.eir_out_no"
                                        class="input input-bordered w-full text-sm" type="text" id="eir_out_no"
                                        autocomplete="off" readonly />
                                </div>
                                <div v-else>
                                    <button class="btn btn-primary text-sm" @click="matchOut">Match Out</button>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- กลุ่มที่ 2 -->
                    <div class="box mb-6 p-4 border rounded-lg">
                        <div class="flex flex-wrap -mx-2">
                            <div class="w-full md:w-1/2 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="agent"> ตัวแทน/Agent </label>
                                <multiselect v-model="selectedAgent" :options="agents" label="label" track-by="agent_id"
                                    class="text-sm" placeholder="เลือกตัวแทน" />
                            </div>
                            <div class="w-full md:w-1/2 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="client"> ลูกค้า/Shipper </label>
                                <multiselect v-model="selectedClient" :options="clients" label="label"
                                    track-by="client_id" class="text-sm z-0" placeholder="เลือกลูกค้า" />
                            </div>
                            <div class="w-full md:w-1/2 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="yard"> ลานเดิม/Original Yard </label>
                                <multiselect v-model="selectedYard" :options="yards" label="label" track-by="yard_id"
                                    @update:modelValue="handleYardSelection" class="text-sm" placeholder="เลือกลานเดิม">
                                </multiselect>
                            </div>
                            <div class="w-full md:w-1/2 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="booking_bl"> Booking/BL </label>
                                <input v-model="equipmentInterchangeReceipt.booking_bl"
                                    class="input input-bordered w-full text-sm" type="text" id="booking_bl"
                                    autocomplete="off" />
                            </div>
                        </div>
                    </div>

                    <!-- กลุ่มที่ 3 -->
                    <div class="box mb-6 p-4 border rounded-lg">
                        <div class="flex flex-wrap -mx-2">
                            <div class="w-full md:w-1/3 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="container"> หมายเลขตู้/Container No. </label>
                                <input v-model="equipmentInterchangeReceipt.container"
                                    class="input input-bordered w-full text-sm" type="text" id="container"
                                    autocomplete="off" @blur="validateContainerNumber" />
                            </div>
                            <div class="w-full md:w-1/3 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="container_color"> สีตู้/Color </label>
                                <multiselect v-model="selectedColor" :options="colors" label="name" track-by="name"
                                    @update:modelValue="watchSelectedColor" class="text-sm" placeholder="เลือกสีตู้">
                                    <template #option="{ option }">
                                        <span class="inline-block w-4 h-4 rounded-full mr-2"
                                            :style="{ backgroundColor: option.color }"></span>
                                        {{ option.name }}
                                    </template>
                                    <template #singleLabel="{ option }">
                                        <span class="inline-block w-4 h-4 rounded-full mr-2"
                                            :style="{ backgroundColor: option.color }"></span>
                                        {{ option.name }}
                                    </template>
                                </multiselect>
                            </div>

                            <div class="w-full md:w-1/3 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="size_type"> ขนาดและประเภท/Size </label>
                                <multiselect v-model="equipmentInterchangeReceipt.size_type" :options="sizeOptions"
                                    class="text-sm" placeholder="เลือกขนาดและประเภท" />
                            </div>

                            <div class="w-full md:w-1/3 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="seal_no"> หมายเลขซีล/Seal No. </label>
                                <input v-model="equipmentInterchangeReceipt.seal_no"
                                    class="input input-bordered w-full text-sm" type="text" id="seal_no"
                                    autocomplete="off" />
                            </div>
                            <div class="w-full md:w-1/3 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="vessel"> เรือ/Vassel </label>
                                <input v-model="equipmentInterchangeReceipt.vessel"
                                    class="input input-bordered w-full text-sm" type="text" id="vessel"
                                    autocomplete="off" />
                            </div>
                            <div class="w-full md:w-1/3 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="tare"> น้ำหนักตู้เปล่า/Tare </label>
                                <label class="input input-bordered flex items-center gap-2">
                                    <input v-model="equipmentInterchangeReceipt.tare" type="text" id="tare"
                                        autocomplete="off" class="grow" placeholder="Search" />
                                    <span>Kg</span>
                                </label>
                            </div>
                            <div class="w-full md:w-1/3 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="voyage"> เที่ยวเรือ/Voyage </label>
                                <input v-model="equipmentInterchangeReceipt.voyage"
                                    class="input input-bordered w-full text-sm" type="text" id="voyage"
                                    autocomplete="off" />
                            </div>
                        </div>
                    </div>

                    <!-- กลุ่มที่ 4 -->
                    <div class="box mb-6 p-4 border rounded-lg">
                        <div class="flex flex-wrap -mx-2">
                            <div class="w-full md:w-1/3 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="driver"> เลือกคนขับ/Driver </label>
                                <multiselect v-model="selectedDriver" :options="drivers" label="label" track-by="id"
                                    @update:modelValue="handleDriverSelection" class="text-sm" placeholder="เลือกคนขับ">
                                    <template #option="{ option }">
                                        <span><img :src="option.driver_image_path"
                                                class="inline-block w-6 h-6 rounded-full mr-2" /> {{ option.label
                                            }}</span>
                                    </template>
                                    <template #singleLabel="{ option }">
                                        <span><img :src="option.driver_image_path"
                                                class="inline-block w-6 h-6 rounded-full mr-2" /> {{ option.label
                                            }}</span>
                                    </template>
                                </multiselect>
                            </div>
                            <div class="w-full  md:w-2/3  px-2 mb-4">
                                <div v-if="selectedDriver" class="card card-side bg-base-100 shadow-sm">
                                    <figure><img :src="selectedDriver.driver_image_path" alt="Truck" class="w-64" />
                                    </figure>
                                    <div class="card-body">
                                        <h2 class="card-title">{{ selectedDriver.driver_name }}</h2>
                                        <p>ทะเบียนรถบรรทุก: {{ selectedDriver.license_plate }}</p>
                                        <p>รหัสคนขับ: {{ selectedDriver.id }}</p>
                                        <p>บริษัทขนส่ง: {{ selectedDriver.truck_company_name }}</p>
                                        <p>เบอร์โทร: {{ selectedDriver.phone_number }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- กลุ่มที่ 5 -->
                    <div class="box mb-6 p-4 border rounded-lg">
                        <div class="flex flex-wrap -mx-2">
                            <div class="w-full px-2 mb-4">
                                <label class="block mb-2 text-base  font-semibold" for="conditions">
                                    สภาพอุปกรณ์/Conditions
                                </label>
                                <div class="flex flex-wrap">
                                    <div v-for="condition in conditions" :key="condition.id"
                                        class="w-1/2 md:w-1/3 mb-2">
                                        <div class="form-control">
                                            <label class="cursor-pointer label justify-start">
                                                <input type="checkbox" v-model="condition.checked"
                                                    @change="handleConditionChange(condition)"
                                                    class="checkbox checkbox-success" />
                                                <span class="label-text ms-3"><span class="text-base">{{
                                                    condition.name_en
                                                        }}</span> <span class="text-xs  text-slate-700">{{
                                                            condition.name_th
                                                        }}</span></span>
                                            </label>
                                        </div>
                                    </div>

                                    <div class="w-full md:w-1/2 px-2 mb-4">
                                        <label class="block mb-2 text-sm" for="remark"> หมายเหตุ </label>
                                        <textarea v-model="equipmentInterchangeReceipt.remark"
                                            class="textarea textarea-bordered w-full text-sm" id="remark"
                                            autocomplete="off"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- กลุ่มที่ 6 -->
                    <div class="box mb-6 p-4 border rounded-lg">
                        <div class="flex flex-wrap -mx-2">
                            <div class="w-full md:w-1/3 px-2 mb-4">
                                <label class="block mb-2 text-base  font-semibold" for="zone"> โซน </label>
                                <multiselect v-model="selectedZone" :options="zones" label="label" track-by="zone_id"
                                    @update:modelValue="handleZoneSelection" class="text-sm" placeholder="เลือกโซน">
                                </multiselect>
                            </div>
                            <div v-if="selectedZone" class="w-full md:w-2/3 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="path_map"> แผนที่ </label>
                                <img :src="selectedZone.path_map" alt="แผนที่" class="w-full h-auto rounded-md" />
                            </div>

                        </div>
                    </div>

                    <!-- กลุ่มที่ 7 -->
                    <div class="box mb-6 p-4 border rounded-lg">
                        <div class="flex flex-wrap -mx-2">
                            <div class="w-full md:w-1/2 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="driver_sign"> ลายเซ็นคนขับ </label>
                                <input v-model="equipmentInterchangeReceipt.driver_sign"
                                    class="input input-bordered w-full text-sm" type="text" id="driver_sign"
                                    autocomplete="off" />
                            </div>
                            <div class="w-full md:w-1/2 px-2 mb-4">
                                <label class="block mb-2 text-sm" for="receiver_sign"> ลายเซ็นผู้รับ </label>
                                <input v-model="equipmentInterchangeReceipt.receiver_sign"
                                    class="input input-bordered w-full text-sm" type="text" id="receiver_sign"
                                    autocomplete="off" />
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-end">
                        <button class="btn btn-primary text-sm" type="button"
                            @click="isEditMode ? updateReceipt() : createReceipt()">
                            {{ isEditMode ? 'อัปเดตข้อมูล' : 'สร้างข้อมูล' }}
                        </button>
                    </div>
                </form>
            </div>
            <input v-if="isEditMode" type="radio" name="my_tabs_2" role="tab" class="tab whitespace-nowrap"
                aria-label="ใบปฏิบัติงาน" />
            <div v-if="isEditMode" role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">Tab
                content 2
            </div>

            <input v-if="isEditMode" type="radio" name="my_tabs_2" role="tab" class="tab whitespace-nowrap"
                aria-label="Ivoice" />
            <div v-if="isEditMode" role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">Tab
                content 3
            </div>

        </div>

    </div>
</template>

<script>
export default {
    methods: {
        colorLabel(option) {
            return `<span class="inline-block w-4 h-4 rounded-full" style="background-color: ${option.color};"></span> ${option.name}`;
        }
    }
}
</script>

<style>
/* คุณสามารถเพิ่ม CSS เพื่อปรับแต่งการแสดงผลได้ที่นี่ */
</style>
