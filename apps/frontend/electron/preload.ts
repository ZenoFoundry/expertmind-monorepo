import { contextBridge, ipcRenderer } from 'electron';

// Definir la API que estará disponible en el renderer
export interface ElectronAPI {
  selectFile: () => Promise<{
    path: string;
    name: string;
    size: number;
    type: string;
  } | null>;
  readFile: (filePath: string) => Promise<Buffer>;
}

// Exponer la API de forma segura al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
} as ElectronAPI);

// Declaración para TypeScript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
