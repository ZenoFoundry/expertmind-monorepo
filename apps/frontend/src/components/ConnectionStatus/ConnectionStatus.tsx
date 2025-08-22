import React, { useState, useEffect } from 'react';
import { backendChatService } from '../../services/backendChatService';
import { unifiedChatService } from '../../services/unifiedChatService';

interface ConnectionStatusProps {
  className?: string;
}

interface ProviderStatus {
  name: string;
  isHealthy: boolean;
  models: string[];
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkStatus = async () => {
    setBackendStatus('checking');
    
    try {
      // Verificar backend
      const healthCheck = await backendChatService.healthCheck();
      
      if (healthCheck.success) {
        setBackendStatus('connected');
        
        // Verificar proveedores de IA
        try {
          const availableProviders = await unifiedChatService.getAvailableProviders();
          setProviders(availableProviders.map(p => ({
            name: p.name,
            isHealthy: p.isHealthy,
            models: p.models || []
          })));
        } catch (error) {
          console.warn('Could not get providers:', error);
          setProviders([]);
        }
      } else {
        setBackendStatus('disconnected');
        setProviders([]);
      }
    } catch (error) {
      setBackendStatus('disconnected');
      setProviders([]);
    }
    
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkStatus();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (backendStatus) {
      case 'checking':
        return '🔄';
      case 'connected':
        return providers.some(p => p.isHealthy) ? '🟢' : '🟡';
      case 'disconnected':
        return '🔴';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'checking':
        return 'Verificando conexión...';
      case 'connected':
        const healthyProviders = providers.filter(p => p.isHealthy);
        if (healthyProviders.length > 0) {
          return `Conectado - ${healthyProviders.length} proveedor(es) activo(s)`;
        } else {
          return 'Backend conectado - Sin proveedores de IA disponibles';
        }
      case 'disconnected':
        return 'Desconectado del backend';
    }
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'checking':
        return 'text-yellow-600';
      case 'connected':
        return providers.some(p => p.isHealthy) ? 'text-green-600' : 'text-yellow-600';
      case 'disconnected':
        return 'text-red-600';
    }
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {/* Estado principal */}
      <div 
        className={`flex items-center space-x-2 cursor-pointer ${getStatusColor()}`}
        onClick={checkStatus}
        title="Haz clic para actualizar el estado"
      >
        <span className="text-sm">{getStatusIcon()}</span>
        <span className="text-xs font-medium">{getStatusText()}</span>
      </div>

      {/* Detalles de proveedores */}
      {providers.length > 0 && (
        <div className="text-xs space-y-1">
          {providers.map(provider => (
            <div key={provider.name} className="flex items-center space-x-2">
              <span>{provider.isHealthy ? '✅' : '❌'}</span>
              <span className="capitalize font-medium">{provider.name}</span>
              <span className="text-gray-500">
                ({provider.models.length} modelo{provider.models.length !== 1 ? 's' : ''})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional para problemas */}
      {backendStatus === 'connected' && !providers.some(p => p.isHealthy) && (
        <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded border">
          <div className="font-medium">⚠️ Sin IA disponible</div>
          <div className="mt-1">
            Para usar el chat en línea, asegúrate de que Ollama esté ejecutándose:
          </div>
          <div className="mt-1 font-mono text-xs bg-gray-100 p-1 rounded">
            ollama serve
          </div>
        </div>
      )}

      {backendStatus === 'disconnected' && (
        <div className="text-xs text-red-700 bg-red-50 p-2 rounded border">
          <div className="font-medium">🔴 Backend no disponible</div>
          <div className="mt-1">
            Verifica que el servidor backend esté ejecutándose en http://localhost:3001
          </div>
        </div>
      )}

      {/* Timestamp de la última verificación */}
      <div className="text-xs text-gray-400">
        Última verificación: {lastCheck.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ConnectionStatus;
