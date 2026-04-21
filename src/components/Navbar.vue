<script setup lang="ts">
import { RouterLink, useRoute} from 'vue-router'
import { computed, ref } from 'vue'
import efesoLogo from '../assets/EFESO_logo.png';

const route = useRoute()
const isAuthenticated = ref(false)

const props = defineProps({
  isSidebarVisible: Boolean
});

const emit = defineEmits(['toggle-sidebar', 'toggle-settings-sidebar']);

const isActiveLink = (routePath: string) => {
  return route.path === routePath
}



const isHomePage = computed(() => route.name === 'home');

const logout = () => {
  // Implement logout logic
  isAuthenticated.value = false;
}
</script>

<template>
  <nav class="bg-white border-b border-gray-600 shadow-lg">
    <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
          <!-- Sidebar Toggle Button -->
          <button @click="emit('toggle-sidebar')" class="p-2 text-xl text-gray-800 hover:scale-130 hover:text-orange-400 duration-300 mr-6">
              <i class="pi pi-bars"></i>
          </button>
          <!-- Logo -->
          <RouterLink class="flex flex-shrink-0 items-center mr-4" to="/">
            <img class="h-8 w-auto" :src="efesoLogo" alt="EFESO" />
          </RouterLink>
          <div class="md:ml-auto">
            <div class="flex space-x-2">
              <template v-if="!isAuthenticated">
                <RouterLink
                  to="/signup"
                  :class="[
                    'hover:text-gray-800',
                    isActiveLink('/signup') ? 'text-gray-900' : 'text-gray-600',
                    'font-bold',
                    'px-3',
                    'py-3',
                    'rounded-2xl',
                    'hover:scale-110',
                    'duration-300',
                  ]"
                  >SignUp</RouterLink
                >
                <RouterLink
                  to="/login"
                  :class="[
                    'hover:text-gray-800',
                    isActiveLink('/login') ? 'text-gray-900' : 'text-gray-600',
                    'font-bold',
                    'px-3',
                    'py-3',
                    'rounded-2xl',
                    'hover:scale-110',
                    'duration-300',
                  ]"
                  >LogIn</RouterLink
                >
              </template>
              <template v-else>
                <RouterLink
                  to="/login"
                  @click.prevent="logout"
                  :class="[
                    'hover:text-gray-800',
                    'text-gray-600',
                    'font-bold',
                    'px-3',
                    'py-3',
                    'rounded-2xl',
                    'hover:scale-110',
                    'duration-300',
                  ]"
                >
                  Logout
                </RouterLink>
              </template>
              <!-- Settings Button -->
                <button @click="emit('toggle-settings-sidebar')" class="p-2 text-xl text-gray-800 hover:scale-130 hover:text-orange-400 duration-300">
                    <i class="pi pi-cog"></i>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
