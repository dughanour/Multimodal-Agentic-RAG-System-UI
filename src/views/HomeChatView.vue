<script setup lang="ts">
import { ref, nextTick, computed, watch, onMounted, onUnmounted } from 'vue';
import { useChatStore } from '../stores/chat';


// 2. Get an instance of the store
const chatStore = useChatStore();

const messageInput = ref('');
const inputFocused = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const hasMessages = computed(() => chatStore.messages.length > 0);



// Component Lifecycle hooks for websocket
onMounted(() => {
    // Connection now happens when user creates a session
    // (via "New Chat" button or auto-created on first message)
});

onUnmounted(()=>{
    // Optional: If you want to keep the connection alive while navigating 
    // to Settings, REMOVE this line. 
    // If you want to close it, keep it.
    chatStore.disconnect();
});


const handleSend = async () => {
    const text = messageInput.value.trim();
    if(!text){
        return;
    }

    //Delegate logic to store
    chatStore.sendMessage(text);

    //UI Cleanup
    messageInput.value = '';
    inputFocused.value = true;
    await nextTick();
    resizeTextarea();
    scrollToBottom();
}

const resizeTextarea = () => {
    const textarea = textareaRef.value;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
};

watch(messageInput, () => {
    nextTick(resizeTextarea);
});


const chatContainerRef = ref<HTMLElement | null>(null); // Ref for the scrollable container


const scrollToBottom = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
};

const handleInputFocus = () => {
    inputFocused.value = true;
};

const handleInputBlur = () => {
    if (chatStore.messages.length === 0) {
        inputFocused.value = false;
    }
};

</script>


<template>
    <div class="flex flex-col relative" style="min-height: calc(100vh - 3.5rem);">
        <div ref="chatContainerRef" class="flex-grow overflow-y-auto p-4 chat-messages" :class="{ 'pb-20': hasMessages }">
            <div class="w-full max-w-4xl mx-auto">
                <div v-for="(msg, index) in chatStore.messages" :key="index" class="mb-2">
                    <div v-if="msg.type === 'user'" class="flex justify-end">
                        <div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-lg break-words">
                            {{ msg.text }}
                        </div>
                    </div>
                    <div v-else class="flex justify-start">
                        <div class="max-w-4xl p-3 break-words">
                            {{ msg.text }}
                        </div>
                    </div>
                </div>
                <!-- --- HIGHLIGHT: Add the conditional spinner here --- -->
                <div v-if="chatStore.isThinking || chatStore.statusMessage" class="flex justify-start">
                            <div class="max-w-4xl p-3 flex items-center space-x-2 text-gray-600">
                                <!-- A simple SVG spinner using Tailwind's animate-spin utility -->
                                <svg class="animate-spin h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Thinking... {{ chatStore.statusMessage }}</span>
                            </div>
                        </div>
            </div>
        </div>


        <div 
            :class="[
                'transition-all duration-300 ease-in-out flex items-center justify-center',
                hasMessages 
                    ? 'sticky bottom-0 p-4 w-full' 
                    : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 md:w-3/4 lg:w-1/2 '
            ]"
        >
            <div :class="[
                'relative transition-colors', 
                hasMessages 
                    ? 'w-11/12 md:w-3/4 lg:w-1/2  bg-gray-100/70 backdrop-blur-lg rounded-2xl border border-orange-500' 
                    : 'w-full flex-grow '
                ]"
            >
                <textarea
                    ref="textareaRef"
                    rows="1"
                    v-model="messageInput"
                    @keydown.enter.exact.prevent="handleSend"
                    @focus="handleInputFocus"
                    @blur="handleInputBlur"
                    placeholder="Ask anything..."
                    :class="[
                        'custom-scrollbar w-full p-3 pr-12  text-gray-900 focus:outline-none resize-none overflow-y-auto max-h-52',
                        hasMessages
                            ? 'bg-transparent rounded-2xl '
                            : 'bg-gray-100 rounded-2xl border border-orange-500'
                    ]"
                ></textarea>
                <button @click="handleSend" class="absolute right-3 bottom-3 text-white bg-orange-400 hover:bg-orange-400 hover:scale-110 duration-300 rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>