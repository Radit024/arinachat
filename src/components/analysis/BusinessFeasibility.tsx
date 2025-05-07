
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

// Feature definition
export const businessFeasibilityConfig = {
  id: 'feasibility',
  name: 'Business Feasibility Analysis',
  description: 'Analyze investment costs, operational costs, and potential returns to determine business viability',
  icon: Calculator,
  implemented: true,
  fields: [
    { name: 'investmentCost', label: 'Investment Cost (Biaya Investasi)', type: 'number', placeholder: '0' },
    { name: 'operationalCost', label: 'Operational Cost per Month (Biaya Operasional per Bulan)', type: 'number', placeholder: '0' },
    { name: 'productionCostPerUnit', label: 'Production Cost per Unit (Biaya Produksi per Unit)', type: 'number', placeholder: '0' },
    { name: 'salesVolumePerMonth', label: 'Sales Volume per Month (Volume Penjualan per Bulan)', type: 'number', placeholder: '0' },
    { name: 'markup', label: 'Markup (%)', type: 'number', placeholder: '0' }
  ],
  calculation: (inputs) => {
    // Parse input values
    const investmentCost = parseFloat(inputs.investmentCost) || 0;
    const operationalCost = parseFloat(inputs.operationalCost) || 0;
    const productionCostPerUnit = parseFloat(inputs.productionCostPerUnit) || 0;
    const salesVolumePerMonth = parseFloat(inputs.salesVolumePerMonth) || 0;
    const markup = parseFloat(inputs.markup) || 0;
    
    // Calculate base production cost per unit (HPP)
    const hpp = productionCostPerUnit;
    
    // Calculate selling price per unit
    const sellingPrice = hpp * (1 + markup/100);
    
    // Calculate monthly revenue
    const revenue = sellingPrice * salesVolumePerMonth;
    
    // Calculate monthly profit
    const monthlyProfit = revenue - (operationalCost + (productionCostPerUnit * salesVolumePerMonth));
    
    // Calculate annual profit
    const annualProfit = monthlyProfit * 12;
    
    // Calculate ROI
    const roi = investmentCost > 0 ? (annualProfit / investmentCost) * 100 : 0;
    
    // Calculate Break Even Point (BEP) in units
    const fixedCosts = operationalCost;
    const contributionMargin = sellingPrice - productionCostPerUnit;
    const bepUnits = contributionMargin > 0 ? fixedCosts / contributionMargin : 0;
    
    // Calculate Payback Period (in months)
    const paybackPeriod = monthlyProfit > 0 ? investmentCost / monthlyProfit : 0;
    
    // Calculate Profit Margin
    const profitMargin = revenue > 0 ? (monthlyProfit / revenue) * 100 : 0;
    
    // Calculate feasibility score (0-100)
    let feasibilityScore = 0;
    if (roi > 0) feasibilityScore += 20;
    if (roi > 20) feasibilityScore += 15;
    if (paybackPeriod < 24) feasibilityScore += 20;
    if (paybackPeriod < 12) feasibilityScore += 15;
    if (profitMargin > 10) feasibilityScore += 15;
    if (monthlyProfit > operationalCost) feasibilityScore += 15;
    
    return {
      score: feasibilityScore,
      metrics: [
        { name: 'Production Cost (HPP) per Unit', value: hpp.toFixed(2) },
        { name: 'Selling Price per Unit', value: sellingPrice.toFixed(2) },
        { name: 'Revenue (Monthly)', value: revenue.toFixed(2) },
        { name: 'Profit (Monthly)', value: monthlyProfit.toFixed(2) },
        { name: 'ROI (Return on Investment)', value: roi.toFixed(2) + '%' },
        { name: 'BEP (Break Even Point)', value: bepUnits.toFixed(2) + ' units' },
        { name: 'Payback Period', value: paybackPeriod.toFixed(2) + ' months' },
        { name: 'Profit Margin', value: profitMargin.toFixed(2) + '%' }
      ],
      chartData: [
        { name: 'Investment', value: investmentCost },
        { name: 'Monthly Operational Cost', value: operationalCost },
        { name: 'Monthly Production Cost', value: productionCostPerUnit * salesVolumePerMonth },
        { name: 'Monthly Revenue', value: revenue },
        { name: 'Monthly Profit', value: monthlyProfit }
      ]
    };
  }
};

// Results visualization component
export const BusinessFeasibilityChart = ({ chartData }) => {
  if (!chartData) return null;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        <Bar dataKey="value" fill="#9b87f5" />
      </BarChart>
    </ResponsiveContainer>
  );
};
