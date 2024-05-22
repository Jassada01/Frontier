<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const props = defineProps({
  isEditMode: Boolean,
  clientId: Number
})

const router = useRouter()

const client = ref({
  client_code: '',
  name: '',
  branch: '',
  address: '',
  billing_address: '',
  tax_id: '',
  contact_person: '',
  phone: '',
  email: '',
  attribute1: '',
  attribute2: '',
  attribute3: '',
  attribute4: '',
  attribute5: '',
  line_token: '',
  is_active: true,
  remark: ''
})

const fetchClientData = async (id) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/client/get?client_id=${id}`)
    const clientData = response.data[0]
    clientData.is_active = clientData.is_active === 1
    Object.assign(client.value, clientData)
  } catch (error) {
    Swal.fire('Error', 'Error fetching client data: ' + error.response.data.message, 'error')
  }
}

const createClient = async () => {
  try {
    client.value.is_active = client.value.is_active ? 1 : 0
    const response = await axios.post('http://localhost:3000/api/client/add', client.value)
    Swal.fire('Success', 'สร้างข้อมูลลูกค้าสำเร็จ', 'success').then(() => {
      router.push({ path: `/Client/${response.data.client_id}`})
    })
  } catch (error) {
    Swal.fire('Error', 'Error creating client: ' + error.response.data.message, 'error')
  }
}

const updateClient = async () => {
  try {
    client.value.is_active = client.value.is_active ? 1 : 0
    await axios.put(`http://localhost:3000/api/client/update/${props.clientId}`, client.value)
    Swal.fire('Success', 'อัพเดทข้อมูลสำเร็จ', 'success').then(() => {
      window.location.reload()
    })
  } catch (error) {
    Swal.fire('Error', 'Error updating client: ' + error.response.data.message, 'error')
  }
}

onMounted(() => {
  if (props.isEditMode) {
    fetchClientData(props.clientId)
  }
});
</script>

<template>
  <div class="bg-base-200 mx-auto mt-10 p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4 text-center">
      {{ isEditMode ? 'แก้ไขลูกค้า' : 'สร้างลูกค้าใหม่' }}
    </h2>
    <form @submit.prevent>
      <div class="mb-4 flex items-center">
        <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="client_code">
          รหัสลูกค้า <span class="text-error">*</span>
        </label>
        <input
          v-model="client.client_code"
          class="input input-bordered w-1/3 text-sm"
          type="text"
          id="client_code"
          autocomplete="off"
          required
        />
      </div>
      <div class="mb-4 flex items-center">
        <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="name">
          ชื่อ <span class="text-error">*</span>
        </label>
        <input
          v-model="client.name"
          class="input input-bordered w-2/3 text-sm"
          type="text"
          id="name"
          autocomplete="off"
          required
        />
      </div>
      <div class="mb-4 flex items-center">
        <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="branch"> สาขา </label>
        <input
          v-model="client.branch"
          class="input input-bordered w-1/3 text-sm"
          type="text"
          id="branch"
          autocomplete="off"
        />
      </div>
      <div class="mb-4 flex items-center">
        <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="address"> ที่อยู่ </label>
        <textarea
          v-model="client.address"
          class="textarea textarea-bordered w-2/3 text-sm"
          id="address"
          autocomplete="off"
        ></textarea>
      </div>
      <div class="mb-4 flex items-center">
        <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="billing_address">
          ที่อยู่สำหรับเรียกเก็บเงิน
        </label>
        <textarea
          v-model="client.billing_address"
          class="textarea textarea-bordered w-2/3 text-sm"
          id="billing_address"
          autocomplete="off"
        ></textarea>
      </div>
      <div class="mb-4 flex items-center">
        <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="tax_id">
          เลขประจำตัวผู้เสียภาษี
        </label>
        <input
          v-model="client.tax_id"
          class="input input-bordered w-1/3 text-sm"
          type="text"
          id="tax_id"
          autocomplete="off"
        />
      </div>
      <div class="mb-4 flex items-center">
        <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="contact_person">
          ผู้ติดต่อ
        </label>
        <input
          v-model="client.contact_person"
          class="input input-bordered w-2/3 text-sm"
          type="text"
          id="contact_person"
          autocomplete="off"
        />
      </div>
      <div class="mb-4 flex items-center">
        <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="phone"> เบอร์โทรศัพท์ </label>
        <input
          v-model="client.phone"
          class="input input-bordered w-1/3 text-sm"
          type="text"
          id="phone"
          autocomplete="off"
        />
      </div>
      <div class="mb-4 flex items-center">
        <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="email"> อีเมล </label>
        <input
          v-model="client.email"
          class="input input-bordered w-1/3 text-sm"
          type="email"
          id="email"
          autocomplete="off"
        />
      </div>
      <div class="mb-4 flex items-center">
        <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="attribute1">
          Payment term
        </label>
        <label class="input-group">
          <input
            v-model="client.attribute1"
            class="input input-bordered w-1/3 text-sm"
            type="text"
            id="attribute1"
            autocomplete="off"
          />
          <span class="ms-1">วัน</span>
        </label>
      </div>
      <div class="mb-4 flex items-center">
        <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="line_token"> Line Token </label>
        <input
          v-model="client.line_token"
          class="input input-bordered w-3/6 text-sm"
          type="text"
          id="line_token"
          autocomplete="off"
        />
        <button class="btn btn-success ms-1 w-1/6 d-none">ทดสอบ</button>
      </div>
      <div class="mb-4 flex items-center">
        <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="is_active"> เปิดใช้งาน </label>
        <div class="form-control w-2/3">
          <input
            v-model="client.is_active"
            class="toggle toggle-primary"
            type="checkbox"
            id="is_active"
          />
        </div>
      </div>
      <div class="mb-4 flex items-center">
        <label class="block pe-5 text-end mb-2 w-1/3 text-sm" for="remark"> หมายเหตุ </label>
        <textarea
          v-model="client.remark"
          class="textarea textarea-bordered w-2/3 text-sm"
          id="remark"
          autocomplete="off"
        ></textarea>
      </div>
      <div class="flex items-center justify-end">
        <button
          class="btn btn-primary text-sm"
          type="button"
          @click="isEditMode ? updateClient() : createClient()"
        >
          {{ isEditMode ? 'อัปเดตลูกค้า' : 'สร้างลูกค้า' }}
        </button>
      </div>
    </form>
  </div>
</template>
