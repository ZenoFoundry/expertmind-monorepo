// Configuración de almacenamiento - SQLite DESHABILITADO
export const STORAGE_CONFIG = {
  // FORZADO a localStorage - SQLite deshabilitado completamente
  type: 'localStorage' as 'localStorage',
  
  // Configuración para localStorage
  localStorage: {
    keyPrefix: 'chatbox_'
  }
};

// Función para verificar si el entorno soporta localStorage
export const isLocalStorageAvailable = (): boolean => {
  try {
    return typeof Storage !== 'undefined' && typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
};

// Función para verificar si el entorno soporta SQLite - DESHABILITADO
export const isSQLiteAvailable = (): boolean => {
  // SQLite completamente deshabilitado
  return false;
};

// Función para obtener el tipo de almacenamiento recomendado - SOLO LOCALSTORAGE
export const getRecommendedStorageType = (): 'localStorage' => {
  // Solo localStorage disponible, SQLite deshabilitado
  return 'localStorage';
};
