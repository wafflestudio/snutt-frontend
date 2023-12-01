import { createContext, useContext } from 'react';

import { ClientFeature } from '../../entities/feature';

type FeatureContext = {
  clientFeatures: ClientFeature[];
};

export const featureContext = createContext<FeatureContext | null>(null);

export const useFeatureContext = () => {
  const context = useContext(featureContext);
  if (!context) throw new Error('context not provided');
  return context;
};
