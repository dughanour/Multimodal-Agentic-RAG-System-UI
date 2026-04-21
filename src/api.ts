// central API wrapper
import axios from 'axios';

// for using local API:
//VITE_API_BASE_URL = http://127.0.0.1:8000/api/v1
// for using remote API:
//VITE_API_BASE_URL = http://10.192.234.208:8000/api/v1
/////


const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
console.log('API Base URL:', BASE_URL);

export const api = axios.create({
    baseURL: BASE_URL,
    //  set auth headers here (e.g. Bearer token) if needed:
    // headers: { Authorization: `Bearer ${token}` }
});

// Upload a single file. onProgress receives (progressEvent) => percentNumber
export async function uploadFile(file: File, onProgress?: (percent: number) => void){
    const formData = new FormData();
    formData.append('file', file,file.name);

    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (ProgressEvent) => {
            if(!onProgress) return;
            const {loaded, total} = ProgressEvent;
            if (total) {
                const percent = Math.round((loaded / total) * 100);
                onProgress(percent);
            }
        },
        timeout: 120000, // optional: uploading big files may need longer
    });
    return response.data;
}

export async function setSupervisorInstructions(instructions: string) {
    const payload = { instructions };
    // The endpoint will return a 204 No Content on success, so we don't need to return anything.
    await api.post('/supervisor/instructions', payload);
}

// Clear supervisor instructions on the server (convenience helper)
export async function clearSupervisorInstructions() {
    await setSupervisorInstructions('');
}

export async function scrapeUrl(url: string) 
{
    const payload = { url };
    const response = await api.post('/scrape', payload);
    return response.data;
}

// Session API

export async function createSession(title?: string) 
{
    const payload = title ? { title } : {};
    const response = await api.post('/sessions', payload);
    return response.data;
}

export async function listSessions()
{
    const response = await api.get('/sessions');
    return response.data;
}

export async function getSessionMessages(sessionId: string) 
{
    const response = await api.get(`/sessions/${sessionId}/messages`);
    return response.data;
}

export async function deleteSession(sessionId: string) 
{
    const response =await api.delete(`/sessions/${sessionId}`);
    return response.data;
}

