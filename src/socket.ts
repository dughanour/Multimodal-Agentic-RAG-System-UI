class SocketService
{
    private socket: WebSocket | null = null;
    private onMessageCallback:((data: any) => void) | null = null;
    
    //  Connect to the WebSocket server
    public connect(sessionId: string, onMessage: (data: any) => void): Promise<void> 
    {

    this.onMessageCallback = onMessage;
    if (this.socket) 
    {
        if (this.socket.readyState === WebSocket.OPEN) 
        {
            console.log('Already connected to the WebSocket server');
            return Promise.resolve();
        }

        if (this.socket.readyState === WebSocket.CONNECTING)
        {
            console.log('WebSocket connection is currently being established...');
            return Promise.resolve();
        }
    }

    const socketURL = `ws://127.0.0.1:8000/api/v1/ws/chat/${sessionId}`;
    this.socket = new WebSocket(socketURL);
    return new Promise((resolve) => 
        {
        this.socket!.onopen = () => 
        {
            console.log('WebSocket connection established');
            resolve();
        };
        this.socket!.onmessage = (event) => 
        {
            try 
            {
                console.log('⬇️ WebSocket RECV:', event.data);
                const messageData = JSON.parse(event.data);
                if (this.onMessageCallback) 
                {
                    this.onMessageCallback(messageData);
                }
            } catch (error) 
            {
                console.error('Error parsing message data:', error);
            }
        };
        this.socket!.onerror = (error) => 
        {
            console.error('WebSocket error:', error);
            resolve();
        };
        this.socket!.onclose = () => 
        {
            console.log('WebSocket connection closed.');
            this.socket = null;
        };
    });
}


// Send a message to the server
public sendMessage(message: object): boolean 
{
    if (this.socket && this.socket.readyState === WebSocket.OPEN)
    {
        this.socket.send(JSON.stringify(message));
        return true;
    } 
    else 
    {
        console.error('WebSocket connection not open. Cannot send message.');
        return false;
    }
}

// Reconnect to switch to a different chat session
public reconnect(sessionId: string, onMessage: (data: any) => void): Promise<void> 
{
    if (this.socket)
    {
        this.socket.onclose = null;
        this.socket.close();
        this.socket = null;
    }
    return this.connect(sessionId, onMessage);
}


// Disconnect from the WebSocket server
public disconnect()
{
    if (this.socket)
    {
        this.socket.close();
    }
}
}

// Export a singleton instance.. whole app uses the same connection
export const socketService = new SocketService();



