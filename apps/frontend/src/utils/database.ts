// GESTIÓN DE BASE DE DATOS - SOLO LOCALSTORAGE (SQLite DESHABILITADO)
import { ChatSession, Message, FileAttachment } from '@/types';
import { STORAGE_CONFIG, isLocalStorageAvailable } from './storage-config';

// ============================================================================
// IMPLEMENTACIÓN CON LOCALSTORAGE ÚNICAMENTE
// ============================================================================

class LocalStorageManager {
  private readonly SESSIONS_KEY = 'chatbox_sessions';
  private readonly MESSAGES_KEY_PREFIX = 'chatbox_messages_';
  private readonly ATTACHMENTS_KEY_PREFIX = 'chatbox_attachments_';

  async initialize(): Promise<void> {
    if (!isLocalStorageAvailable()) {
      throw new Error('localStorage is not supported in this environment');
    }
    
    if (!localStorage.getItem(this.SESSIONS_KEY)) {
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify([]));
    }
  }

  async createSession(name: string): Promise<ChatSession> {
    const id = this.generateId();
    const now = new Date();
    
    const newSession: ChatSession = {
      id,
      name,
      createdAt: now,
      updatedAt: now,
      messageCount: 0
    };

    const sessions = this.getStoredSessions();
    sessions.unshift(newSession);
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    
    return newSession;
  }

  async getSessions(): Promise<ChatSession[]> {
    const sessions = this.getStoredSessions();
    return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async saveMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const id = this.generateId();
    const timestamp = new Date();

    const newMessage: Message = {
      id,
      content: message.content,
      role: message.role,
      timestamp,
      sessionId: message.sessionId,
      attachments: message.attachments
    };

    const messagesKey = this.MESSAGES_KEY_PREFIX + message.sessionId;
    const messages = this.getStoredMessages(message.sessionId);
    messages.push(newMessage);
    localStorage.setItem(messagesKey, JSON.stringify(messages));

    if (message.attachments && message.attachments.length > 0) {
      const attachmentsKey = this.ATTACHMENTS_KEY_PREFIX + id;
      localStorage.setItem(attachmentsKey, JSON.stringify(message.attachments));
    }

    await this.updateSessionStats(message.sessionId);
    return newMessage;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    const messages = this.getStoredMessages(sessionId);
    
    return messages.map(msg => {
      const attachmentsKey = this.ATTACHMENTS_KEY_PREFIX + msg.id;
      const storedAttachments = localStorage.getItem(attachmentsKey);
      
      if (storedAttachments) {
        const attachments = JSON.parse(storedAttachments).map((att: any) => ({
          ...att,
          uploadedAt: new Date(att.uploadedAt)
        }));
        msg.attachments = attachments;
      }
      
      msg.timestamp = new Date(msg.timestamp);
      return msg;
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    const messages = this.getStoredMessages(sessionId);
    
    messages.forEach(msg => {
      const attachmentsKey = this.ATTACHMENTS_KEY_PREFIX + msg.id;
      localStorage.removeItem(attachmentsKey);
    });
    
    const messagesKey = this.MESSAGES_KEY_PREFIX + sessionId;
    localStorage.removeItem(messagesKey);
    
    const sessions = this.getStoredSessions();
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(updatedSessions));
  }

  async close(): Promise<void> {
    return Promise.resolve();
  }

  private getStoredSessions(): ChatSession[] {
    const storedSessions = localStorage.getItem(this.SESSIONS_KEY);
    if (!storedSessions) return [];
    
    return JSON.parse(storedSessions).map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt)
    }));
  }

  private getStoredMessages(sessionId: string): Message[] {
    const messagesKey = this.MESSAGES_KEY_PREFIX + sessionId;
    const storedMessages = localStorage.getItem(messagesKey);
    if (!storedMessages) return [];
    
    return JSON.parse(storedMessages);
  }

  private async updateSessionStats(sessionId: string): Promise<void> {
    const sessions = this.getStoredSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex].messageCount += 1;
      sessions[sessionIndex].updatedAt = new Date();
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// ============================================================================
// INTERFAZ SIMPLIFICADA (SOLO LOCALSTORAGE)
// ============================================================================

