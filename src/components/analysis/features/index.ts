
import { Calculator, ChartBar, ChartLine, ChartPie, FileSpreadsheet, Layers } from 'lucide-react';
import { feasibilityConfig } from './FeasibilityAnalysis';
import { forecastingConfig } from './ForecastingAnalysis';
import { swotConfig } from './SwotAnalysis';
import { canvasConfig } from './CanvasAnalysis';
import { comingSoonFeatures } from './ComingSoonFeatures';

// Add icons to all feature configs
const featuresWithIcons = [
  { ...feasibilityConfig, icon: Calculator },
  { ...forecastingConfig, icon: ChartLine },
  { ...swotConfig, icon: ChartPie },
  { ...canvasConfig, icon: Layers },
  ...comingSoonFeatures
];

export const analysisFeatures = featuresWithIcons;
