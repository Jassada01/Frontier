<template>
    <div class="price-table p-4 overflow-x-auto">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">รายการราคา</h1>
            <button class="btn btn-primary" @click="openModal(null)">
                <i class="fa fa-plus-square mr-2"></i> เพิ่มราคา
            </button>
        </div>
        <table id="priceTable" class="table table-auto w-full">
            <thead>
                <tr>
                    <th class="p-4"></th> <!-- Column for the arrow -->
                    <th class="p-4">ชื่อภาษาไทย</th>
                    <th class="p-4">ชื่อภาษาอังกฤษ</th>
                    <th class="p-4">ราคา</th>
                    <th class="p-4">หมายเหตุ</th>
                    <th class="p-4">Action</th>
                </tr>
            </thead>
        </table>

        <!-- Modal สำหรับเพิ่มหรือแก้ไข price_list -->
        <div v-if="showModal" class="modal modal-open">
            <div class="modal-box">
                <h3 class="font-bold text-lg">{{ isEditMode ? 'แก้ไขราคา' : 'เพิ่มราคาใหม่' }}</h3>
                <form @submit.prevent="submitForm" class="mt-4">
                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">ชื่อภาษาไทย</span>
                        </label>
                        <input type="text" v-model="formData.name_th" class="input input-bordered" required>
                    </div>
                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">ชื่อภาษาอังกฤษ</span>
                        </label>
                        <input type="text" v-model="formData.name_eng" class="input input-bordered" required>
                    </div>
                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">ราคามาตรฐาน (ไม่รวม VAT)</span>
                        </label>
                        <label class="input input-bordered flex items-center gap-2">
                            <input v-model.number="formData.price" type="text" id="price" autocomplete="off"
                                class="grow" placeholder="ระบุราคา" />
                            <span>บาท</span>
                        </label>
                        <div class="label" v-if="formData.price">
                            <span class="label-text-alt">VAT 7% : {{ vatPrice }} บาท</span>
                            <span class="label-text-alt">ราคารวม VAT : {{ totalPrice }} บาท</span>
                        </div>
                    </div>
                    <div class="form-control mb-4">
                        <label class="label">
                            <span class="label-text">หมายเหตุ</span>
                        </label>
                        <input type="text" v-model="formData.note" class="input input-bordered">
                    </div>
                    <div class="modal-action">
                        <button class="btn" type="button" @click="closeModal">ยกเลิก</button>
                        <button class="btn btn-primary" type="submit">
                            {{ isEditMode ? 'อัปเดต' : 'เพิ่ม' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- CustomPriceModal component -->
        <CustomPriceModal :show="showCustomPriceModal" :price="selectedPrice" :customPrice="selectedCustomPrice"
            @close="closeCustomPriceModal" @submitted="fetchPrices" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import axios from 'axios';
import CONFIG from '../../config/config';
import CustomPriceModal from './CustomPriceModal.vue';
import $ from 'jquery';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net-dt';
import 'datatables.net';
import Swal from 'sweetalert2'

const prices = ref([]);
const showModal = ref(false);
const showCustomPriceModal = ref(false);
const isEditMode = ref(false);
const selectedPrice = ref(null);
const selectedCustomPrice = ref(null);

const formData = ref({
    id: null,
    name_th: '',
    name_eng: '',
    price: '',
    note: ''
});

const vatPrice = computed(() => (formData.value.price * 0.07).toFixed(2));
const totalPrice = computed(() => (formData.value.price + parseFloat(vatPrice.value)).toFixed(2));

onMounted(async () => {
    await fetchPrices();
    nextTick(() => {
        initializeDataTable();
        showAllChildRows(); // แสดง child rows ทุกแถวหลังจากโหลดข้อมูลเสร็จแล้ว
    });
});

const fetchPrices = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/prices/get`);
        prices.value = response.data;
    } catch (error) {
        console.error('Error fetching prices:', error);
    }
};

const initializeDataTable = () => {
    const table = $('#priceTable').DataTable({
        data: prices.value,
        columns: [
            {
                className: 'details-control',
                orderable: false,
                data: null,
                defaultContent: '<i class="fa-solid fa-angle-down"></i>'
            },
            { data: 'name_th', title: 'ชื่อภาษาไทย' },
            { data: 'name_eng', title: 'ชื่อภาษาอังกฤษ' },
            { data: 'price', title: 'ราคามาตรฐาน(ไม่รวม VAT)' },
            { data: 'note', title: 'หมายเหตุ' },
            {
                data: null,
                title: 'Action',
                render: (data, type, row) => `
                    <button class="btn btn-sm btn-circle edit-button" data-id="${row.id}">
                        <i class="fa fa-pencil text-primary"></i>
                    </button>
                    <button class="btn btn-sm btn-circle add-button" data-id="${row.id}">
                        <i class="fa fa-plus text-success"></i>
                    </button>
                `
            }
        ],
        order: [[1, 'asc']]
    });

    $('#priceTable tbody').on('click', 'td.details-control', function () {
        const tr = $(this).closest('tr');
        const row = table.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        } else {
            row.child(format(row.data())).show();
            tr.addClass('shown');
        }
    });

    $('#priceTable tbody').on('click', '.edit-button', function () {
        const id = $(this).data('id');
        const price = prices.value.find(price => price.id === id);
        openModal(price);
    });

    $('#priceTable tbody').on('click', '.add-button', function () {
        const id = $(this).data('id');
        const price = prices.value.find(price => price.id === id);
        openCustomPriceModal(price);
    });

    $('#priceTable tbody').on('click', '.edit-custom-button', function () {
        const priceId = $(this).data('price-id');
        const customPriceId = $(this).data('custom-price-id');
        const price = prices.value.find(price => price.id === priceId);
        const customPrice = price.customprice.find(custom => custom.custom_price_id === customPriceId);
        openCustomPriceModal(price, customPrice);
    });
};

const showAllChildRows = () => {
    const table = $('#priceTable').DataTable();
    table.rows().every(function () {
        this.child(format(this.data())).show();
        $(this.node()).addClass('shown');
    });
};

const format = (data) => {
    if (!data.customprice || data.customprice.length === 0) {
        return '<table class="table w-full ms-20"><tr><td colspan="5" class="text-center">ไม่มีข้อมูล</td></tr></table>';
    }
    let table = '<table class="table w-full ms-20"><thead><th>Agent</th><th>ลานอ้างอิง</th><th>ขนาด</th><th>ราคา(ไม่รวม VAT)</th><th></th></tr></thead><tbody>';
    data.customprice.forEach(custom => {
        table += `<tr>
            <td>${custom.agent_code}</td>
            <td>${custom.yard_short_name}</td>
            <td>${custom.size}</td>
            <td>${custom.custom_price}</td>
            <td><button class="btn btn-sm btn-circle edit-custom-button" data-price-id="${data.id}" data-custom-price-id="${custom.custom_price_id}"><i class="fa fa-pencil"></i></button></td>
        </tr>`;
    });
    table += '</tbody></table>';
    return table;
};

const openModal = (price) => {
    if (price) {
        isEditMode.value = true;
        formData.value = { ...price };
    } else {
        isEditMode.value = false;
        formData.value = {
            id: null,
            name_th: '',
            name_eng: '',
            price: '',
            note: ''
        };
    }
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const submitForm = async () => {
    try {
        if (isEditMode.value) {
            await axios.put(`${CONFIG.API_SERVER}/api/prices/update/${formData.value.id}`, formData.value);
        } else {
            await axios.post(`${CONFIG.API_SERVER}/api/prices/add`, formData.value);
        }
        Swal.fire({
            icon: 'success',
            title: 'ดำเนินการเสร็จสิ้น',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            location.reload();
        });
    } catch (error) {
        console.error('Error saving price:', error);
    }
};

const openCustomPriceModal = (price, customPrice = null) => {
    selectedPrice.value = price;
    selectedCustomPrice.value = customPrice;
    showCustomPriceModal.value = true;
};

const closeCustomPriceModal = () => {
    showCustomPriceModal.value = false;
};
</script>

<style scoped>
.details-control {
    cursor: pointer;
    text-align: center;
}

tr.shown td.details-control:before {
    content: "-";
}

td.details-control:before {
    content: "+";
}
</style>
