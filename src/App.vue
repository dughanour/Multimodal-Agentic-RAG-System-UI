<script setup lang="ts">
import Navbar from './components/Navbar.vue';
import Sidebarv2 from './components/Sidebarv2.vue';
import SettingsSidebar from './components/SettingsSidebar.vue';
import { RouterView, useRoute } from 'vue-router'
import { computed, ref } from 'vue';

const route = useRoute();
const showNavbar = computed(() => route.name !== 'onboarding');
const isSidebarVisible = ref(false);
const isSettingsSidebarVisible = ref(false);


const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};

const toggleSettingsSidebar = () => {
  isSettingsSidebarVisible.value = !isSettingsSidebarVisible.value;
}

</script>

<template>
    <div class="bg-white text-gray-800 min-h-screen">
    <Navbar v-if="showNavbar" @toggle-sidebar="toggleSidebar" @toggle-settings-sidebar="toggleSettingsSidebar" :is-sidebar-visible="isSidebarVisible"/>
    <div class="flex">
        <Sidebarv2 :visible="isSidebarVisible" @update:visible="isSidebarVisible = $event"/>
        <main class="flex-grow bg-white">
          <RouterView/>
        </main>
        <SettingsSidebar :visible="isSettingsSidebarVisible" @update:visible="isSettingsSidebarVisible = $event" />
    </div>
      </div>
    

</template>


