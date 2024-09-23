<template>
    <div class="mb-6">
        <div class="flex justify-between items-center mt-6">
            <h3 class="text-lg font-bold mb-2">รายการ</h3>
            <!-- Add button for showing the modal -->
            <a @click="showModal = true" class="btn btn-outline btn-success mt-4">เพิ่มรายการ</a>
        </div>
        <div class="tab-container">
            <table class="table w-full text-sm">
                <thead>
                    <tr>
                        <th class="w-10">No.</th>
                        <th class="w-32">ภาษาไทย</th>
                        <th class="w-32">ภาษาอังกฤษ</th>
                        <th class="w-20">จำนวน</th>
                        <th class="w-20">U/C</th>
                        <th class="w-32">ราคารวม</th>
                        <th class="w-32">หมายเหตุ</th>
                        <th class="w-32"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in detailItems" :key="item.id">
                        <td>{{ index + 1 }}</td>
                        <td v-if="!item.isEditing">{{ item.description }}</td>
                        <td v-else><input v-model="item.description" class="input input-sm input-bordered w-full" />
                        </td>
                        <td v-if="!item.isEditing">{{ item.description_eng }}</td>
                        <td v-else><input v-model="item.description_eng" class="input input-sm input-bordered w-full" />
                        </td>
                        <td v-if="!item.isEditing">{{ item.quantity.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4
                        }) }}</td>
                        <td v-else><input v-model.number="item.quantity" @input="updateAmount(item)"
                                class="input input-sm input-bordered w-20" /></td>
                        <td v-if="!item.isEditing">{{ item.unit_price.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4
                        }) }}</td>
                        <td v-else><input v-model.number="item.unit_price" @input="updateAmount(item)"
                                class="input input-sm input-bordered w-full" /></td>
                        <td>{{ item.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2, maximumFractionDigits: 4
                        })
                            }}</td>
                        <td v-if="!item.isEditing">{{ item.remark }}</td>
                        <td v-else><input v-model="item.remark" class="input input-sm input-bordered w-full" /></td>
                        <td>
                            <button v-if="!item.isEditing" @click="item.isEditing = true"
                                class="btn btn-sm btn-warning">แก้ไข</button>
                            <button v-else @click="item.isEditing = false"
                                class="btn btn-sm btn-success">บันทึก</button>
                            <button type="button" @click="removeDetail(index)"
                                class="btn btn-sm btn-danger ml-2">ลบ</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- Summary Section -->
        <div class="mt-6 px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col sm:flex-row sm:justify-end mb-2 text-sm">
                <div class="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 space-y-2">
                    <div class="flex justify-between items-center">
                        <span>รวมเป็นเงิน</span>
                        <span class="text-right">{{ total.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>ส่วนลด</span>
                        <div class="flex items-center">
                            <input v-model.number="discount" type="number"
                                class="input input-xs sm:input-sm input-bordered w-16 sm:w-20 text-right mr-1" />
                            <span class="mr-2">%</span>
                            <a @click="showDiscountModal = true" class="mr-2">
                                <i class="fa-solid fa-pencil"></i>
                            </a>
                            <span class="text-right w-24">{{ discountAmount.toLocaleString('en-US', {
                                minimumFractionDigits: 2, maximumFractionDigits: 2
                            }) }}</span>
                        </div>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>ราคาหลังหักส่วนลด</span>
                        <span class="text-right">{{ totalAfterDiscount.toLocaleString('en-US', {
                            minimumFractionDigits:
                                2, maximumFractionDigits: 2
                        }) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center">
                            <input type="checkbox" v-model="includeVat"
                                class="checkbox checkbox-xs sm:checkbox-sm mr-2" />
                            <span>ภาษีมูลค่าเพิ่ม 7%</span>
                        </div>
                        <span class="text-right">{{ vatAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }) }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>จำนวนเงินรวมทั้งสิ้น</span>
                        <span class="font-bold text-lg sm:text-xl text-right">{{ grandTotal.toLocaleString('en-US', {
                            minimumFractionDigits: 2, maximumFractionDigits: 2
                        }) }}</span>
                    </div>
                    <div class="divider my-1"></div>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center">
                            <input type="checkbox" v-model="includeWithholdingTax"
                                class="checkbox checkbox-xs sm:checkbox-sm mr-2" />
                            <span>หักภาษี ณ ที่จ่าย</span>
                        </div>
                        <div class="flex items-center">
                            <select v-model.number="withholdingTaxRate"
                                class="select select-xs sm:select-sm select-bordered w-16 sm:w-20 mr-2">
                                <option value="0">0%</option>
                                <option value="1">1%</option>
                                <option value="2">2%</option>
                                <option value="3">3%</option>
                                <option value="5">5%</option>
                                <option value="10">10%</option>
                            </select>
                            <span class="text-right w-24">{{ withholdingTaxAmount.toLocaleString('en-US', {
                                minimumFractionDigits: 2, maximumFractionDigits: 2
                            }) }}</span>
                        </div>
                    </div>
                    <div v-if="grandTotal >= 1000 && !includeWithholdingTax"
                        class="text-error text-xs sm:text-sm text-right">
                        ยอดรวมทั้งสิ้นเกิน 1,000 บาท แต่ไม่ได้ทำการหัก ณ. ที่จ่าย
                    </div>
                    <div class="flex justify-between items-center">
                        <span>ยอดชำระ</span>
                        <span class="text-right">{{ paymentAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal for adding new items -->
        <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50 p-4">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div class="p-4 sm:p-6">
                    <h3 class="text-lg font-bold mb-4">เลือกรายการ</h3>
                    <div class="overflow-x-auto">
                        <table class="table w-full text-sm table-zebra">
                            <thead class="hidden sm:table-header-group">
                                <tr>
                                    <th>ชื่อสินค้า (ไทย)</th>
                                    <th>ชื่อสินค้า (อังกฤษ)</th>
                                    <th>ราคา</th>
                                    <th>ภาษีมูลค่าเพิ่ม 7%</th>
                                    <th>ราคารวมภาษี</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in productPrices" :key="item.price_list_id"
                                    class="block sm:table-row mb-4 sm:mb-0">
                                    <td data-label="ชื่อสินค้า (ไทย)" class="block sm:table-cell mb-1 sm:mb-0">
                                        <span class="font-bold sm:hidden">ชื่อสินค้า (ไทย): </span>{{ item.name_th }}
                                    </td>
                                    <td data-label="ชื่อสินค้า (อังกฤษ)" class="block sm:table-cell mb-1 sm:mb-0">
                                        <span class="font-bold sm:hidden">ชื่อสินค้า (อังกฤษ): </span>{{ item.name_eng
                                        }}
                                    </td>
                                    <td data-label="ราคา" class="block sm:table-cell mb-1 sm:mb-0">
                                        <span class="font-bold sm:hidden">ราคา: </span>{{
                                            item.price.toLocaleString('en-US', { minimumFractionDigits: 2,
                                        maximumFractionDigits: 4 }) }}
                                    </td>
                                    <td data-label="ภาษีมูลค่าเพิ่ม 7%" class="block sm:table-cell mb-1 sm:mb-0">
                                        <span class="font-bold sm:hidden">ภาษีมูลค่าเพิ่ม 7%: </span>{{ (item.price *
                                            0.07).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits:
                                        4 }) }}
                                    </td>
                                    <td data-label="ราคารวมภาษี" class="block sm:table-cell mb-1 sm:mb-0">
                                        <span class="font-bold sm:hidden">ราคารวมภาษี: </span>{{ (item.price *
                                            1.07).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits:
                                        4 }) }}
                                    </td>
                                    <td class="block sm:table-cell">
                                        <button @click="addItem(item)"
                                            class="btn btn-primary btn-sm w-full sm:w-auto">เพิ่ม</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="flex justify-end mt-4">
                        <button @click="showModal = false" class="btn btn-secondary">ปิด</button>
                    </div>
                </div>
            </div>
        </div>
        <!-- Modal for entering discount amount -->
        <div v-if="showDiscountModal" class="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
            <div class="bg-white p-6 rounded shadow-lg">
                <h3 class="text-lg font-bold mb-2">กรอกจำนวนเงินส่วนลด</h3>
                <input v-model.number="discountAmountInput" type="number" class="input input-bordered w-full mb-4" />
                <a @click="applyDiscountAmount" class="btn btn-primary">บันทึก</a>
                <a @click="showDiscountModal = false" class="btn btn-secondary ml-2">ยกเลิก</a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

import CONFIG from '../../config/config';

const props = defineProps({
    detailItems: Array,
    form: Object,
    equipmentInterchangeReceipt: Object
});

const emits = defineEmits(['remove-detail', 'add-item', 'update-form']);

const localEquipmentInterchangeReceipt = reactive({
    agent_id: 0,
    yard_id: 0,
    size_type: ''
});

const showModal = ref(false);
const showDiscountModal = ref(false);
const discountAmountInput = ref(0);
const productPrices = ref([]);
const discount = ref(0);
const includeVat = ref(true);
const includeWithholdingTax = ref(false);
const withholdingTaxRate = ref(3);

const updateAmount = (item) => {
    item.amount = item.quantity * item.unit_price;
};

const removeDetail = (index) => {
    Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "คุณต้องการลบรายการนี้หรือไม่?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            emits('remove-detail', index);
        }
    });
};

