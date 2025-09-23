import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY HH:mm') => {
  return dayjs(date).format(format);
};

export const formatRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow();
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('es-AR').format(num);
};

export const truncateText = (text: string, maxLength: number = 50) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const getStatusColor = (isActive: boolean) => {
  return isActive ? 'green' : 'red';
};

export const getStatusText = (isActive: boolean) => {
  return isActive ? 'Activo' : 'Inactivo';
};

export const getLLMProviderName = (provider: string) => {
  const providers = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    local: 'Local (Ollama)'
  };
  return providers[provider as keyof typeof providers] || provider;
};

export const getMCPTypeLabel = (type: string) => {
  const types = {
    filesystem: 'Sistema de Archivos',
    database: 'Base de Datos',
    api: 'API Externa',
    tools: 'Herramientas'
  };
  return types[type as keyof typeof types] || type;
};

export const getMCPTypeColor = (type: string) => {
  const colors = {
    filesystem: 'blue',
    database: 'green',
    api: 'orange',
    tools: 'purple'
  };
  return colors[type as keyof typeof colors] || 'default';
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string) => {
  return password.length >= 6;
};

export const generatePassword = (length: number = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};
