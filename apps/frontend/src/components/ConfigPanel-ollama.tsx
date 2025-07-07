import React, { useState } from 'react';
import { ApiConfig } from '../types';
import { OllamaApiManager } from '../utils/ollama-api';

interface ConfigPanelProps {
  apiConfig: ApiConfig;
  onUpdateConfig: (config: ApiConfig) => void;
  onClose: () => void;
  apiManager: OllamaApiManager;
  availableModels?: string[];
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  apiConfig,
  onUpdateConfig,
  onClose,
  apiManager,
  availableModels = []
}) => {
  const [config, setConfig] = useState<ApiConfig>(apiConfig);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Presets específicos para Ollama
  const ollamaPresets = {
    local: {
      name: '🏠 Local Development',
      url: 'http://localhost:3001',
      model: 'tinyllama',
      temperature: 0.7,
      maxTokens: 2048
    },
    docker: {
      name: '🐳 Docker Container',
      url: 'http://localhost:3001',
      model: 'tinyllama',
      temperature: 0.7,
      maxTokens: 2048
    },
    production: {
      name: '🚀 Production Server',
      url: 'http://your-server:3001',
      model: 'tinyllama',
      temperature: 0.5,
      maxTokens: 4096
    }
  };

  // Modelos recomendados para Ollama
  const recommendedModels = [
    { name: 'tinyllama', description: '🚀 Fastest - 1.1B parameters' },
    { name: 'gemma2:2b', description: '⚡ Fast - 2B parameters' },
    { name: 'phi3:mini', description: '🎯 Balanced - 3.8B parameters' },
    { name: 'llama3.2:3b', description: '💪 Powerful - 3B parameters' },
    { name: 'codellama:7b', description: '👨‍💻 Code focused - 7B parameters' }
  ];

  // Manejar cambios en los campos
  const handleChange = (field: keyof ApiConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Aplicar preset
  const applyPreset = (presetKey: keyof typeof ollamaPresets) => {
    const preset = ollamaPresets[presetKey];
    setConfig(prev => ({
      ...prev,
      url: preset.url,
      model: preset.model,
      temperature: preset.temperature,
      maxTokens: preset.maxTokens
    }));
  };

  // Probar conexión con Ollama
  const testConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const testApiManager = new OllamaApiManager(config);
      const result = await testApiManager.testConnection();
      
      if (result.success) {
        setTestResult('✅ Connection successful! Ollama is ready.');
      } else {
        setTestResult(`❌ Connection failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Obtener modelos disponibles
  const refreshModels = async () => {
    try {
      setTestResult('🔄 Refreshing models...');
      const testApiManager = new OllamaApiManager(config);
      const models = await testApiManager.getAvailableModels();
      
      if (models.length > 0) {
        setTestResult(`📋 Found ${models.length} models: ${models.join(', ')}`);
      } else {
        setTestResult('⚠️ No models found. Make sure Ollama is running and has models installed.');
      }
    } catch (error) {
      setTestResult(`❌ Failed to get models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Guardar configuración
  const handleSave = () => {
    onUpdateConfig(config);
    onClose();
  };

  // Restaurar valores por defecto de Ollama
  const handleReset = () => {
    setConfig({
      url: 'http://localhost:3001',
      apiKey: '',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000,
      model: 'tinyllama',
      temperature: 0.7,
      maxTokens: 2048
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--spacing-xl)',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-lg)',
          paddingBottom: 'var(--spacing-md)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            🤖 Ollama Configuration
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: 'var(--spacing-xs)',
              borderRadius: 'var(--border-radius-sm)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Presets */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-sm)',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Quick Presets
          </label>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
            {Object.entries(ollamaPresets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key as keyof typeof ollamaPresets)}
                className="btn"
                style={{
                  fontSize: '0.85rem',
                  padding: 'var(--spacing-xs) var(--spacing-sm)'
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {/* URL de la API */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Backend URL
            </label>
            <input
              type="text"
              value={config.url}
              onChange={(e) => handleChange('url', e.target.value)}
              className="input"
              style={{ width: '100%' }}
              placeholder="http://localhost:3001"
            />
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: 'var(--spacing-xs)'
            }}>
              💡 This should point to your NestJS backend, not directly to Ollama
            </div>
          </div>

          {/* Modelo */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Model
              {availableModels.length > 0 && (
                <span style={{ 
                  color: 'var(--success)', 
                  fontSize: '0.8rem',
                  marginLeft: 'var(--spacing-xs)'
                }}>
                  ({availableModels.length} available)
                </span>
              )}
            </label>
            
            {/* Si hay modelos disponibles, mostrar select */}
            {availableModels.length > 0 ? (
              <select
                value={config.model || 'tinyllama'}
                onChange={(e) => handleChange('model', e.target.value)}
                className="input"
                style={{ width: '100%' }}
              >
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={config.model || 'tinyllama'}
                onChange={(e) => handleChange('model', e.target.value)}
                className="input"
                style={{ width: '100%' }}
                placeholder="tinyllama"
              />
            )}

            {/* Modelos recomendados */}
            <div style={{ marginTop: 'var(--spacing-xs)' }}>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: 'var(--spacing-xs)'
              }}>
                Recommended models:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                {recommendedModels.map(model => (
                  <button
                    key={model.name}
                    onClick={() => handleChange('model', model.name)}
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-sm)',
                      backgroundColor: config.model === model.name ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: config.model === model.name ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                    title={model.description}
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Temperatura */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Temperature: {config.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature || 0.7}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: 'var(--spacing-xs)'
            }}>
              <span>More focused</span>
              <span>More creative</span>
            </div>
          </div>

          {/* Context Length */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Context Length (tokens)
            </label>
            <select
              value={config.maxTokens || 2048}
              onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
              className="input"
              style={{ width: '100%' }}
            >
              <option value={1024}>1024 - Fast</option>
              <option value={2048}>2048 - Balanced</option>
              <option value={4096}>4096 - Large</option>
              <option value={8192}>8192 - Extra Large</option>
            </select>
          </div>

          {/* Timeout */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Timeout (seconds)
            </label>
            <select
              value={config.timeout / 1000}
              onChange={(e) => handleChange('timeout', parseInt(e.target.value) * 1000)}
              className="input"
              style={{ width: '100%' }}
            >
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={120}>2 minutes</option>
              <option value={300}>5 minutes</option>
            </select>
          </div>

          {/* Test Connection */}
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
              <button
                onClick={testConnection}
                disabled={isTestingConnection}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {isTestingConnection ? (
                  <>
                    <div className="spinner" style={{ width: '14px', height: '14px' }} />
                    Testing...
                  </>
                ) : (
                  '🔗 Test Connection'
                )}
              </button>
              
              <button
                onClick={refreshModels}
                disabled={isTestingConnection}
                className="btn"
                style={{ minWidth: 'auto' }}
              >
                📋 Get Models
              </button>
            </div>
            
            {testResult && (
              <div style={{
                marginTop: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.85rem',
                backgroundColor: testResult.includes('✅') 
                  ? 'rgba(76, 175, 80, 0.1)' 
                  : testResult.includes('🔄') || testResult.includes('📋')
                  ? 'rgba(33, 150, 243, 0.1)'
                  : 'rgba(244, 67, 54, 0.1)',
                color: testResult.includes('✅') 
                  ? 'var(--success)' 
                  : testResult.includes('🔄') || testResult.includes('📋')
                  ? 'var(--accent-primary)'
                  : 'var(--error)',
                border: `1px solid ${testResult.includes('✅') 
                  ? 'var(--success)' 
                  : testResult.includes('🔄') || testResult.includes('📋')
                  ? 'var(--accent-primary)'
                  : 'var(--error)'}`
              }}>
                {testResult}
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 'var(--spacing-md)',
          marginTop: 'var(--spacing-xl)',
          paddingTop: 'var(--spacing-md)',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button
            onClick={handleReset}
            className="btn"
            style={{ color: 'var(--warning)' }}
          >
            🔄 Reset to Ollama Defaults
          </button>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button onClick={onClose} className="btn">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              💾 Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
