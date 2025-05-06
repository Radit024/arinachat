
export const analysisFeatures = [
  {
    id: "business-feasibility",
    name: "Business Feasibility Analysis",
    prompt: "Welcome to Business Feasibility Analysis. I will help you evaluate the feasibility of your planned agricultural business. To get started, please provide information about:\n- Type of agricultural business to analyze\n- Available initial capital\n- Estimated operational costs\n- Target market and selling price\n- Other relevant supporting data"
  },
  {
    id: "forecasting",
    name: "Demand Forecasting",
    prompt: "Welcome to Demand Forecasting. I can help you predict future demand using Simple Moving Average (SMA) or Exponential Smoothing methods. To get started, please provide:\n- Historical demand data\n- Time period for forecasting\n- Preferred forecasting method (SMA or Exponential Smoothing)\n- For SMA: number of periods to include in the average\n- For Exponential Smoothing: smoothing factor (0-1)"
  },
  {
    id: "max-min-analysis",
    name: "Maximization and Minimization Analysis",
    prompt: "Welcome to Maximization and Minimization Analysis. I will help you optimize resource usage and minimize costs using Simplex Method or Linear Programming. To get started, please provide information about:\n- Available resources (land, capital, labor)\n- Constraints on resources\n- Objective function (what to maximize or minimize)\n- Preferred method (Simplex or Linear Programming)"
  }
];
