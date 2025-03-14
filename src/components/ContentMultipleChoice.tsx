import React from "react";

// Define the option type for type safety
export interface Option {
  id: number;
  label: string;
  description: string;
}

interface ContentMultipleChoiceProps {
  question: string;
  options: Option[];
  selectedOption: Option | null;
  onSelect: (option: Option) => void;
}

export function ContentMultipleChoice({ 
  question, 
  options, 
  selectedOption, 
  onSelect 
}: ContentMultipleChoiceProps) {
  return (
    <div className="flex flex-col h-full justify-center mt-6 md:mt-0">
      <h2 className="text-2xl font-bold tracking-tight mb-8">{question}</h2>
      
      {/* Grid of buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => (
          <button 
            key={option.id} 
            className={`flex items-stretch border text-left transition-all duration-200 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer ${
              selectedOption?.id === option.id 
                ? 'border-primary bg-secondary/20' 
                : 'border-gray-400'
            }`}
            onClick={() => onSelect(option)}
            aria-selected={selectedOption?.id === option.id}
          >
            <div className={`flex items-center justify-center min-h-full w-14 font-medium border-r text-lg ${
              selectedOption?.id === option.id 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {option.label}
            </div>
            <span className="text-black font-medium font-base p-4 flex-1">{option.description}</span>
          </button>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 mt-8 text-left hidden md:block">
        {options.length > 0 
          ? `Use number keys (1-${Math.min(options.length, 9)}) to make a selection`
          : "No options available"}
      </div>
    </div>
  );
} 