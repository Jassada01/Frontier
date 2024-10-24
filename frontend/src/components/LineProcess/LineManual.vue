<script setup>
import { ref } from 'vue';

const currentStep = ref(1);
const totalSteps = 7;  // Updated to include all steps

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};
</script>

<template>
  <div class="manual-container bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">คู่มือการใช้งาน Giraffe Container</h2>
      <p class="text-gray-600 mt-2">ขั้นตอนการเข้าใช้งานระบบเพื่อขอรับ และขอคืนตู้</p>
    </div>

    <!-- Progress Bar -->
    <div class="w-full bg-gray-200 rounded-full h-2.5 mb-6">
      <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        :style="{ width: `${(currentStep / totalSteps) * 100}%` }"></div>
    </div>

    <!-- Step Counter -->
    <div class="text-center mb-6">
      <span class="text-sm text-gray-600">ขั้นตอนที่ {{ currentStep }} จาก {{ totalSteps }}</span>
    </div>

    <!-- Steps Content -->
    <div class="steps-content mb-8">
      <!-- Step 1: Initial Login -->
      <div v-if="currentStep === 1" class="step-item">
        <div class="text-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">การเข้าสู่ระบบ</h3>
        </div>
        <div class="flex flex-col items-center">
          <img src="../../assets/media/lineManual/login.jpg" alt="หน้าเข้าสู่ระบบ"
            class="rounded-lg shadow-md mb-4 max-w-xs">
          <div class="instruction-text text-center">
            <p class="text-gray-700">1. กดปุ่ม "เข้าสู่ระบบ" ที่แสดงในหน้าแรกของแอพพลิเคชัน</p>
            <p class="text-gray-600 mt-2">ระบบจะนำท่านไปยังหน้าเข้าสู่ระบบผ่าน LINE</p>
          </div>
        </div>
      </div>

      <!-- Step 2: LINE Authorization -->
      <div v-if="currentStep === 2" class="step-item">
        <div class="text-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">อนุญาตการเข้าใช้งานผ่าน LINE</h3>
        </div>
        <div class="flex flex-col items-center">
          <img src="../../assets/media/lineManual/Manual_Line (10).jpg" alt="หน้าอนุญาตการใช้งาน LINE"
            class="rounded-lg shadow-md mb-4 max-w-xs">
          <div class="instruction-text text-center">
            <div class="bg-yellow-50 p-4 rounded-lg mb-4">
              <p class="text-yellow-800 font-semibold">สำหรับการเข้าสู่ระบบครั้งแรก</p>
            </div>
            <p class="text-gray-700">2. กดปุ่ม "อนุญาต" เพื่อให้ระบบสามารถเข้าถึงข้อมูล LINE ของคุณ</p>
          </div>
        </div>
      </div>

      <!-- Step 3: User Type Selection -->
      <div v-if="currentStep === 3" class="step-item">
        <div class="text-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">เลือกประเภทผู้ใช้งาน</h3>
        </div>
        <div class="flex flex-col items-center">
          <img src="../../assets/media/lineManual/Manual_Line (11).jpg" alt="หน้าเลือกประเภทผู้ใช้งาน"
            class="rounded-lg shadow-md mb-4 max-w-xs">
          <div class="instruction-text text-center">
            <div class="bg-blue-50 p-4 rounded-lg mb-4">
              <p class="text-blue-800">เลือกประเภทผู้ใช้งานตามสิทธิ์ของท่าน</p>
            </div>
            <p class="text-gray-700">3. เลือก "ลงทะเบียนสำหรับลูกค้า" สำหรับผู้ใช้งานทั่วไป</p>
          </div>
        </div>
      </div>

      <!-- Step 4: Registration Form -->
      <div v-if="currentStep === 4" class="step-item">
        <div class="text-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">กรอกข้อมูลลงทะเบียน</h3>
        </div>
        <div class="flex flex-col items-center">
          <img src="../../assets/media/lineManual/Manual_Line (12).jpg" alt="หน้าลงทะเบียน"
            class="rounded-lg shadow-md mb-4 max-w-xs">
          <div class="instruction-text text-center">
            <p class="text-gray-700 mb-2">4. กรอกข้อมูลให้ครบถ้วน:</p>
            <ul class="text-left text-gray-600 space-y-2">
              <li>• ชื่อในระบบ</li>
              <li>• ชื่อบริษัท</li>
            </ul>
            <p class="text-gray-700 mt-2">จากนั้นกดปุ่ม "ลงทะเบียน"</p>
          </div>
        </div>
      </div>

      <!-- Step 5: Main Dashboard -->
      <div v-if="currentStep === 5" class="step-item">
        <div class="text-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">หน้าหลักของระบบ</h3>
        </div>
        <div class="flex flex-col items-center">
          <img src="../../assets/media/lineManual/Manual_Line (13).jpg" alt="หน้าหลัก"
            class="rounded-lg shadow-md mb-4 max-w-xs">
          <div class="instruction-text text-center">
            <p class="text-gray-700">5. หน้าหลักแสดงข้อมูลและฟังก์ชันต่างๆ:</p>
            <ul class="text-left text-gray-600 space-y-2 mt-2">
              <li>• ดูประวัติการขอคืนตู้</li>
              <li>• ดูประวัติการขอรับตู้</li>
              <li>• จัดการข้อมูลส่วนตัว(Coming soon)</li>
            </ul>
            <div class="bg-green-50 p-4 rounded-lg mt-4">
              <p class="text-green-800">การเข้าใช้งานครั้งต่อไป ระบบจะนำท่านมาที่หน้านี้โดยอัตโนมัติ</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 6: Container Return Form -->
      <div v-if="currentStep === 6" class="step-item">
        <div class="text-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">การขอคืนตู้</h3>
        </div>
        <div class="flex flex-col items-center">
          <img src="../../assets/media/lineManual/Manual_Line (14).jpg" alt="หน้าขอคืนตู้"
            class="rounded-lg shadow-md mb-4 max-w-xs">
          <div class="instruction-text text-center">
            <p class="text-gray-700 mb-4">6. กรอกข้อมูลการคืนตู้:</p>
            <ul class="text-left text-gray-600 space-y-2">
              <li>• เลือก Agent</li>
              <li>• กรอกเลข BL</li>
              <li>• อัพโหลดใบคืนตู้</li>
              <li>• กรอกข้อมูลตู้:</li>
              <ul class="ml-4 space-y-1">
                <li>- เบอร์ตู้</li>
                <li>- ขนาดตู้</li>
                <li>- อัพโหลดรูปตู้</li>
              </ul>
            </ul>
            <div class="bg-blue-50 p-4 rounded-lg mt-4 mb-2">
              <p class="text-blue-800">สามารถกดปุ่ม "เพิ่มตู้" เพื่อเพิ่มข้อมูลตู้เพิ่มเติมได้</p>
            </div>

            <div class="bg-yellow-50 p-4 rounded-lg">
                <h4 class="font-semibold text-yellow-800 mb-2">การติดตามสถานะ:</h4>
                <p class="text-yellow-700">ท่านสามารถติดตามสถานะและยกเลิกคำขอได้ที่หน้า Dashboard
                  ในกรณีที่ยังไม่มีการดำเนินการ</p>
              </div>
          </div>
        </div>
      </div>

      <!-- Step 7: Container Request Form -->
      <div v-if="currentStep === 7" class="step-item">
        <div class="text-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">การขอรับตู้</h3>
        </div>
        <div class="flex flex-col items-center">
          <img src="../../assets/media/lineManual/Manual_Line (18).jpg" alt="หน้าขอรับตู้"
            class="rounded-lg shadow-md mb-4 max-w-xs">
          <div class="instruction-text text-center">
            <p class="text-gray-700 mb-4">7. กรอกข้อมูลการขอรับตู้:</p>
            <div class="bg-white shadow-md rounded-lg p-6 space-y-4">
              <div>
                <h4 class="font-semibold text-gray-800 mb-2">ข้อมูลที่ต้องกรอก:</h4>
                <ul class="text-left text-gray-600 space-y-2">
                  <li>• เลือก Agent</li>
                  <li>• กรอก Booking No.</li>
                  <li>• ระบุวันที่ต้องการรับตู้</li>
                  <li>• อัพโหลดเอกสาร Booking</li>
                </ul>
              </div>

              <div>
                <h4 class="font-semibold text-gray-800 mb-2">ข้อมูลตู้:</h4>
                <ul class="text-left text-gray-600 space-y-2">
                  <li>• เลือกขนาดตู้</li>
                  <li>• ระบุจำนวนตู้ที่ต้องการ</li>
                </ul>
              </div>

              <div class="bg-yellow-50 p-4 rounded-lg">
                <h4 class="font-semibold text-yellow-800 mb-2">การติดตามสถานะ:</h4>
                <p class="text-yellow-700">ท่านสามารถติดตามสถานะและยกเลิกคำขอได้ที่หน้า Dashboard
                  ในกรณีที่ยังไม่มีการดำเนินการ</p>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between">
      <button @click="prevStep" :disabled="currentStep === 1" class="btn btn-outline"
        :class="{ 'opacity-50 cursor-not-allowed': currentStep === 1 }">
        ย้อนกลับ
      </button>
      <button @click="nextStep" :disabled="currentStep === totalSteps" class="btn btn-primary"
        :class="{ 'opacity-50 cursor-not-allowed': currentStep === totalSteps }">
        ถัดไป
      </button>
    </div>

    <!-- Tips Section -->
    <div class="mt-8 bg-blue-50 p-4 rounded-lg">
      <h4 class="text-lg font-semibold text-blue-800 mb-2">เคล็ดลับ</h4>
      <ul class="list-disc list-inside text-blue-700">
        <li>เตรียมเอกสารและรูปภาพที่จำเป็นให้พร้อมก่อนทำการขอคืนตู้</li>
        <li>ตรวจสอบความถูกต้องของข้อมูลก่อนกดส่ง</li>
        <li>สามารถติดต่อเจ้าหน้าที่ได้ผ่านช่องทางติดต่อ</li>
      </ul>
    </div>

    <!-- Contact Information -->
    <div class="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
      <h4 class="text-lg font-semibold text-blue-800 mb-4">ติดต่อสอบถามเพิ่มเติม</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span class="text-gray-700">065-914-4536</span>
        </div>
        <div class="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <a href="mailto:giraffecontainer@gmail.com" class="text-blue-600 hover:text-blue-800 underline">
            giraffecontainer@gmail.com
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manual-container {
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

.steps-content {
  flex-grow: 1;
}

.step-item img {
  max-height: 500px;
  object-fit: contain;
}

.instruction-text {
  max-width: 80%;
  margin: 0 auto;
}

.step-item {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>