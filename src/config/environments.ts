// Base environment configuration
export interface EnvironmentConfig {
  apiUrl: string;
  environment: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Development environment configuration
export const developmentConfig: EnvironmentConfig = {
  apiUrl: 'http://localhost:3001/api/v1',
  environment: 'development',
  isDevelopment: true,
  isProduction: false,
};

// Production environment configuration
export const productionConfig: EnvironmentConfig = {
  apiUrl: 'https://salon-belleza-app-backend.onrender.com/api/v1',
  environment: 'production',
  isDevelopment: false,
  isProduction: true,
};

// Function to get current environment configuration
export const getEnvironmentConfig = (): EnvironmentConfig => {
  // Check environment using multiple methods
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  
  // For React apps, we can also check if there's a custom environment variable
  const customEnv = (window as any).__ENVIRONMENT__ || (isProduction ? 'production' : 'development');
  
  console.log(`🌍 Environment: ${customEnv}`);
  console.log(`🔗 Hostname: ${window.location.hostname}`);
  
  switch (customEnv.toLowerCase()) {
    case 'production':
    case 'prod':
      return productionConfig;
    case 'development':
    case 'dev':
    default:
      return developmentConfig;
  }
};

// Export current configuration
export const config = getEnvironmentConfig();
