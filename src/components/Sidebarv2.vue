<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { uploadFile, scrapeUrl } from '../api';
import { useChatStore } from '../stores/chat';
import { useSessionStore } from '../stores/session';
import { onMounted } from 'vue';


const chatStore = useChatStore();
const sessionStore = useSessionStore();

onMounted(() => {
sessionStore.fetchSessions();
});



const props = defineProps({
    visible: Boolean
});

const emit = defineEmits(['update:visible']);

const fileInput: Ref<HTMLInputElement | null> = ref(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadMessage = ref<string | null>(null);

// Scraping state
const scrapeTargetUrl = ref('');
const isScraping = ref(false);
const scrapeMessage = ref<string | null>(null);
const scrapeSuccess = ref(false);

const openFileInput = () => {
    fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0){
        return; // no files selected
    }
    // The backend currently handles one file at a time.
    // We'll just take the first selected file.
    const fileToUpload = files[0];

    uploading.value = true;
    uploadProgress.value = 0;
    uploadMessage.value = `Uploading ${fileToUpload?.name}...`;

    try {
        const response = await uploadFile(fileToUpload as File, (percent) => {
        uploadProgress.value = percent; 
        });

        // Handle success
        uploadMessage.value = `File uploaded successfully: ${response.filename}`;
        console.log('Upload successful:', response);

    }catch (error) {
        // Handle error
        console.error('Upload failed:', error);
        uploadMessage.value = `Upload failed. Please try again.`;
    }finally{
        // Reset the state after a few seconds to hide the message
        setTimeout(()=>{
            uploading.value = false;
            uploadProgress.value = 0;
            uploadMessage.value = null;
        }, 3000);
        // Reset the file input to allow new uploads
        if(fileInput.value) {
            fileInput.value.value = '';
        }
    }


};

const handleScrape = async () => {
    if (!scrapeTargetUrl.value) return;

    isScraping.value = true;
    scrapeMessage.value = null;
    scrapeSuccess.value = false;

    try {
        await scrapeUrl(scrapeTargetUrl.value);
        scrapeSuccess.value = true;
        scrapeMessage.value = 'URL content scraped successfully!';
        scrapeTargetUrl.value = ''; // clear input
    } catch (error) {
        console.error('Scraping failed:', error);
        scrapeSuccess.value = false;
        scrapeMessage.value = 'Scraping failed. Please check the URL.';
    } finally {
        isScraping.value = false;
        // Clear message after delay
        setTimeout(() => {
            scrapeMessage.value = null;
        }, 4000);
    }
};


const newChat = async () => {
    const sessionId = await sessionStore.startNewSession();
    if(sessionId){
        chatStore.clearChat();
        chatStore.connect(sessionId);
    }
};

const openChat = (sessionId: string) =>{
    chatStore.switchSession(sessionId);
};

</script>

<template>
    <div class="relative">
        <!-- Sidebar Overlay -->
        <div v-if="props.visible" @click="emit('update:visible', false)" class="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-40"></div>

        <!-- Sidebar Content -->
        <div :class="{'translate-x-0': props.visible, '-translate-x-full': !props.visible}"
            class="fixed top-0 left-0 h-full bg-gray-50/70 backdrop-blur-lg text-gray-800 p-6 shadow-lg transition-transform duration-300 ease-in-out z-50 w-80 flex flex-col border-r border-gray-200">
            
            <div>
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">N.AI</h2>
                    <button @click="emit('update:visible', false)" class="text-gray-600 p-2 rounded-full hover:bg-gray-200 duration-300 ">
                        <i class="pi pi-times"></i> <!-- You might need to add PrimeIcons CSS if you want this icon -->
                    </button>
                </div>

            
                <div class="p-4 mt-4 bg-gray-200/50 rounded-lg shadow-md flex items-center justify-center">
                    <input type="file" ref="fileInput" style="display: none;"  @change="handleFileUpload" />
                    <button @click="openFileInput" :disabled="uploading" class="w-full bg-orange-400 hover:bg-orange-500 hover:scale-95 duration-300 text-white font-bold py-2 px-4 rounded">
                        <i class="pi pi-upload mr-2"></i>
                        {{ uploading? `Uploading... ${uploadProgress}%` : 'Upload File' }}
                    </button>
                </div>
                
                <!-- Scrape URL Section -->
                <div class="p-4 mt-4 bg-gray-200/50 rounded-lg shadow-md">
                    <div class="flex items-center gap-2">
                        <input 
                            v-model="scrapeTargetUrl"
                            type="text" 
                            placeholder="https://example.com" 
                            class="flex-grow p-2 rounded border border-gray-300 text-sm focus:outline-none focus:border-orange-400 min-w-0"
                        />
                        <button 
                            @click="handleScrape" 
                            :disabled="isScraping || !scrapeTargetUrl"
                            class="bg-orange-400 hover:bg-orange-500 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        >
                            <i :class="isScraping ? 'pi pi-spin pi-spinner' : 'pi pi-globe'"></i>
                        </button>
                    </div>
                    <p v-if="scrapeMessage" :class="scrapeSuccess ? 'text-green-600' : 'text-red-600'" class="text-xs mt-2">
                        {{ scrapeMessage }}
                    </p>
                </div>
                <div class="mt-4">
                    <button @click="newChat" class="w-fit bg-orange-400 hover:bg-orange-500 hover:scale-95 duration-300 text-white font-bold py-2 px-4 rounded-full">
                        <i class="pi pi-plus mr-2"></i> New Chat
                    </button>
                </div>
            </div>
            
            <div class="mt-6 flex-grow overflow-y-auto custom-scrollbar overscroll-y-contain">
                <h3 class="text-lg font-bold mb-3">Chats</h3>
                <p v-if="sessionStore.isLoading" class="text-sm text-gray-400 text-center">Loading chats...</p>
                <div class="space-y-2">
                    <button v-for="session in sessionStore.sessions" :key="session.id"
                            @click="openChat(session.id)"
                            :class="[
                                'w-full text-left py-2 px-4 rounded duration-300 truncate',
                                sessionStore.currentSessionId === session.id
                                    ? 'bg-orange-100 text-orange-700 font-semibold'
                                    : 'text-gray-800 hover:bg-gray-200/60 hover:scale-95'
                            ]">
                        {{ session.title }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
