
// Feature configuration for Business Feasibility Analysis
export const feasibilityConfig = {
  id: 'feasibility',
  name: 'Business Feasibility Analysis',
  description: 'Analyze market conditions, costs, and potential returns to determine business viability',
  implemented: true,
  fields: [
    { name: 'businessName', label: 'Business Name', type: 'text', placeholder: 'Enter business name' },
    { name: 'industry', label: 'Industry', type: 'text', placeholder: 'Enter industry' },
    { name: 'initialInvestment', label: 'Initial Investment ($)', type: 'number', placeholder: '0' },
    { name: 'monthlyExpenses', label: 'Monthly Expenses ($)', type: 'number', placeholder: '0' },
    { name: 'expectedRevenue', label: 'Expected Annual Revenue ($)', type: 'number', placeholder: '0' },
    { name: 'targetMarketSize', label: 'Target Market Size', type: 'text', placeholder: 'Enter market size' },
    { name: 'growthRate', label: 'Expected Annual Growth Rate (%)', type: 'number', placeholder: '0' },
    { name: 'breakEvenPeriod', label: 'Expected Break-even Period (months)', type: 'number', placeholder: '0' }
  ],
  calculation: (inputs: Record<string, any>) => {
    // Simple feasibility calculation algorithm
    const initialInvestment = parseFloat(inputs.initialInvestment) || 0;
    const monthlyExpenses = parseFloat(inputs.monthlyExpenses) || 0;
    const expectedRevenue = parseFloat(inputs.expectedRevenue) || 0;
    const growthRate = parseFloat(inputs.growthRate) || 0;
    const breakEvenPeriod = parseFloat(inputs.breakEvenPeriod) || 12;
    
    const annualExpenses = monthlyExpenses * 12;
    const profit = expectedRevenue - annualExpenses;
    const roi = initialInvestment > 0 ? (profit / initialInvestment) * 100 : 0;
    const paybackPeriod = profit > 0 ? initialInvestment / profit : 0;
    
    // Calculate feasibility score (0-100)
    let feasibilityScore = 0;
    if (profit > 0) feasibilityScore += 30;
    if (roi > 15) feasibilityScore += 20;
    if (paybackPeriod < 2) feasibilityScore += 20;
    if (growthRate > 5) feasibilityScore += 15;
    if (breakEvenPeriod < 18) feasibilityScore += 15;
    
    return {
      score: feasibilityScore,
      metrics: [
        { name: 'Profit Margin', value: profit > 0 ? (profit / expectedRevenue * 100).toFixed(2) + '%' : '0%' },
        { name: 'ROI', value: roi.toFixed(2) + '%' },
        { name: 'Payback Period', value: paybackPeriod.toFixed(2) + ' years' },
        { name: 'Break-even', value: breakEvenPeriod + ' months' }
      ],
      chartData: [
        { name: 'Initial Investment', value: initialInvestment },
        { name: 'Annual Expenses', value: annualExpenses },
        { name: 'Expected Revenue', value: expectedRevenue },
        { name: 'Profit', value: profit > 0 ? profit : 0 }
      ]
    };
  }
};
