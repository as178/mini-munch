// interfaces for structured communication 
export interface WebSocketMessage<T = any> {
  type: string; // type of action
  topic: string; // table number 
  payload?: T; // messages
}

type MessageCallback = (payload: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; 
  private messageQueue: string[] = [];
  private listeners: Map<string, Set<MessageCallback>> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  // connect to the WSS 
  public connect(): void {
    // return if socket has connected or is connecting, prevent duplicate sockets
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // create web socket
    this.socket = new WebSocket(this.url);

    // log connection and clear previous values
    this.socket.onopen = () => {
      console.log('Connected to Web Socket');
      this.reconnectAttempts = 0;
      this.flushQueue();
    };

    // on message event handler
    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        // trigger when message arrives
          this.triggerListeners(data.topic, data.payload);
      } catch (error) {
        // message for parsing fail error 
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    // on close event handler, and log provided event
    this.socket.onclose = (event: CloseEvent) => {
      console.warn(`WebSocket closed: ${event.reason || 'No reason provided'}. Code: ${event.code}`);
      // try to reconnect
      this.handleReconnect();
    };

    // error handler
    this.socket.onerror = (error: Event) => {
      console.error('WebSocket Error encountered:', error);
    };
  }

  /**
   *  function to subscribe to a specific topic/tabe
   * @param topic table number to subscribe to
   * @param callback function to execute when messages arriving for table
   */
  public subscribe(topic: string, callback: MessageCallback): () => void {
    // Register the callback locally
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    
    // add callback if it dose not exist in listeners
    this.listeners.get(topic)!.add(callback);

    // create subscribe message
    const subscribeMessage: WebSocketMessage = {
      type: 'subscribe',
      topic: topic,
    };

    // send subscription request to WSS
    this.send(subscribeMessage);

    // send unsubscribe message when react cleans up hook
    return () => {
      const topicListeners = this.listeners.get(topic);

      if (topicListeners) {
        //remove callback
        topicListeners.delete(callback);

        // if no longer lisening 
        if (topicListeners.size === 0) {
          // delete topic from listeners
          this.listeners.delete(topic);
          
          // unsubscribe from topic once done
          this.send({ type: 'unsubscribe', topic });
        }
      }
    };
  }

  // send messages safely or queues them if waiting for connection
  public send(message: WebSocketMessage): void {
    const stringifiedMessage = JSON.stringify(message);

    // check if socket is ready and open
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // send message
      this.socket.send(stringifiedMessage);
    } else {
      // add message to queue and log 
      console.warn('WebSocket not open. Queueing message:', message);
      this.messageQueue.push(stringifiedMessage);
    }
  }

  // function to close the websocket and clean up
  public disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Disconnected and closed Websocket');
      this.socket = null;
    }
  }

  // send queued messages
  private flushQueue(): void {
    // loop and send all messages in queue
    while (this.messageQueue.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.socket.send(message);
      }
    }
  }

  // reconnect to socket after connection lost
  private handleReconnect(): void {
    // try and reconnect while max attempts not reched
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      // increment attempts coutnter 
      this.reconnectAttempts++;

      // log reconnect attempt
      console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectInterval}ms...`);

      // timout reconnect attempt
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      // log error if max reconnect attempts are met
      console.error('RECON ERROR: Max WebSocket reconnection attempts reached, giving up.');
    }
  }

  // Triggers all listeners for a given table with the provided payload
  private triggerListeners(topic: string, payload: any): void {
    const topicListeners = this.listeners.get(topic);
    if (topicListeners) {
      topicListeners.forEach((callback) => callback(payload));
    }
  }
}

let instance: WebSocketService | null = null;

export const createWebSocketServiceInstance = (url: string): WebSocketService => {
  if (!instance) {
    instance = new WebSocketService(url);
  }
  
  return instance;
};