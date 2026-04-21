<script setup lang="ts">
import { useSettingsStore } from '../stores/settings';
import { setSupervisorInstructions, clearSupervisorInstructions } from '../api';
import { ref } from 'vue';

const props = defineProps({
    visible: Boolean
});

const emit = defineEmits(['update:visible']);
// Get instance of the settings store
const settingsStore = useSettingsStore();

const isSaving = ref(false);
const saveSuccess = ref(false);
const statusText = ref('');

async function saveInstructions() {
    isSaving.value = true;
    saveSuccess.value = false;
    try {
        await setSupervisorInstructions(settingsStore.supervisorInstruction);
        statusText.value = 'Instructions saved successfully!';
        saveSuccess.value = true;
    } catch (error) {
        console.error("Failed to save supervisor instructions:", error);
    } finally {
        isSaving.value = false;
        setTimeout(() => {
            saveSuccess.value = false;
            statusText.value = '';
        }, 3000); // Hide success message after 3 seconds
    }
}

async function resetInstructions() {
    isSaving.value = true;
    saveSuccess.value = false;
    try {
        settingsStore.clearInstruction();
        await clearSupervisorInstructions();
        statusText.value = 'Instructions reset successfully!';
        saveSuccess.value = true;
    } catch (error) {
        console.error("Failed to reset supervisor instructions:", error);
    } finally {
        isSaving.value = false;
        setTimeout(() => {
            saveSuccess.value = false;
            statusText.value = '';
        }, 3000);
    }
}
</script>



<template>
    <div class="relative">
        <!-- Sidebar Overlay -->
        <div v-if="props.visible" @click="emit('update:visible', false)" class="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-40"></div>

        <!-- Sidebar Content -->
        <div :class="{'translate-x-0': props.visible, 'translate-x-full': !props.visible}"
            class="fixed top-0 right-0 h-full bg-gray-50/70 backdrop-blur-lg text-gray-800 p-6 shadow-lg transition-transform duration-300 ease-in-out z-50 w-80 flex flex-col border-r border-gray-200">
            
            <div>
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Settings</h2>
                    <button @click="emit('update:visible', false)" class="text-gray-600 p-2 rounded-full hover:bg-gray-200 duration-300 ">
                        <i class="pi pi-times"></i>
                    </button>
                </div>
                <!-- Strict Mode -->
                <div class="flex items-center justify-between">
                    <span class="text-md font-semibold text-gray-700">Strict Mode</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settingsStore.useStrictMode" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800= rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-400"></div>
                    </label>
                </div>
                <!-- Retrieval Agent Temperature -->
                <div class="mb-6 mt-6">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-md font-semibold text-gray-700">Temperature</h3>
                        <span class="text-sm font-mono text-orange-400 px-2 py-1 rounded">{{ settingsStore.temperature.toFixed(1) }}</span>
                    </div>
                    <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    v-model.number="settingsStore.temperature"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    >
                </div>
                
                <!-- Save Instructions Button -->
                <div class="mt-6">
                    <h3 class="text-md font-semibold text-gray-700 mb-2">Supervisor Instructions</h3>
                    <textarea
                        v-model="settingsStore.supervisorInstruction"
                        rows="4"
                        placeholder="e.g. Prioritize information..."
                        class="w-full p-2 border-2 border-gray-700 rounded-lg resize-none"
                    ></textarea>
                    <div class="flex justify-end gap-2">
                        <button
                            @click="resetInstructions"
                            :disabled="isSaving"
                            class="mt-2 px-4 py-2 border border-orange-400 text-orange-500 rounded-lg hover:bg-orange-50 disabled:opacity-50 hover:scale-95 duration-300"
                        >
                            Reset
                        </button>
                        <button
                            @click="saveInstructions"
                            :disabled="isSaving"
                            class="mt-2 px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 disabled:bg-orange-300  hover:scale-95 duration-300"
                        >
                            <span v-if="isSaving">Saving...</span>
                            <span v-else>Save</span>
                        </button>
                    </div>
                    <div v-if="saveSuccess" class="text-orange-400 mt-2 text-md font-semibold text-right">
                        {{ statusText }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


