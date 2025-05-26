type Environment = 'development' | 'production';

interface EnvironmentConfig {
  isDevelopment: boolean;
  apiUrl: string;
  features: {
    supplierNetwork: boolean;
    rtmFormation: boolean;
    documentStorage: boolean;
  };
}

const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    isDevelopment: true,
    apiUrl: 'https://dev.manage.management',
    features: {
      supplierNetwork: true,
      rtmFormation: true,
      documentStorage: true,
    },
  },
  production: {
    isDevelopment: false,
    apiUrl: 'https://app.manage.management',
    features: {
      supplierNetwork: true,
      rtmFormation: true,
      documentStorage: true,
    },
  },
};

const getEnvironment = (): Environment => {
  const hostname = window.location.hostname;
  const envParam = import.meta.env.VITE_ENVIRONMENT || 'production';
  
  if (envParam === 'development' || hostname.includes('dev') || hostname.includes('localhost')) {
    return 'development';
  }
  
  return 'production';
};

export const config = environments[getEnvironment()];