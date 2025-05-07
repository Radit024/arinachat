
import React from 'react';
import { businessFeasibilityConfig } from './BusinessFeasibility';
import { demandForecastingConfig } from './DemandForecasting';
import { optimizationAnalysisConfig } from './OptimizationAnalysis';

// Consolidated list of all feature configurations
export const featureConfigs = [
  businessFeasibilityConfig,
  demandForecastingConfig,
  optimizationAnalysisConfig
];

export const getFeatureById = (id: string) => {
  return featureConfigs.find(f => f.id === id) || featureConfigs[0];
};
