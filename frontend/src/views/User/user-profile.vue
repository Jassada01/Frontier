<script setup>
import Navbar from '../../components/Navbar.vue'
import UserProfile from '../../components/user/UserProfile.vue'
import Breadcrumbs from '../../components/Breadcrumbs.vue';

const breadcrumbsData = [
  { name: "Home", icon: "fa-home", link: "/" },
  { name: "User", icon: "fa-user-edit", link: "" },
];


</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <Breadcrumbs :breadcrumbs="breadcrumbsData" />
    <div class="flex-grow flex justify-center p-4">
      <div class="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
        <UserProfile />
      </div>
    </div>
  </div>
</template>