const fetchProductPrices = async () => {
    const agent_id = localEquipmentInterchangeReceipt.agent_id || 0;
    const yards_id = localEquipmentInterchangeReceipt.yard_id || 0;
    const size = localEquipmentInterchangeReceipt.size_type || '0';  // ปรับขนาดให้ไม่เป็นค่าว่าง

    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/common/getProductPrices`, {
            params: { agent_id, yards_id, size }
        });
        // console.log(response);
        productPrices.value = response.data.map(item => ({
            ...item,
            vat: (item.price * 0.07).toFixed(4),
            priceWithVat: (item.price * 1.07).toFixed(4)
        }));
    } catch (error) {
        console.error('Error fetching product prices:', error);
    }
};

const addItem = (item) => {
    const newItem = {
        id: Date.now(), // Generate a unique id
        description: item.name_th,
        description_eng: item.name_eng,
        quantity: 1,
        unit_price: parseFloat(item.price),
        amount: parseFloat(item.price),
        remark: item.remark,
        price_list_id: item.price_list_id
    };
    emits('add-item', newItem);
    showModal.value = false; // Close the modal after adding item
};

const applyDiscountAmount = () => {
    discount.value = (discountAmountInput.value / total.value) * 100;
    showDiscountModal.value = false;
};

const total = computed(() => {
    return props.detailItems.reduce((sum, item) => sum + item.amount, 0);
});

const discountAmount = computed(() => {
    return total.value * (discount.value / 100);
});

const totalAfterDiscount = computed(() => {
    return total.value - discountAmount.value;
});

const vatAmount = computed(() => {
    return includeVat.value ? totalAfterDiscount.value * 0.07 : 0;
});

const grandTotal = computed(() => {
    return totalAfterDiscount.value + vatAmount.value;
});

const withholdingTaxAmount = computed(() => {
    return includeWithholdingTax.value ? totalAfterDiscount.value * (withholdingTaxRate.value / 100) : 0;
});

const paymentAmount = computed(() => {
    return grandTotal.value - withholdingTaxAmount.value;
});

watch(
    [total, vatAmount, withholdingTaxAmount, discountAmount, totalAfterDiscount, grandTotal, paymentAmount, withholdingTaxRate, includeWithholdingTax],
    ([newTotal, newVatAmount, newWithholdingTaxAmount, newDiscountAmount, newTotalAfterDiscount, newGrandTotal, newPaymentAmount, newWithholdingTaxRate, newIncludeWithholdingTax]) => {
        props.form.total_amount = newTotal;
        props.form.vat_amount = newVatAmount;
        props.form.total_with_holding_tax = newWithholdingTaxAmount;
        props.form.total_discount = newDiscountAmount;
        props.form.net_total = newTotalAfterDiscount;
        props.form.grand_total = newGrandTotal;
        props.form.payment_total = newPaymentAmount;
        props.form.wht_status = newIncludeWithholdingTax ? newWithholdingTaxRate : null;
    }
);

onMounted(() => {
    Object.assign(localEquipmentInterchangeReceipt, props.equipmentInterchangeReceipt);
    if (total.value === 0) {
        discount.value = 0;
    } else {
        discount.value = (props.form.total_discount / total.value) * 100;
    }

    includeWithholdingTax.value = props.form.wht_status !== null;
    withholdingTaxRate.value = props.form.wht_status !== null ? props.form.wht_status : 3;
    fetchProductPrices();
});
</script>



<style scoped>
.tab-container {
    width: 100%;
    max-width: 100vw;
    overflow-x: auto;
}

.tabs {
    min-width: max-content;
}

/* ซ่อน scrollbar สำหรับ Chrome, Safari และ Opera */
.tab-container::-webkit-scrollbar {
    display: none;
}

/* ซ่อน scrollbar สำหรับ IE, Edge และ Firefox */
.tab-container {
    -ms-overflow-style: none;
    /* IE และ Edge */
    scrollbar-width: none;
    /* Firefox */
}
</style>
