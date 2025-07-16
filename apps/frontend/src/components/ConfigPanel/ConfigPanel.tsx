import React, { useState } from 'react';
import { ApiConfig } from '../../types';
import { ApiManager } from '../../utils/api';

interface ConfigPanelProps {
  apiConfig: ApiConfig;
  onUpdateConfig: (config: ApiConfig) => void;
  onClose: () => void;
  apiManager: ApiManager;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  apiConfig,
  onUpdateConfig,
  onClose,
  apiManager
}) => {
  const [config, setConfig] = useState<ApiConfig>(apiConfig);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Manejar cambios en los campos
  const handleChange = (field: keyof ApiConfig, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Probar conexión con la API
  const testConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const testApiManager = new ApiManager(config);
      const response = await testApiManager.sendMessage('Hello, this is a test message.');
      
      if (response.error) {
        setTestResult(`Error: ${response.error}`);
      } else {
        setTestResult('✅ Connection successful!');
      }
    } catch (error) {
      setTestResult(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Guardar configuración
  const handleSave = () => {
    onUpdateConfig(config);
    onClose();
  };

  // Restaurar valores por defecto
  const handleReset = () => {
    setConfig({
      url: 'https://api.openai.com/v1/chat/completions',
      apiKey: '',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000,
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000
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
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
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
            ⚙️ API Configuration
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
              API URL
            </label>
            <input
              type="text"
              value={config.url}
              onChange={(e) => handleChange('url', e.target.value)}
              className="input"
              style={{ width: '100%' }}
              placeholder="https://api.openai.com/v1/chat/completions"
            />
          </div>

          {/* API Key */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              API Key
            </label>
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                className="input"
                style={{ flex: 1 }}
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="btn"
                style={{ padding: 'var(--spacing-xs) var(--spacing-sm)' }}
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
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
            </label>
            <select
              value={config.model || 'gpt-3.5-turbo'}
              onChange={(e) => handleChange('model', e.target.value)}
              className="input"
              style={{ width: '100%' }}
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
            </select>
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

          {/* Max Tokens */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Max Tokens
            </label>
            <input
              type="number"
              value={config.maxTokens || 2000}
              onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
              className="input"
              style={{ width: '100%' }}
              min="1"
              max="8000"
            />
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
              Timeout (ms)
            </label>
            <input
              type="number"
              value={config.timeout}
              onChange={(e) => handleChange('timeout', parseInt(e.target.value))}
              className="input"
              style={{ width: '100%' }}
              min="1000"
              max="120000"
            />
          </div>

          {/* Test Connection */}
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <button
              onClick={testConnection}
              disabled={isTestingConnection || !config.apiKey}
              className="btn"
              style={{ width: '100%' }}
            >
              {isTestingConnection ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px' }} />
                  Testing Connection...
                </>
              ) : (
                '🔗 Test Connection'
              )}
            </button>
            
            {testResult && (
              <div style={{
                marginTop: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.85rem',
                backgroundColor: testResult.includes('✅') 
                  ? 'rgba(76, 175, 80, 0.1)' 
                  : 'rgba(244, 67, 54, 0.1)',
                color: testResult.includes('✅') 
                  ? 'var(--success)' 
                  : 'var(--error)',
                border: `1px solid ${testResult.includes('✅') 
                  ? 'var(--success)' 
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
            🔄 Reset to Defaults
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
