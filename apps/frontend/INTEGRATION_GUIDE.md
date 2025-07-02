// Agregar esta línea al inicio de App.tsx
import { OllamaApiManager, defaultOllamaConfig } from './utils/ollama-api';

// Reemplazar esta línea:
// import { ApiManager, defaultApiConfig } from './utils/api';

// Con esta:
// import { ApiManager, defaultApiConfig } from './utils/api';  // Mantener para compatibilidad

// Y cambiar:
// const [apiManager, setApiManager] = useState<ApiManager>(new ApiManager(defaultApiConfig));

// Por:
const [apiManager, setApiManager] = useState<OllamaApiManager>(new OllamaApiManager(defaultOllamaConfig));
