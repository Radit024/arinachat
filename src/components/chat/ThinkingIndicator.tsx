
import React from 'react';
import { Avatar } from '@/components/ui/avatar';

const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex flex-col items-start mb-6 max-w-3xl mx-auto">
      <div className="flex items-center mb-1">
        <span className="font-medium text-sm">Arina</span>
      </div>
      <div className="flex items-start gap-2">
        <Avatar className="w-8 h-8 bg-green-200 mt-1">
          <span className="text-green-800 font-semibold">A</span>
        </Avatar>
        <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <span>Thinking</span>
            <span className="inline-flex">
              <span className="animate-pulse-ellipsis delay-0">.</span>
              <span className="animate-pulse-ellipsis delay-300">.</span>
              <span className="animate-pulse-ellipsis delay-600">.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
