
import React from 'react';

const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1 text-gray-600 italic p-2">
      <span>Arina is thinking</span>
      <span className="inline-flex">
        <span className="animate-pulse-ellipsis delay-0">.</span>
        <span className="animate-pulse-ellipsis delay-300">.</span>
        <span className="animate-pulse-ellipsis delay-600">.</span>
      </span>
    </div>
  );
};

export default ThinkingIndicator;
