import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../types';

interface ConfigPanelUnifiedProps {
  apiConfig: ApiConfig;
  onUpdateConfig: (config: ApiConfig) => void;
  onClose: () => void;
}

// Tipos para los proveedores
type Provider = 'agno' | 'ollama';

// Configuraciones específicas para cada proveedor
interface AgnoConfig {
  model: 'gpt-4.1' | 'o4-mini';
  agent: 'agno_assist' | 'web_agent' | 'finance_agent';
  systemPrompt?: string;
  userId?: string;
  sessionId?: string;
  stream: boolean;
}

interface OllamaConfig {
  model: string;
  contextLength: number;
  keepAlive?: string;
}

const ConfigPanelUnified: React.FC<ConfigPanelUnifiedProps> = ({
  apiConfig,
  onUpdateConfig,
  onClose
}) => {
  // Estado principal
  const [provider, setProvider] = useState<Provider>('ollama');
  const [config, setConfig] = useState<ApiConfig>(apiConfig);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Configuraciones específicas por proveedor - inicializar desde config existente
  const [agnoConfig, setAgnoConfig] = useState<AgnoConfig>({
    model: (config.metadata?.agno?.model || 'gpt-4.1') as 'gpt-4.1' | 'o4-mini',
    agent: (config.metadata?.agno?.agent || 'agno_assist') as 'agno_assist' | 'web_agent' | 'finance_agent',
    stream: config.metadata?.agno?.stream || false,
    userId: config.metadata?.agno?.userId,
    sessionId: config.metadata?.agno?.sessionId,
    systemPrompt: config.metadata?.agno?.systemPrompt
  });

  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>({
    model: config.metadata?.ollama?.model || 'tinyllama',
    contextLength: config.metadata?.ollama?.contextLength || 2048,
    keepAlive: config.metadata?.ollama?.keepAlive
  });

  // Detectar proveedor inicial basado en URL o metadata
  useEffect(() => {
    // Primero verificar metadata si existe
    if (config.metadata?.provider) {
      setProvider(config.metadata.provider);
      
      // Cargar configuraciones específicas desde metadata
      if (config.metadata.agno) {
        setAgnoConfig(prev => ({ ...prev, ...config.metadata.agno }));
      }
      if (config.metadata.ollama) {
        setOllamaConfig(prev => ({ ...prev, ...config.metadata.ollama }));
      }
    } else if (config.url.includes('agno') || config.url.includes('agent-api') || config.url.includes('8000')) {
      setProvider('agno');
    } else {
      setProvider('ollama');
    }
  }, [config.url, config.metadata]);

  // Presets por proveedor
  const agnoPresets = {
    local: {
      name: '🏠 Local Development',
      url: 'http://localhost:3001',
      description: 'Connect to local backend (backend → agno)'
    },
    docker: {
      name: '🐳 Docker Container',
      url: 'http://backend:3001',
      description: 'Connect to backend in Docker (backend → agno)'
    }
  };

  const ollamaPresets = {
    local: {
      name: '🏠 Local Development',
      url: 'http://localhost:3001',
      description: 'Connect to local backend'
    },
    docker: {
      name: '🐳 Docker Container', 
      url: 'http://backend:3001',
      description: 'Connect to backend in Docker'
    }
  };

  // Modelos recomendados
  const agnoModels = [
    { id: 'gpt-4.1', name: 'GPT-4.1', description: '🚀 Most capable model' },
    { id: 'o4-mini', name: 'O4-Mini', description: '⚡ Faster and cheaper' }
  ];

  const agnoAgents = [
    { id: 'agno_assist', name: 'Agno Assist', description: '🤖 General AI assistant with Agno framework knowledge' },
    { id: 'web_agent', name: 'Web Agent', description: '🌐 Web browsing and research capabilities' },
    { id: 'finance_agent', name: 'Finance Agent', description: '💰 Financial analysis and market insights' }
  ];

  const ollamaModels = [
    { id: 'tinyllama', name: 'TinyLlama', description: '🚀 Fastest - 1.1B parameters' },
    { id: 'gemma2:2b', name: 'Gemma2 2B', description: '⚡ Fast - 2B parameters' },
    { id: 'phi3:mini', name: 'Phi3 Mini', description: '🎯 Balanced - 3.8B parameters' },
    { id: 'llama3.2:3b', name: 'Llama3.2 3B', description: '💪 Powerful - 3B parameters' }
  ];

  // Handlers para cambio de proveedor
  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    setTestResult(null);
    
    // Ambos proveedores usan el backend (puerto 3001)
    setConfig(prev => ({
      ...prev,
      url: 'http://localhost:3001',
      model: newProvider === 'agno' ? agnoConfig.model : ollamaConfig.model,
      apiKey: '',
      timeout: 60000
    }));
  };

  // Handler para aplicar presets
  const applyPreset = (presetKey: string) => {
    const presets = provider === 'agno' ? agnoPresets : ollamaPresets;
    const preset = presets[presetKey as keyof typeof presets];
    
    if (preset) {
      setConfig(prev => ({
        ...prev,
        url: preset.url
      }));
    }
  };

  // Handler para test de conexión
  const testConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      let testUrl: string;
      
      if (provider === 'agno') {
        // Test health endpoint del backend para Agno
        testUrl = `${config.url}/agno/health`;
      } else {
        // Test status endpoint para Ollama
        testUrl = `${config.url}/ollama/status`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        if (provider === 'agno') {
          // Agno health endpoint devuelve { "status": "success" }
          if (data.status === 'success') {
            setTestResult('✅ Agno Agent API is healthy and ready!');
          } else {
            setTestResult('⚠️ Agno API responded but status is not success');
          }
        } else {
          if (data.success && data.data?.ollama_ready) {
            setTestResult('✅ Ollama backend is healthy and ready!');
          } else {
            setTestResult('⚠️ Backend is responding but Ollama may not be ready');
          }
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      let errorMessage = 'Connection failed';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Connection timeout - service may be starting up';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = `Cannot reach ${provider === 'agno' ? 'Agent API' : 'Backend'} - is it running?`;
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = `${provider === 'agno' ? 'Agent API' : 'Backend'} endpoint not found - check URL`;
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = `${provider === 'agno' ? 'Agent API' : 'Backend'} internal error - check logs`;
        } else {
          errorMessage = error.message;
        }
      }
      
      setTestResult(`❌ ${errorMessage}`);
      console.error(`${provider} connection test failed:`, error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Handler para guardar configuración
  const handleSave = () => {
    // Construir configuración final basada en el proveedor
    const finalConfig: ApiConfig = {
      ...config,
      // Añadir configuraciones específicas del proveedor como metadata
      metadata: {
        provider,
        ...(provider === 'agno' ? { agno: agnoConfig } : { ollama: ollamaConfig })
      }
    };

    console.log('💾 Saving configuration:', { provider, finalConfig });
    onUpdateConfig(finalConfig);
    onClose();
  };

  // Handler para resetear a defaults
  const handleReset = () => {
    if (provider === 'agno') {
      setConfig({
        url: 'http://localhost:3001', // Backend para Agno
        apiKey: '',
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
        model: 'gpt-4.1',
        temperature: 0.7,
        maxTokens: 2000,
        metadata: {
          provider: 'agno',
          agno: {
            model: 'gpt-4.1',
            agent: 'agno_assist',
            stream: false
          }
        }
      });
      setAgnoConfig({
        model: 'gpt-4.1',
        agent: 'agno_assist',
        stream: false
      });
    } else {
      setConfig({
        url: 'http://localhost:3001',
        apiKey: '',
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
        model: 'tinyllama',
        temperature: 0.7,
        maxTokens: 2048,
        metadata: {
          provider: 'ollama',
          ollama: {
            model: 'tinyllama',
            contextLength: 2048
          }
        }
      });
      setOllamaConfig({
        model: 'tinyllama',
        contextLength: 2048
      });
    }
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
        maxWidth: '800px',
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
            ⚙️ AI Provider Configuration
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

        {/* Provider selector */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-sm)',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            AI Provider
          </label>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button
              onClick={() => handleProviderChange('agno')}
              className="btn"
              style={{
                flex: 1,
                padding: 'var(--spacing-md)',
                backgroundColor: provider === 'agno' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: provider === 'agno' ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${provider === 'agno' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--spacing-xs)'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>Agno</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Advanced AI Agents</div>
              </div>
            </button>
            
            <button
              onClick={() => handleProviderChange('ollama')}
              className="btn"
              style={{
                flex: 1,
                padding: 'var(--spacing-md)',
                backgroundColor: provider === 'ollama' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: provider === 'ollama' ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${provider === 'ollama' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--spacing-xs)'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🦙</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>Ollama</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Local LLM Runtime</div>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'var(--spacing-sm)',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Quick Setup
          </label>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            {Object.entries(provider === 'agno' ? agnoPresets : ollamaPresets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className="btn"
                style={{
                  flex: 1,
                  padding: 'var(--spacing-sm)',
                  fontSize: '0.85rem',
                  textAlign: 'left'
                }}
                title={preset.description}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {/* URL */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: 'var(--spacing-xs)',
              fontSize: '0.9rem',
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              {provider === 'agno' ? 'Agent API URL' : 'Backend URL'}
            </label>
            <input
              type="text"
              value={config.url}
              onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
              className="input"
              style={{ width: '100%' }}
              placeholder={provider === 'agno' ? 'http://localhost:8000' : 'http://localhost:3001'}
            />
          </div>

          {/* Provider-specific configurations */}
          {provider === 'agno' ? (
            <>
              {/* Agno Agent */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: 'var(--text-primary)'
                }}>
                  Agent
                </label>
                <select
                  value={agnoConfig.agent}
                  onChange={(e) => setAgnoConfig(prev => ({ ...prev, agent: e.target.value as any }))}
                  className="input"
                  style={{ width: '100%' }}
                >
                  {agnoAgents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Agno Model */}
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
                  value={agnoConfig.model}
                  onChange={(e) => {
                    const newModel = e.target.value as AgnoConfig['model'];
                    setAgnoConfig(prev => ({ ...prev, model: newModel }));
                    setConfig(prev => ({ ...prev, model: newModel }));
                  }}
                  className="input"
                  style={{ width: '100%' }}
                >
                  {agnoModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Ollama Model */}
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
                  value={ollamaConfig.model}
                  onChange={(e) => {
                    const newModel = e.target.value;
                    setOllamaConfig(prev => ({ ...prev, model: newModel }));
                    setConfig(prev => ({ ...prev, model: newModel }));
                  }}
                  className="input"
                  style={{ width: '100%' }}
                >
                  {ollamaModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Common configurations */}
          {/* Temperature */}
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
              onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
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
            <select
              value={config.maxTokens || 2000}
              onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
              className="input"
              style={{ width: '100%' }}
            >
              <option value={1000}>1,000 - Fast</option>
              <option value={2000}>2,000 - Balanced</option>
              <option value={4000}>4,000 - Large</option>
              <option value={8000}>8,000 - Extra Large</option>
            </select>
          </div>

          {/* Advanced settings toggle */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="btn"
              style={{
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}
            >
              {showAdvanced ? '▼' : '▶'} Advanced Settings
            </button>
          </div>

          {/* Advanced settings */}
          {showAdvanced && (
            <div style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--border-color)'
            }}>
              {/* Timeout */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
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
                  onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) * 1000 }))}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={120}>2 minutes</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>

              {/* Provider-specific advanced settings */}
              {provider === 'agno' && (
                <>
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={agnoConfig.stream}
                        onChange={(e) => setAgnoConfig(prev => ({ ...prev, stream: e.target.checked }))}
                      />
                      Stream responses
                    </label>
                  </div>

                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: 'var(--spacing-xs)',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)'
                    }}>
                      User ID (optional)
                    </label>
                    <input
                      type="text"
                      value={agnoConfig.userId || ''}
                      onChange={(e) => setAgnoConfig(prev => ({ ...prev, userId: e.target.value }))}
                      className="input"
                      style={{ width: '100%' }}
                      placeholder="Custom user identifier"
                    />
                  </div>
                </>
              )}

              {provider === 'ollama' && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-xs)',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    Context Length
                  </label>
                  <select
                    value={ollamaConfig.contextLength}
                    onChange={(e) => setOllamaConfig(prev => ({ ...prev, contextLength: parseInt(e.target.value) }))}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value={1024}>1,024 tokens</option>
                    <option value={2048}>2,048 tokens</option>
                    <option value={4096}>4,096 tokens</option>
                    <option value={8192}>8,192 tokens</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Test Connection */}
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <button
              onClick={testConnection}
              disabled={isTestingConnection}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {isTestingConnection ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px' }} />
                  Testing {provider === 'agno' ? 'Agno Agent API' : 'Ollama Backend'}...
                </>
              ) : (
                `🔗 Test ${provider === 'agno' ? 'Agno' : 'Ollama'} Connection`
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

        {/* Action Buttons */}
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

export default ConfigPanelUnified;
