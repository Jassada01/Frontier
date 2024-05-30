<script setup>
import { ref, onMounted } from 'vue';
import { checkLoginStatus, displayName, position, image, language } from '../utils/auth';
import '@fortawesome/fontawesome-free/css/all.css';
import CONFIG from '../config/config';

const systemName = CONFIG.SYSTEM_NAME;  // เข้าถึง environment variable
const userImage = ref('');
const userName = ref('');
const userPosition = ref('');

onMounted(async () => {
  await checkLoginStatus();
  userImage.value = image.value;
  userName.value = displayName.value;
  userPosition.value = position.value;
});
</script>

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
              <summary><i class="fa fa-folder"></i> ตั้งค่า Master</summary>
              <ul class="p-2">
                <li><router-link to="/ClientIndex"><i class="fa fa-users"></i> รายชื่อลูกค้า</router-link></li>
                <li><router-link to="/AgentIndex"><i class="fa fa-ferry"></i> รายชื่อเอเย่นต์</router-link></li>
                <li><router-link to="/YardIndex"><i class="fa fa-warehouse"></i> รายชื่อลาน</router-link></li>
                <!-- เพิ่มลาน -->
                <li><router-link to="/ZoneIndex"><i class="fa fa-map-marked-alt"></i> รายการโซน</router-link></li>
                <li>
                  <a><i class="fa fa-truck"></i> ข้อมูลรถบรรทุก</a>
                  <ul>
                    <li><router-link to="/TruckCompanyIndex"><i class="fa fa-building"></i> บริษัทรถ</router-link></li>
                    <li><router-link to="/DriverIndex"><i class="fa fa-id-card"></i> คนขับ</router-link></li>
                  </ul>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary><i class="fa fa-cogs"></i> จัดการระบบ</summary>
              <ul class="p-2">
                <li><router-link to="/UserIndex"><i class="fa fa-user-cog"></i> ผู้ใช้งาน</router-link></li>
                <li><a><i class="fa fa-database"></i> ข้อมูลพื้นฐานระบบ</a></li>
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
          <span class="cursor-pointer"><i class="fa fa-folder"></i> ตั้งค่า Master</span>
        </div>
        <ul tabindex="0" class="mt-1 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          <li><router-link to="/ClientIndex"><i class="fa fa-users"></i> รายชื่อลูกค้า</router-link></li>
          <li><router-link to="/AgentIndex"><i class="fa fa-ferry"></i> รายชื่อเอเย่นต์</router-link></li>
          <li><router-link to="/YardIndex"><i class="fa fa-warehouse"></i> รายชื่อลาน</router-link></li>
          <!-- เพิ่มลาน -->
          <li><router-link to="/ZoneIndex"><i class="fa fa-map-marked-alt"></i> รายการโซน</router-link></li>
          <li>
            <a><i class="fa fa-truck"></i> ข้อมูลรถบรรทุก</a>
            <ul>
              <li><router-link to="/TruckCompanyIndex"><i class="fa fa-building"></i> บริษัทรถ</router-link></li>
              <li><router-link to="/DriverIndex"><i class="fa fa-id-card"></i> คนขับ</router-link></li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost">
          <span class="cursor-pointer"><i class="fa fa-cogs"></i> จัดการระบบ</span>
        </div>
        <ul tabindex="0" class="mt-1 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          <li><router-link to="/UserIndex"><i class="fa fa-user-cog"></i> ผู้ใช้งาน</router-link></li>
          <li><a><i class="fa fa-database"></i> ข้อมูลพื้นฐานระบบ</a></li>
        </ul>
      </div>
    </div>
    <div class="navbar-end flex-none gap-2">
      <div class="form-control">
        <input type="text" placeholder="Search" class="input input-bordered w-24 md:w-auto" />
      </div>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img :src="userImage" alt="User Avatar" />
          </div>
        </div>
        <ul tabindex="0" class="mt-1 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
          <li class="p-2 text-center">
            <div class="font-bold">{{ userName }}</div>
            <div class="text-sm text-gray-400">{{ userPosition }}</div>
          </li>
          <div class="divider"></div>
          <li>
            <a><i class="fa fa-user"></i> Profile</a>
          </li>
          <li><a><i class="fa fa-cog"></i> Settings</a></li>
          <li><a><i class="fa fa-sign-out-alt"></i> Logout</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group-hover\:block {
  display: block;
}
</style>
