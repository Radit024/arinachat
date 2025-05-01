
// Feature configuration for SWOT Analysis
export const swotConfig = {
  id: 'swot',
  name: 'SWOT Analysis',
  description: 'Identify Strengths, Weaknesses, Opportunities, and Threats to your business',
  implemented: true,
  fields: [
    { name: 'businessName', label: 'Business or Project Name', type: 'text', placeholder: 'Enter the name of your business or project' },
    { name: 'strengths', label: 'Strengths', type: 'textarea', placeholder: 'List your business strengths here' },
    { name: 'weaknesses', label: 'Weaknesses', type: 'textarea', placeholder: 'List your business weaknesses here' },
    { name: 'opportunities', label: 'Opportunities', type: 'textarea', placeholder: 'List your business opportunities here' },
    { name: 'threats', label: 'Threats', type: 'textarea', placeholder: 'List your business threats here' }
  ],
  calculation: (inputs: Record<string, any>) => {
    // Calculate SWOT score based on text length as a simple metric
    const strengthsLength = (inputs.strengths || '').length;
    const weaknessesLength = (inputs.weaknesses || '').length;
    const opportunitiesLength = (inputs.opportunities || '').length;
    const threatsLength = (inputs.threats || '').length;
    
    // For visualization purposes, normalize lengths to values between 10 and 100
    const normalizeLength = (length: number) => Math.min(100, Math.max(10, length / 10));
    
    const strengthsValue = normalizeLength(strengthsLength);
    const weaknessesValue = normalizeLength(weaknessesLength);
    const opportunitiesValue = normalizeLength(opportunitiesLength);
    const threatsValue = normalizeLength(threatsLength);
    
    // Calculate SWOT balance score
    const totalLength = strengthsLength + weaknessesLength + opportunitiesLength + threatsLength;
    const swotScore = totalLength > 0 ? 
      ((strengthsLength + opportunitiesLength) / totalLength) * 100 : 50;
    
    return {
      score: Math.round(swotScore),
      metrics: [
        { name: 'Strengths', value: inputs.strengths || 'None provided' },
        { name: 'Weaknesses', value: inputs.weaknesses || 'None provided' },
        { name: 'Opportunities', value: inputs.opportunities || 'None provided' },
        { name: 'Threats', value: inputs.threats || 'None provided' }
      ],
      chartData: [
        { name: 'Strengths', value: strengthsValue, fill: '#4CAF50' },
        { name: 'Weaknesses', value: weaknessesValue, fill: '#F44336' },
        { name: 'Opportunities', value: opportunitiesValue, fill: '#2196F3' },
        { name: 'Threats', value: threatsValue, fill: '#FF9800' }
      ]
    };
  }
};
