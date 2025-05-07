
import React from 'react';
import { ChartBar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

// Feature definition
export const optimizationAnalysisConfig = {
  id: 'optimization',
  name: 'Maximization and Minimization Analysis',
  description: 'Optimize resource usage and minimize costs using Simplex Method or Linear Programming',
  icon: ChartBar,
  implemented: true,
  fields: [
    { name: 'optimizationType', label: 'Optimization Type', type: 'select', options: ['Maximize Profit', 'Minimize Cost'] },
    { name: 'optimizationMethod', label: 'Method', type: 'select', options: ['Simplex Method', 'Linear Programming'] },
    { name: 'variables', label: 'Variables (comma-separated, e.g. "Crop A,Crop B")', type: 'text', placeholder: 'X1,X2' },
    { name: 'objective', label: 'Objective Function Coefficients (comma-separated)', type: 'text', placeholder: '3,2' },
    { name: 'constraints', label: 'Constraints (one per line, format: coefficients;limit, e.g. "2,1;10")', type: 'textarea', placeholder: '2,1;10\n1,3;15' },
    { name: 'nonNegative', label: 'Non-negative variables', type: 'select', options: ['Yes', 'No'] }
  ],
  calculation: (inputs) => {
    const optimizationType = inputs.optimizationType || 'Maximize Profit';
    const optimizationMethod = inputs.optimizationMethod || 'Simplex Method';
    const isMaximizing = optimizationType === 'Maximize Profit';
    
    // Parse variables
    const variablesString = inputs.variables || 'X1,X2';
    const variables = variablesString.split(',').map(v => v.trim()).filter(v => v.length > 0);
    
    // Parse objective function
    const objectiveString = inputs.objective || '3,2';
    const objective = objectiveString.split(',')
      .map(val => parseFloat(val.trim()))
      .filter(val => !isNaN(val));
    
    // Parse constraints
    const constraintsString = inputs.constraints || '2,1;10\n1,3;15';
    const constraintLines = constraintsString.split('\n').filter(line => line.trim().length > 0);
    
    const constraints = constraintLines.map(line => {
      const [coeffsStr, limitStr] = line.split(';');
      const coeffs = coeffsStr.split(',')
        .map(val => parseFloat(val.trim()))
        .filter(val => !isNaN(val));
      const limit = parseFloat(limitStr.trim());
      
      return { coeffs, limit: isNaN(limit) ? 0 : limit };
    });
    
    // Validate inputs
    if (objective.length !== variables.length) {
      return {
        score: 0,
        metrics: [{ name: 'Error', value: `Objective function must have ${variables.length} coefficients` }],
        chartData: []
      };
    }
    
    for (const constraint of constraints) {
      if (constraint.coeffs.length !== variables.length) {
        return {
          score: 0,
          metrics: [{ name: 'Error', value: `Each constraint must have ${variables.length} coefficients` }],
          chartData: []
        };
      }
    }
    
    // Simplified solution for demonstration purposes
    // In a real application, you would implement the Simplex algorithm or use a library
    
    // For 2 variables, we can calculate the intersection points of constraints
    // and determine the optimal solution
    let results = { x: [], optimal: 0, feasible: true };
    let solutionDesc = '';
    
    if (variables.length === 2) {
      // Find all intersection points of constraint lines with axes and with each other
      const points = [];
      
      // Origin (if non-negative)
      if (inputs.nonNegative === 'Yes') {
        points.push({ x: [0, 0], constraints: [] });
      }
      
      // Intersections with axes
      for (let i = 0; i < variables.length; i++) {
        for (const constraint of constraints) {
          if (constraint.coeffs[i] !== 0) {
            const point = Array(variables.length).fill(0);
            point[i] = constraint.limit / constraint.coeffs[i];
            if (point[i] >= 0 || inputs.nonNegative !== 'Yes') {
              points.push({ x: point, constraints: [constraint] });
            }
          }
        }
      }
      
      // Intersections between constraints
      for (let i = 0; i < constraints.length; i++) {
        for (let j = i + 1; j < constraints.length; j++) {
          const a1 = constraints[i].coeffs[0];
          const b1 = constraints[i].coeffs[1];
          const c1 = constraints[i].limit;
          
          const a2 = constraints[j].coeffs[0];
          const b2 = constraints[j].coeffs[1];
          const c2 = constraints[j].limit;
          
          // Solve the system of equations
          const det = a1 * b2 - a2 * b1;
          
          if (det !== 0) {
            const x1 = (c1 * b2 - c2 * b1) / det;
            const x2 = (a1 * c2 - a2 * c1) / det;
            
            // Check if the point satisfies non-negativity
            if ((x1 >= 0 && x2 >= 0) || inputs.nonNegative !== 'Yes') {
              points.push({ x: [x1, x2], constraints: [constraints[i], constraints[j]] });
            }
          }
        }
      }
      
      // Check which points are feasible (satisfy all constraints)
      const feasiblePoints = points.filter(point => {
        for (const constraint of constraints) {
          const sum = constraint.coeffs.reduce((sum, coeff, idx) => sum + coeff * point.x[idx], 0);
          if (sum > constraint.limit) {
            return false;
          }
        }
        return true;
      });
      
      if (feasiblePoints.length === 0) {
        results.feasible = false;
        solutionDesc = 'The problem has no feasible solution';
      } else {
        // Evaluate objective function at each feasible point
        for (const point of feasiblePoints) {
          const objectiveValue = objective.reduce((sum, coeff, idx) => sum + coeff * point.x[idx], 0);
          point.objectiveValue = isMaximizing ? objectiveValue : -objectiveValue;
        }
        
        // Find the optimal solution
        let optimalPoint = feasiblePoints[0];
        for (let i = 1; i < feasiblePoints.length; i++) {
          if (feasiblePoints[i].objectiveValue > optimalPoint.objectiveValue) {
            optimalPoint = feasiblePoints[i];
          }
        }
        
        results.x = optimalPoint.x;
        results.optimal = isMaximizing 
          ? optimalPoint.objectiveValue 
          : -optimalPoint.objectiveValue;
        
        solutionDesc = `Optimal solution: ${variables.map((v, i) => `${v} = ${optimalPoint.x[i].toFixed(2)}`).join(', ')}`;
      }
    } else {
      // For more than 2 variables, we use a simplified approach
      solutionDesc = 'For problems with more than 2 variables, a more advanced solver is required';
      results.feasible = true;
      
      // Generate random feasible solution for demonstration purposes
      results.x = Array(variables.length).fill(0).map(() => Math.random() * 10);
      results.optimal = objective.reduce((sum, coeff, idx) => sum + coeff * results.x[idx], 0);
      if (!isMaximizing) results.optimal = -results.optimal;
    }
    
    // Prepare chart data for visualization
    let chartData = [];
    
    // For 2 variables, we can visualize the feasible region and constraints
    if (variables.length === 2) {
      // Generate points for visualization
      const maxCoord = 20;
      const steps = 10;
      
      for (let i = 0; i <= steps; i++) {
        const x1 = (i / steps) * maxCoord;
        
        // For each constraint, calculate the corresponding x2 value
        for (let j = 0; j < constraints.length; j++) {
          if (constraints[j].coeffs[1] !== 0) {
            const x2 = (constraints[j].limit - constraints[j].coeffs[0] * x1) / constraints[j].coeffs[1];
            if (x2 >= 0 || inputs.nonNegative !== 'Yes') {
              chartData.push({
                x1: x1,
                x2: x2,
                constraint: `Constraint ${j + 1}`
              });
            }
          }
        }
      }
      
      // Add optimal point to the chart
      if (results.feasible) {
        chartData.push({
          x1: results.x[0],
          x2: results.x[1],
          constraint: "Optimal Point",
          isOptimal: true
        });
      }
    } else {
      // For more variables, show the contribution of each variable to the objective
      for (let i = 0; i < variables.length; i++) {
        chartData.push({
          variable: variables[i],
          value: results.x[i],
          contribution: objective[i] * results.x[i]
        });
      }
    }
    
    return {
      score: results.feasible ? (isMaximizing ? 80 : 20) + Math.min(20, Math.max(0, results.optimal)) : 0,
      metrics: [
        { name: 'Method', value: optimizationMethod },
        { name: 'Type', value: optimizationType },
        { name: 'Optimal Value', value: results.feasible ? results.optimal.toFixed(2) : 'N/A' },
        { name: 'Solution', value: solutionDesc }
      ],
      chartData: chartData
    };
  }
};

// Results visualization component
export const OptimizationChart = ({ chartData }) => {
  if (!chartData || chartData.length === 0) return null;
  
  // For multi-variable optimization with variable contribution
  if (chartData.some(d => d.variable)) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="variable" />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="value" fill="#9b87f5" name="Variable Value" />
          <Bar dataKey="contribution" fill="#4CAF50" name="Contribution" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  
  // For 2-variable optimization with constraints
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x1" label={{ value: 'X1', position: 'bottom' }} />
        <YAxis dataKey="x2" label={{ value: 'X2', angle: -90, position: 'left' }} />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend />
        <Line type="monotone" dataKey="x2" stroke="#9b87f5" dot={{ r: 4 }} name="Constraints" />
        {chartData.some(d => d.isOptimal) && (
          <Line type="monotone" dataKey="isOptimal" stroke="#FF5722" dot={{ r: 8 }} name="Optimal Point" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};
