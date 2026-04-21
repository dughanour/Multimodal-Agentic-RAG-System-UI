import { defineStore } from 'pinia'
import { ref } from 'vue'

// defineStore is a function from Pinia to create a new store.
// The first argument 'settings' is a unique ID for this store.
export const useSettingsStore = defineStore('settings', () => {
    // State 
    const useStrictMode = ref(false);
    const supervisorInstruction = ref('');
    const temperature = ref(0.0);

    // Actions
    function toggleStrictMode() {
        useStrictMode.value = !useStrictMode.value;
    }
    function clearInstruction() {
        supervisorInstruction.value = '';
    }

    // Return
    return {
        useStrictMode,
        supervisorInstruction,
        temperature,
        clearInstruction,
        toggleStrictMode,
    };
    
});