import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Variables globales
let mainWindow: BrowserWindow;
// Mejorar detección de modo desarrollo
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Función para crear la ventana principal
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset', // Estilo minimalista que oculta la barra de título pero mantiene controles
    trafficLightPosition: { x: 20, y: 20 }, // Posición de los botones de semáforo (cerrar, minimizar, maximizar)
    backgroundColor: '#0a0a0a', // Color de fondo negro
    titleBarOverlay: process.platform === 'darwin' ? {
      color: '#0a0a0a',
      symbolColor: '#ffffff',
      height: 32
    } : undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Cargar la aplicación React
  if (isDev) {
    // En desarrollo, cargar desde el servidor de Vite
    mainWindow.loadURL('http://localhost:5173').catch((err) => {
      console.error('Error cargando URL de desarrollo:', err);
      // Fallback: intentar cargar después de un delay
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:5173');
      }, 2000);
    });
    // Abrir DevTools en desarrollo
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar archivo estático
    const indexPath = path.join(__dirname, '../react/index.html');
    console.log('Cargando archivo:', indexPath);
    mainWindow.loadFile(indexPath);
  }
}

// Evento cuando la aplicación está lista
app.whenReady().then(() => {
  createWindow();

  // En macOS, recrear ventana cuando se hace clic en el dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Cerrar aplicación cuando todas las ventanas se cierran (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers para comunicación con el renderer

// Handler para seleccionar archivos
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Archivos soportados', extensions: ['pdf', 'txt', 'png', 'jpg', 'jpeg', 'gif'] },
      { name: 'Documentos', extensions: ['pdf', 'txt'] },
      { name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'gif'] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const stats = fs.statSync(filePath);
    
    // Verificar límite de 5MB
    if (stats.size > 5 * 1024 * 1024) {
      throw new Error('El archivo excede el límite de 5MB');
    }

    return {
      path: filePath,
      name: path.basename(filePath),
      size: stats.size,
      type: path.extname(filePath),
    };
  }

  return null;
});

// Handler para leer archivo
ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    const data = fs.readFileSync(filePath);
    return data;
  } catch (error) {
    throw new Error(`Error al leer el archivo: ${error}`);
  }
});
