<template>
    <div v-if="show" class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg">{{ isEditMode ? 'แก้ไขข้อมูลราคาเฉพาะ' : 'เพิ่มข้อมูลราคาเฉพาะ' }}</h3>
            <form @submit.prevent="submitForm" class="mt-4">
                <div class="form-control mb-4">
                    <label class="label">
                        <span class="label-text">ชื่อภาษาไทย</span>
                    </label>
                    <input type="text" v-model="customPriceData.name_th" class="input input-bordered" readonly>
                </div>
                <div class="form-control mb-4">
                    <label class="label">
                        <span class="label-text">ชื่อภาษาอังกฤษ</span>
                    </label>
                    <input type="text" v-model="customPriceData.name_eng" class="input input-bordered" readonly>
                </div>
                <div class="form-control mb-4">
                    <label class="label">
                        <span class="label-text">ตัวแทน/Agent</span>
                    </label>
                    <multiselect v-model="selectedAgent" :options="agents" label="label" track-by="id"
                        placeholder="เลือกตัวแทน"></multiselect>
                </div>
                <div class="form-control mb-4">
                    <label class="label">
                        <span class="label-text">ลาน/Yard</span>
                    </label>
                    <multiselect v-model="selectedYard" :options="yards" label="label" track-by="id"
                        placeholder="เลือกลาน"></multiselect>
                </div>
                <div class="form-control mb-4">
                    <label class="label">
                        <span class="label-text">ขนาดและประเภท/Size</span>
                    </label>
                    <multiselect v-model="selectedSize" :options="sizeOptions" placeholder="เลือกขนาดและประเภท">
                    </multiselect>
                </div>
                <div class="form-control mb-4">
                    <label class="label">
                        <span class="label-text">ราคา</span>
                    </label>
                        <label class="input input-bordered flex items-center gap-2">
                            <input v-model.number="customPriceData.custom_price" type="text" id="price" autocomplete="off"
                                class="grow" placeholder="ระบุราคา" required/>
                            <span>บาท</span>
                        </label>
                    <div class="label" v-if="customPriceData.custom_price">
                        <span class="label-text-alt">VAT 7% : {{ vatPrice }} บาท</span>
                        <span class="label-text-alt">ราคารวม VAT : {{ totalPrice }} บาท</span>
                    </div>
                </div>
                <div class="modal-action">
                    <button class="btn" type="button" @click="close">ยกเลิก</button>
                    <button class="btn btn-primary" type="submit">{{ isEditMode ? 'อัปเดต' : 'เพิ่ม' }}</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watchEffect, onMounted, computed } from 'vue';
import axios from 'axios';
import Multiselect from 'vue-multiselect';
import Swal from 'sweetalert2'
import CONFIG from '../../config/config';

const props = defineProps({
    show: Boolean,
    price: Object,
    customPrice: Object
});

const emit = defineEmits(['close', 'submitted']);

const customPriceData = ref({
    name_th: '',
    name_eng: '',
    main_price_list_id: null,
    custom_price_id: '',
    agent_id: null,
    yards_id: null,
    size: '',
    custom_price: 0,
    price: 0,
    price_custom_id: 0
});

const agents = ref([]);
const yards = ref([]);
const sizeOptions = CONFIG.CONTAINE_SIZE;

const vatPrice = computed(() => (customPriceData.value.custom_price * 0.07).toFixed(2));
const totalPrice = computed(() => (customPriceData.value.custom_price + parseFloat(vatPrice.value)).toFixed(2));

const selectedAgent = ref(null);
const selectedYard = ref(null);
const selectedSize = ref(null);

const isEditMode = ref(false);

watchEffect(() => {
    if (props.price) {
        customPriceData.value.name_th = props.price.name_th;
        customPriceData.value.name_eng = props.price.name_eng;
        customPriceData.value.main_price_list_id = props.price.id;
    }
    if (props.customPrice) {
        customPriceData.value.custom_price_id = props.customPrice.custom_price_id;
        customPriceData.value.agent_id = props.customPrice.agent_id;
        customPriceData.value.yards_id = props.customPrice.yards_id;
        customPriceData.value.size = props.customPrice.size;
        customPriceData.value.custom_price = props.customPrice.custom_price;

        selectedAgent.value = agents.value.find(agent => agent.id === props.customPrice.agent_id);
        selectedYard.value = yards.value.find(yard => yard.id === props.customPrice.yards_id);
        selectedSize.value = sizeOptions.find(size => size === props.customPrice.size);

        isEditMode.value = true;
    } else {
        customPriceData.value.custom_price_id = null;
        customPriceData.value.agent_id = null;
        customPriceData.value.yards_id = null;
        customPriceData.value.size = '';
        customPriceData.value.custom_price = '';

        selectedAgent.value = null;
        selectedYard.value = null;
        selectedSize.value = null;

        isEditMode.value = false;
    }
});

onMounted(async () => {
    await fetchAgents();
    await fetchYards();
});

const fetchAgents = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/agents/get?active=true`);
        agents.value = response.data.map(agent => ({
            id: agent.agent_id,
            label: `${agent.agent_code} - ${agent.company_name}`
        }));
    } catch (error) {
        console.error('Error fetching agents:', error);
    }
};

const fetchYards = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/yards/get?active=true`);
        yards.value = response.data.map(yard => ({
            id: yard.id,
            label: `${yard.short_name} - ${yard.yard_name}`
        }));
    } catch (error) {
        console.error('Error fetching yards:', error);
    }
};

const submitForm = async () => {
    try {
        customPriceData.value.agent_id = selectedAgent.value.id;
        customPriceData.value.yards_id = selectedYard.value.id;
        customPriceData.value.size = selectedSize.value;
        customPriceData.value.price = customPriceData.value.custom_price;
        customPriceData.value.price_custom_id = customPriceData.value.custom_price_id;
        console.log(customPriceData.value);
        if (isEditMode.value) {
            await axios.put(`${CONFIG.API_SERVER}/api/price_custom/update/${customPriceData.value.custom_price_id}`, customPriceData.value);
        } else {
            await axios.post(`${CONFIG.API_SERVER}/api/price_custom/add`, customPriceData.value);
        }
        emit('submitted');
        close();

        // Show success message and refresh the page
        Swal.fire({
            icon: 'success',
            title: 'ดำเนินการเสร็จสิ้น',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            location.reload();
        });
    } catch (error) {
        console.error('Error saving custom price:', error);
    }
};


const close = () => {
    emit('close');
};
</script>

<style scoped>
/* DaisyUI styles are already included via Tailwind CSS */
</style>
