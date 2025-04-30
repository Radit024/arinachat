
// Feature configuration for Business Model Canvas
export const canvasConfig = {
  id: 'canvas',
  name: 'Business Model Canvas',
  description: 'Interactive tool to design and refine your business model visually',
  implemented: true,
  fields: [
    { name: 'businessName', label: 'Business Name', type: 'text', placeholder: 'Enter business name' },
    { name: 'keyPartners', label: '1. Key Partners', type: 'textarea', placeholder: 'Who are your key partners and suppliers? Which key resources are you acquiring from them? Which key activities do they perform?' },
    { name: 'keyActivities', label: '2. Key Activities', type: 'textarea', placeholder: 'What key activities does your value proposition require? Your distribution channels? Customer relationships? Revenue streams?' },
    { name: 'valueProposition', label: '3. Value Propositions', type: 'textarea', placeholder: 'What value do you deliver to the customer? Which of your customer\'s problems are you helping to solve? What bundles of products and services are you offering to each segment?' },
    { name: 'customerRelationships', label: '4. Customer Relationships', type: 'textarea', placeholder: 'What type of relationship does each of your customer segments expect you to establish and maintain with them?' },
    { name: 'customerSegments', label: '5. Customer Segments', type: 'textarea', placeholder: 'For whom are you creating value? Who are your most important customers?' },
    { name: 'keyResources', label: '6. Key Resources', type: 'textarea', placeholder: 'What key resources does your value proposition require? Your distribution channels? Customer relationships? Revenue streams?' },
    { name: 'channels', label: '7. Channels', type: 'textarea', placeholder: 'Through which channels do your customer segments want to be reached? How are you reaching them now? How are your channels integrated?' },
    { name: 'costStructure', label: '8. Cost Structure', type: 'textarea', placeholder: 'What are the most important costs inherent in your business model? Which key resources are most expensive? Which key activities are most expensive?' },
    { name: 'revenueStreams', label: '9. Revenue Streams', type: 'textarea', placeholder: 'For what value are your customers really willing to pay? How are they currently paying? How would they prefer to pay? How much does each revenue stream contribute to overall revenues?' }
  ],
  calculation: (inputs: Record<string, any>) => {
    // Calculate completeness score for Business Model Canvas
    const fields = ['keyPartners', 'keyActivities', 'valueProposition', 'customerRelationships', 
                   'customerSegments', 'keyResources', 'channels', 'costStructure', 'revenueStreams'];
    
    let totalScore = 0;
    let filledSections = 0;
    
    // Count filled sections and calculate average length
    for (const field of fields) {
      if (inputs[field] && inputs[field].length > 0) {
        filledSections++;
        totalScore += Math.min(100, inputs[field].length / 5);
      }
    }
    
    const completionScore = (filledSections / fields.length) * 100;
    const avgScore = filledSections > 0 ? totalScore / filledSections : 0;
    
    // Create chart data for visualization
    const chartData = fields.map(field => {
      const value = inputs[field] ? Math.min(100, inputs[field].length / 5) : 0;
      const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      return {
        name: label,
        value: value
      };
    });
    
    return {
      score: Math.round(completionScore),
      metrics: [
        { name: 'Completion', value: `${Math.round(completionScore)}%` },
        { name: 'Sections Filled', value: `${filledSections}/${fields.length}` },
        { name: 'Average Detail', value: `${Math.round(avgScore)}%` }
      ],
      chartData: chartData
    };
  }
};
