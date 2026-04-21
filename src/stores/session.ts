import { defineStore } from "pinia";
import {ref} from "vue";
import { createSession, listSessions, getSessionMessages, deleteSession } from '../api';

interface Session {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

interface Message {
    id: string;
    role: String;
    content: string;
    created_at: string;
}

export const useSessionStore = defineStore('session', () => {
    // State
    const sessions = ref<Session[]>([]);
    const currentSessionId = ref<string | null>(null);
    const isLoading = ref<boolean>(false);

    // Actions
    async function fetchSessions() {
        try{
            isLoading.value = true;
            sessions.value = await listSessions();
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function startNewSession(): Promise<string | null> {
        try {
            const newSession = await createSession();
            sessions.value.unshift(newSession); // Add new session to the beginning of the list
            currentSessionId.value = newSession.id;
            return newSession.id;
            } catch (error) {
            console.error('Failed to create session:', error);
            return null;
        }
    }

    async function loadSession(sessionId: string): Promise<Message[]> {
        try {
            currentSessionId.value = sessionId;
            const messages = await getSessionMessages(sessionId);
            return messages;
        } catch (error) {
            console.error('Failed to load session messages:', error);
            return [];
        }
    }

    async function removeSession(sessionId: string) {
        try {
            await deleteSession(sessionId);
            sessions.value = sessions.value.filter(session => session.id !== sessionId);
            if (currentSessionId.value === sessionId) {
                currentSessionId.value = null;
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    }

    return{
        sessions,
        currentSessionId,
        isLoading,
        fetchSessions,
        startNewSession,
        loadSession,
        removeSession,
    };
});