interface IDatabaseManager {
  initialize(): Promise<void>;
  createSession(name: string): Promise<ChatSession>;
  getSessions(): Promise<ChatSession[]>;
  saveMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message>;
  getMessages(sessionId: string): Promise<Message[]>;
  deleteSession(sessionId: string): Promise<void>;
  close(): Promise<void>;
}

export class DatabaseManager implements IDatabaseManager {
  private manager: LocalStorageManager;

  constructor() {
    console.log('🔧 Usando localStorage para almacenamiento (SQLite deshabilitado)');
    this.manager = new LocalStorageManager();
  }

  // Delegación de métodos a localStorage
  async initialize(): Promise<void> {
    return this.manager.initialize();
  }

  async createSession(name: string): Promise<ChatSession> {
    return this.manager.createSession(name);
  }

  async getSessions(): Promise<ChatSession[]> {
    return this.manager.getSessions();
  }

  async saveMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    return this.manager.saveMessage(message);
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return this.manager.getMessages(sessionId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    return this.manager.deleteSession(sessionId);
  }

  async close(): Promise<void> {
    return this.manager.close();
  }

  // Métodos adicionales específicos para localStorage
  async clearAll(): Promise<void> {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('chatbox_')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem('chatbox_sessions', JSON.stringify([]));
  }

  async exportData(): Promise<any> {
    const sessions = await this.getSessions();
    const data: any = {
      sessions,
      messages: {},
      attachments: {},
      exportedAt: new Date().toISOString(),
      storageType: 'localStorage'
    };

    for (const session of sessions) {
      const messages = await this.getMessages(session.id);
      data.messages[session.id] = messages;
      
      messages.forEach(msg => {
        if (msg.attachments) {
          data.attachments[msg.id] = msg.attachments;
        }
      });
    }

    return data;
  }

  async importData(data: any): Promise<void> {
    await this.clearAll();

    if (data.sessions) {
      localStorage.setItem('chatbox_sessions', JSON.stringify(data.sessions));
    }

    if (data.messages) {
      Object.keys(data.messages).forEach(sessionId => {
        const messagesKey = 'chatbox_messages_' + sessionId;
        localStorage.setItem(messagesKey, JSON.stringify(data.messages[sessionId]));
      });
    }

    if (data.attachments) {
      Object.keys(data.attachments).forEach(messageId => {
        const attachmentsKey = 'chatbox_attachments_' + messageId;
        localStorage.setItem(attachmentsKey, JSON.stringify(data.attachments[messageId]));
      });
    }
  }

  // Información del sistema de almacenamiento
  getStorageInfo(): { type: string; available: boolean; size?: number } {
    let size = 0;
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('chatbox_')) {
          size += localStorage.getItem(key)?.length || 0;
        }
      });
    } catch (e) {
      // Ignorar errores de acceso
    }
    
    return {
      type: 'localStorage',
      available: isLocalStorageAvailable(),
      size: size
    };
  }
}

// Instancia singleton de la base de datos
export const dbManager = new DatabaseManager();

// ============================================================================
// INSTRUCCIONES DE USO SIMPLIFICADAS
// ============================================================================

/*
CONFIGURACIÓN ACTUAL: SOLO LOCALSTORAGE (SQLite completamente deshabilitado)

El sistema ahora usa únicamente localStorage para almacenamiento.
SQLite ha sido completamente removido del proyecto.

MÉTODOS DISPONIBLES:
- dbManager.initialize(): Inicializa el sistema de almacenamiento
- dbManager.createSession(name): Crea una nueva sesión de chat
- dbManager.getSessions(): Obtiene todas las sesiones
- dbManager.saveMessage(message): Guarda un mensaje
- dbManager.getMessages(sessionId): Obtiene mensajes de una sesión
- dbManager.deleteSession(sessionId): Elimina una sesión
- dbManager.clearAll(): Limpia todos los datos
- dbManager.exportData(): Exporta todos los datos a JSON
- dbManager.importData(data): Importa datos desde JSON
- dbManager.getStorageInfo(): Información del sistema de almacenamiento

EJEMPLO DE USO:
```typescript
import { dbManager } from './utils/database';

// Inicializar
await dbManager.initialize();

// Crear sesión
const session = await dbManager.createSession('Mi Chat');

// Guardar mensaje
const message = await dbManager.saveMessage({
  content: 'Hola mundo',
  role: 'user',
  sessionId: session.id
});

// Obtener mensajes
const messages = await dbManager.getMessages(session.id);
```
*/
