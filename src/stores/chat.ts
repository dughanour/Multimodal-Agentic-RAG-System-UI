import { defineStore } from 'pinia';
import { ref } from 'vue';
import { socketService }  from '../socket';
import { useSettingsStore } from './settings';
import { useSessionStore } from './session';

export const useChatStore = defineStore('chat', () =>{
    //**********************State***********************
    const messages = ref<Array<{type: string; text: string}>>([]);
    const isThinking = ref(false);
    const statusMessage = ref('');

    // Used to track connetion status in the UI
    const isConnected = ref(false);

    //**********************Actions**********************

    //1. Handle incoming WebSocket messages
    const handleIncomingMessage = (data: {type: string; data?: string}) => {
        console.log('Store received:', data);

    if (data.type === 'ping'){
        return; // Do nothing! This is just a heartbeat to keep the connection alive.
    }
    if (data.type === 'routing'){
        statusMessage.value = data.data ?? '';
        isThinking.value = true;
    }
    else if(data.type === 'stream'){
        isThinking.value = false;
        statusMessage.value = '';

        // Get the last message
        let lastMsgIndex = messages.value.length - 1;
        let lastMessage = messages.value[lastMsgIndex];

        // If the last message is not from the agent, create a new one.
        if(!lastMessage || lastMessage.type !== 'agent'){
            messages.value.push({type: 'agent', text: ''});
            lastMsgIndex = messages.value.length - 1;
            lastMessage = messages.value[lastMsgIndex];
        }

        // Append the text
        if(lastMessage && data.data){
            // Force reactivity: Create a new object instead of mutating the property
            // This ensures Vue detects the change immediately even in edge cases
            messages.value[lastMsgIndex] = {
                ...lastMessage,
                text: lastMessage.text + data.data
            };
        }
    }
    else if (data.type === 'title_update'){
        const sessionStore = useSessionStore();
        const session = sessionStore.sessions.find(s => s.id === sessionStore.currentSessionId);
        if(session && data.data)
        {
            session.title = data.data;
        }
    }


    else if(data.type === 'stream_end'){
        isThinking.value = false;
        statusMessage.value = '';
        console.log('Stream ended');
    }
    else if(data.type === 'error'){
        messages.value.push({type: 'error', text: data.data ?? 'Unknown error occurred'});
        isThinking.value = false;
    } 

};

//2. Connnct to the WebSocket server
async function connect(sessionId: string){
    await socketService.connect(sessionId, (data)=>{
        handleIncomingMessage(data);
    });
    isConnected.value = true;
};

//3. Switch to a different session
async function switchSession(sessionId: string){
    const sessionStore = useSessionStore();

    messages.value = []; // Clear current messages

    await socketService.reconnect(sessionId, (data)=>{
        handleIncomingMessage(data);
    });

    isConnected.value = true;

    const oldMessages = await sessionStore.loadSession(sessionId);
    for(const msg of oldMessages){
        if(msg.role === 'user'){
            messages.value.push({type: 'user', text: msg.content});
        }
        else if(msg.role === 'assistant'){
            messages.value.push({type: 'agent', text: msg.content});
        }
    }
}

//3. disconnect
function disconnect(){
    socketService.disconnect();
    isConnected.value = false;
}

//4. send message to the server
async function sendMessage(text: string){
    if(!text.trim()){
        return;
    }

    const sessionStore = useSessionStore();
    if(!sessionStore.currentSessionId){
        const sessionId = await sessionStore.startNewSession();
        if(!sessionId){
            messages.value.push({type: 'error', text: 'Failed to create session.'});
            return;
        }
    await connect(sessionId);
    }

    // Add the user's message to state
    messages.value.push({type: 'user', text: text});

    // Get settings
    const settingsStore = useSettingsStore();

    // send the message to the server
    const sent = socketService.sendMessage({
        content: text,
        use_strict_context: settingsStore.useStrictMode,
        temperature: settingsStore.temperature,
    });

    if(!sent){
        messages.value.push({type: 'error', text: 'Failed to send message. Please check your connection.'});
        return;
    }

    // Set loading state
    isThinking.value = true;
    statusMessage.value = '';
}

function clearChat(){
    messages.value = [];
}

return {
    messages,
    isThinking,
    statusMessage,
    isConnected,
    connect,
    disconnect,
    switchSession,
    sendMessage,
    clearChat,
};
});