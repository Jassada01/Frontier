<template>
    <div>
        <button @click="openModal" class="btn btn-outline btn-primary"><i class="fa-solid fa-clock"></i>
            เพิ่มแจ้ง Detention</button>
        <div v-if="isModalOpen" class="modal modal-open">
            <div class="modal-box">
                <h3 class="font-bold text-lg">เพิ่มแจ้ง Detention</h3>
                <form @submit.prevent="submitDetention">
                    <div class="mb-4">
                        <label class="block mb-2 text-sm" for="detention_datetime">วัน/เวลา</label>
                        <flat-pickr v-model="detentionDatetime" class="input input-bordered w-full text-sm"
                            :config="config" />
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2 text-sm" for="remark">หมายเหตุ</label>
                        <textarea v-model="remark" class="textarea textarea-bordered w-full text-sm" id="remark"
                            autocomplete="off"></textarea>
                    </div>
                    <div class="modal-action">
                        <button type="button" class="btn" @click="closeModal">ยกเลิก</button>
                        <button type="submit" class="btn btn-primary">บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import FlatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import CONFIG from '../../../config/config'
import { Thai } from 'flatpickr/dist/l10n/th.js';

const emit = defineEmits(['detentionSaved']);

const detentionDatetime = ref(null);
const remark = ref('');
const isModalOpen = ref(false);

const openModal = () => {
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
};

const config = {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    altInput: true,
    altFormat: "j M Y H:i",
    locale: Thai, // กำหนด locale เป็นภาษาไทย
};

const props = defineProps({
    eirId: Number
});

const submitDetention = async () => {
    if (!detentionDatetime.value) {
        Swal.fire('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        return;
    }

    try {
        await axios.post(`${CONFIG.API_SERVER}/api/detentionLogs`, {
            EIR_ID: props.eirId,
            detention_datetime: detentionDatetime.value,
            remark: remark.value
        });
        Swal.fire('Success', 'เพิ่มแจ้ง Detention สำเร็จ', 'success');
        closeModal();
        emit('detentionSaved'); // Emit event after saving
        
    } catch (error) {
        Swal.fire('Error', `Error adding detention log: ${error.response?.data?.message || error.message}`, 'error');
    }
};
</script>

<style scoped>
.modal-open {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>