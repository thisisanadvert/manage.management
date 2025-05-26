import { useCallback } from 'react';
import { config } from '../config/environments';

export const useFeatures = () => {
  const isFeatureEnabled = useCallback((featureName: keyof typeof config.features) => {
    return config.features[featureName];
  }, []);

  const isDevelopmentEnvironment = config.isDevelopment;

  return {
    isFeatureEnabled,
    isDevelopmentEnvironment,
  };
};