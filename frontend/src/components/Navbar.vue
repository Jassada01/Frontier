<template>
  <div class="navbar bg-base-100 shadow-lg">
    <div class="navbar-start lg:hidden">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </div>
        <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52">
          <li>
            <details>
              <summary><i class="fa fa-tasks"></i> ใบงาน</summary>
              <ul class="p-2">
                <li>
                  <router-link to="/EIRIndex"><i class="fa fa-file-alt"></i> EIR</router-link>
                </li>

                <li>
                  <router-link to="/InvoiceIndex"><i class="fa-solid fa-file-invoice"></i> Invoice</router-link>
                </li>
                <li>
                  <h2 class="menu-title">รายการที่ร้องขอเข้ามา</h2>
                  <ul>
                    <li>
                      <router-link to="/RequestReturnIndex">
                        <i class="fa-solid fa-download"></i> ขอคืนตู้
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/RequestReceiveIndex">
                        <i class="fa-solid fa-upload"></i> ขอรับตู้
                      </router-link>
                    </li>
                  </ul>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary><i class="fa fa-folder"></i> ตั้งค่า Master</summary>
              <ul class="p-2">
                <li>
                  <router-link to="/ClientIndex"><i class="fa fa-users"></i> รายชื่อลูกค้า</router-link>
                </li>
                <li>
                  <router-link to="/AgentIndex"><i class="fa fa-ferry"></i> รายชื่อเอเย่นต์</router-link>
                </li>
                <li>
                  <router-link to="/YardIndex"><i class="fa fa-warehouse"></i> รายชื่อลาน</router-link>
                </li>
                <li>
                  <router-link to="/PriceIndex"><i class="fa fa-tags"></i> รายการค่าบริการ</router-link>
                  <ul>
                    <li>
                      <router-link to="/ClientFreeDropPeriodIndex"><i class="fa fa-clock"></i>
                        ดรอปโปรโมชั่น</router-link>
                    </li>
                  </ul>
                </li>
                <!-- เพิ่มลาน -->
                <li>
                  <router-link to="/ZoneIndex"><i class="fa fa-map-marked-alt"></i> รายการโซน</router-link>
                </li>
                <li>
                  <a><i class="fa fa-truck"></i> ข้อมูลรถบรรทุก</a>
                  <ul>
                    <li>
                      <router-link to="/TruckCompanyIndex"><i class="fa fa-building"></i> บริษัทหัวลาก</router-link>
                    </li>
                    <li>
                      <router-link to="/DriverIndex"><i class="fa fa-id-card"></i> คนขับ</router-link>
                    </li>
                  </ul>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary><i class="fa fa-cogs"></i> จัดการระบบ</summary>
              <ul class="p-2">
                <li>
                  <router-link to="/UserIndex"><i class="fa fa-user-cog"></i> ผู้ใช้งาน</router-link>
                </li>
                <li>
                  <router-link to="/line-group"><i class="fa fa-users"></i> ผู้ใช้งานภายนอก</router-link>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
      <router-link to="/"><a class="btn btn-ghost normal-case text-xl">{{ systemName }}</a></router-link>
    </div>
    <div class="navbar-start hidden lg:flex">
      <router-link to="/"><a class="btn btn-ghost normal-case text-xl">{{ systemName }}</a></router-link>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost">
          <span class="cursor-pointer"><i class="fa fa-tasks"></i> ใบงาน</span>
        </div>
        <ul tabindex="0" class="mt-1 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          <li>
            <router-link to="/EIRIndex"><i class="fa fa-file-alt"></i> EIR</router-link>
          </li>
          <li>
            <router-link to="/InvoiceIndex"><i class="fa-solid fa-file-invoice"></i> Invoice</router-link>
          </li>
          <li>
            <h2 class="menu-title">รายการที่ร้องขอเข้ามา</h2>
            <ul>
              <li>
                <router-link to="/RequestReturnIndex">
                  <i class="fa-solid fa-download"></i> ขอคืนตู้
                </router-link>
              </li>
              <li>
                <router-link to="/RequestReceiveIndex">
                  <i class="fa-solid fa-upload"></i> ขอรับตู้
                </router-link>
              </li>
            </ul>
          </li>



        </ul>
      </div>

      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost">
          <span class="cursor-pointer"><i class="fa fa-folder"></i> ตั้งค่า Master</span>
        </div>
        <ul tabindex="0" class="mt-1 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          <li>
            <router-link to="/ClientIndex"><i class="fa fa-users"></i> รายชื่อลูกค้า</router-link>
          </li>
          <li>
            <router-link to="/AgentIndex"><i class="fa fa-ferry"></i> รายชื่อเอเย่นต์</router-link>
          </li>
          <li>
            <router-link to="/YardIndex"><i class="fa fa-warehouse"></i> รายชื่อลาน</router-link>
          </li>
          <li>
            <router-link to="/PriceIndex"><i class="fa fa-tags"></i> รายการค่าบริการ</router-link>
            <ul>
              <li>
                <router-link to="/ClientFreeDropPeriodIndex"><i class="fa fa-clock"></i> ดรอปโปรโมชั่น</router-link>
              </li>
            </ul>
          </li>
          <!-- เพิ่มลาน -->
          <li>
            <router-link to="/ZoneIndex"><i class="fa fa-map-marked-alt"></i> รายการโซน</router-link>
          </li>
          <li>
            <a><i class="fa fa-truck"></i> ข้อมูลรถบรรทุก</a>
            <ul>
              <li>
                <router-link to="/TruckCompanyIndex"><i class="fa fa-building"></i> บริษัทหัวลาก</router-link>
              </li>
              <li>
                <router-link to="/DriverIndex"><i class="fa fa-id-card"></i> คนขับ</router-link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost">
          <span class="cursor-pointer"><i class="fa fa-cogs"></i> จัดการระบบ</span>
        </div>
        <ul tabindex="0" class="mt-1 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          <li>
            <router-link to="/UserIndex"><i class="fa fa-user-cog"></i> ผู้ใช้งาน</router-link>
          </li>
          <li>
            <router-link to="/line-group"><i class="fa fa-users"></i> ผู้ใช้งานภายนอก</router-link>
          </li>
        </ul>
      </div>
    </div>
    <div class="navbar-end flex-none gap-2">
      <div class="form-control">
        <input type="text" placeholder="Search" class="input input-bordered w-24 md:w-auto" />
      </div>
      <NotificationDropdown  />

      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img :src="userImage" alt="User Avatar" />
          </div>
        </div>
        <ul tabindex="0" class="mt-1 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          <router-link to="/UserProfile">
            <li class="text-center">
              <div class="font-bold">{{ userName }} <span class="text-sm text-gray-400">{{ userPosition }}</span></div>

            </li>
          </router-link>
          <li>
            <a @click="handleLogout"><i class="fa fa-sign-out-alt"></i> Logout</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { checkLoginStatus, displayName, position, image, language, logout } from '../utils/auth'
import NotificationDropdown from './Notification.vue'
import '@fortawesome/fontawesome-free/css/all.css'
import CONFIG from '../config/config'

const systemName = CONFIG.SYSTEM_NAME // เข้าถึง environment variable
const userImage = ref('');
const userName = ref('');
const userPosition = ref('');

const router = useRouter();

onMounted(async () => {
  await checkLoginStatus(router)
  userImage.value = image.value;
  userName.value = displayName.value;
  userPosition.value = position.value;
})

const handleLogout = () => {
  logout(router);
}
</script>
<style scoped>
.group-hover\:block {
  display: block;
}
</style>
