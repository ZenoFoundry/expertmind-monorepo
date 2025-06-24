// Utilidades para manejo de archivos
export class FileUtils {
  // Tipos de archivo soportados
  static readonly SUPPORTED_TYPES = {
    images: ['.png', '.jpg', '.jpeg', '.gif'],
    documents: ['.pdf', '.txt']
  };

  // Límite de tamaño en bytes (5MB)
  static readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  // Validar si un archivo es soportado
  static isSupportedFile(fileName: string): boolean {
    const extension = this.getFileExtension(fileName).toLowerCase();
    const allSupportedTypes = [
      ...this.SUPPORTED_TYPES.images,
      ...this.SUPPORTED_TYPES.documents
    ];
    
    return allSupportedTypes.includes(extension);
  }

  // Obtener extensión de archivo
  static getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
  }

  // Obtener tipo de archivo (imagen o documento)
  static getFileType(fileName: string): 'image' | 'document' | 'unknown' {
    const extension = this.getFileExtension(fileName).toLowerCase();
    
    if (this.SUPPORTED_TYPES.images.includes(extension)) {
      return 'image';
    }
    
    if (this.SUPPORTED_TYPES.documents.includes(extension)) {
      return 'document';
    }
    
    return 'unknown';
  }

  // Formatear tamaño de archivo para mostrar
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validar tamaño de archivo
  static isValidFileSize(sizeInBytes: number): boolean {
    return sizeInBytes <= this.MAX_FILE_SIZE;
  }

  // Obtener ícono según tipo de archivo (usando lucide-react)
  static getFileIcon(fileName: string): string {
    const type = this.getFileType(fileName);
    const extension = this.getFileExtension(fileName).toLowerCase();
    
    switch (type) {
      case 'image':
        return 'Image';
      case 'document':
        if (extension === '.pdf') return 'FileText';
        if (extension === '.txt') return 'FileText';
        return 'File';
      default:
        return 'File';
    }
  }

  // Leer archivo como texto (para archivos .txt)
  static async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }

  // Leer archivo como base64 (para enviar a la API)
  static async readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          // Extraer solo la parte base64 (sin el prefijo data:...)
          const base64String = (e.target.result as string).split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to read file as base64'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file as base64'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  // Usar la API de Electron para seleccionar archivos
  static async selectFile(): Promise<{
    name: string;
    type: string;
    size: number;
    path: string;
  } | null> {
    try {
      // Verificar si estamos en Electron
      if (typeof window !== 'undefined' && window.electronAPI) {
        return await window.electronAPI.selectFile();
      }
      
      // Fallback para desarrollo en browser
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = [
          ...this.SUPPORTED_TYPES.images,
          ...this.SUPPORTED_TYPES.documents
        ].join(',');
        
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            // Validar archivo
            if (!this.isSupportedFile(file.name)) {
              alert('Tipo de archivo no soportado');
              resolve(null);
              return;
            }
            
            if (!this.isValidFileSize(file.size)) {
              alert('El archivo excede el límite de 5MB');
              resolve(null);
              return;
            }
            
            resolve({
              name: file.name,
              type: this.getFileExtension(file.name),
              size: file.size,
              path: file.name // En browser no tenemos path real
            });
          } else {
            resolve(null);
          }
        };
        
        input.click();
      });
    } catch (error) {
      console.error('Error selecting file:', error);
      return null;
    }
  }

  // Validar archivo antes de procesar
  static validateFile(fileName: string, fileSize: number): { 
    isValid: boolean; 
    error?: string 
  } {
    // Verificar tipo de archivo
    if (!this.isSupportedFile(fileName)) {
      return {
        isValid: false,
        error: `Tipo de archivo no soportado. Tipos permitidos: ${[
          ...this.SUPPORTED_TYPES.images,
          ...this.SUPPORTED_TYPES.documents
        ].join(', ')}`
      };
    }
    
    // Verificar tamaño
    if (!this.isValidFileSize(fileSize)) {
      return {
        isValid: false,
        error: `El archivo excede el límite de ${this.formatFileSize(this.MAX_FILE_SIZE)}`
      };
    }
    
    return { isValid: true };
  }

  // Generar un nombre único para archivo
  static generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const extension = this.getFileExtension(originalName);
    const nameWithoutExt = originalName.replace(extension, '');
    
    return `${nameWithoutExt}_${timestamp}${extension}`;
  }
}
