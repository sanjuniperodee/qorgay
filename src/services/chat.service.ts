import axios from 'axios';
import type { ChatLoginValidator, ChatRooms, ChatRoomType, Message, SendMessage, Files, FileContent } from '@/types/Chat';
// import type { ComplaintRoomType } from '@/types/Complaint';
import { useChatStore } from '@stores/ChatStore'
const API_URL = 'https://api.qorgau-city.kz/api/v1/statements/response/call';
const API_CHAT = 'https://chapi.qorgau-city.kz';
const SOCKET_URL = ' wss://chapi.qorgau-city.kz';

const connectionMap = new Map();
// const MAX_CONNECTIONS_PER_INTERVAL = 2;
// const INTERVAL_MS = 600; // 1 минута
// const RECONNECT_TIMEOUT_MS = 100; // 10 секунд

class ChatWebSocketService {
  private socket: WebSocket | null = null;
  private chatUrl: string;
  private chatToken: string | null;


  
  constructor(chatUrl: string) {
    this.chatUrl = chatUrl;
    this.chatToken = localStorage.getItem('chat_token');
  }

  async loginForChat(body: ChatLoginValidator): Promise<string> {
    const { data } = await axios.post(`${this.chatUrl}/api/v1/auth/login/`, body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Ответ от входа:', data);
    localStorage.setItem('chat_token', data.key);
    return 'Авторизация прошла успешно.';
  }

  connect(roomId: number) {
    return new Promise((resolve) => {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = new WebSocket(`${SOCKET_URL}/ws/chat/${roomId}/?token=Token ${this.chatToken}`);

    this.socket.onopen = () => {
      console.log("Connected to WebSocket");
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const chatStore = useChatStore()
      if (data.attachments && data.attachments.length > 0) {
        chatStore.message = {
          ...data,
          attachments: data.attachments
        };
      } else {
        chatStore.message = data;
      }
    };
    

    this.socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
  });
  }

  

  sendMessageToSocket(message: SendMessage) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
  
    const socketMessagePayload = {
      message: message.text,
      attachments: message.files?.map(uploadResponse => 
        uploadResponse.files.map(file => ({
          file: file.file,        // URL файла
          filename: file.filename, // Имя файла
          file_size: file.file_size // Размер файла
        }))
      ).flat()
    };
  
    try {
      this.socket.send(JSON.stringify(socketMessagePayload));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private handleMessage(message: Message): void {
    console.log('New message received:', message);
  }

  async chatLogout() {
    localStorage.removeItem('chat_token');
  }

  async getAllConversations(): Promise<ChatRooms> {
    const { data } = await axios.get(`${this.chatUrl}/api/v1/conversations/statement/`, {
      headers: {
        Authorization: `Token ${this.chatToken}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  }

  async getConversation(roomId: number): Promise<ChatRoomType> {
    const { data } = await axios.get(`${this.chatUrl}/api/v1/conversations/statement/${roomId}`, {
      headers: {
        Authorization: `Token ${this.chatToken}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  }

  async startConversation(phone: string): Promise<ChatRoomType> {
    const { data } = await axios.post(
      `${this.chatUrl}/api/v1/conversations/statement/start/`,
      { phone },
      {
        headers: {
          Authorization: `Token ${this.chatToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return data;
  }

  async createChatRoom(phone: string) {
    try {
      const { data } = await axios.post(
        `${this.chatUrl}/api/v1/conversations/statement/start/?token=Token ${this.chatToken}`,
        { phone }
      );
      const response = await axios.post(`${API_URL}${data.id}/`, {
        statement: data.id
      });

      // Обрабатываем успешный ответ
      const chatRoomData = response.data;
      console.log('Chat Room Created:', chatRoomData);

      // Возвращаем данные чата (если нужно для дальнейшего использования)
      return chatRoomData;
    } catch (error) {
      // Обрабатываем ошибку
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  // async getMessageById(id: number) {
  //   return new Promise((resolve) => {
  //   //this.socket = new WebSocket(`${SOCKET_URL}/ws/chat/${id}/?token=Token ${this.chatToken}`);
  //   if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
  //     return;
  //   }
  //   this.socket.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     // console.log("Received message:", data);
  //     resolve(data);
  //   };
  //   });
  // }

  async getChatRoomById(id: number) {
    const { data } = await axios.get(`${this.chatUrl}/api/v1/conversations/statement/${id}`, {
      headers: {
        Authorization: `Token ${this.chatToken}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  }

  async getAllChatRooms(status: string): Promise<ChatRooms> {
    try {
      const { data } = await axios.get(`${this.chatUrl}/api/v1/conversations/statement/?statement_status=${status}`, {
        headers: {
          Authorization: `Token ${this.chatToken}`,
          'Content-Type': 'application/json'
        }
      });
      return data; // Возвращаем список всех комнат чата
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  }

  async getConversationsComplaint(roomId: number): Promise<ChatRoomType> {
    const { data } = await axios.get(`${this.chatUrl}/api/v1/conversations/complaint/${roomId}/`, {
      headers: {
        Authorization: `Token ${this.chatToken}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  }

  // async createFile(conversationId: number, file: File): Promise<FileContent | null> {
  //   const formData = new FormData();
  //   formData.append('file', file);
  
  //   try {
  //     const response = await axios.post(`${this.chatUrl}/api/v1/conversations/send_files/${conversationId}/`, formData, {
  //       headers: {
  //         Authorization: `Token ${this.chatToken}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });
  //     const uploadedFile = response.data.files[0];
  //     return {
  //       id: uploadedFile.id,
  //       file: uploadedFile.file,
  //       filename: uploadedFile.filename,
  //       file_size: uploadedFile.file_size,
  //       uploaded_at: uploadedFile.uploaded_at // добавляем uploaded_at
  //     };
  //   } catch (error) {
  //     console.error("Ошибка при загрузке файла:", error);
  //     return null;
  //   }
  // };
  

  async createFile(fileId: number, file: File){
    const body = {
      files: file
    }
    const { data } = await axios.post(`${this.chatUrl}/api/v1/conversations/send_files/${fileId}/`,  body, {
      headers: {
        Authorization: `Token ${this.chatToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  } 
}



export const chatWebSocketService = new ChatWebSocketService(import.meta.env.VITE_CHAT_URL);