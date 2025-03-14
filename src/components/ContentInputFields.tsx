import React, { useRef, useEffect, KeyboardEvent, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ContentInputFieldsProps {
  question: string;
  onSubmit: (values: [string, string]) => void;
  initialValues?: [string, string];
  firstFieldLabel?: string;
  secondFieldLabel?: string;
  buttonText?: string;
}

export function ContentInputFields({
  question,
  onSubmit,
  initialValues = ["", ""],
  firstFieldLabel = "Field 1",
  secondFieldLabel = "Field 2",
  buttonText = "Next"
}: ContentInputFieldsProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);
  const [firstValue, setFirstValue] = useState<string>(initialValues[0]);
  const [secondValue, setSecondValue] = useState<string>(initialValues[1]);
  const [errors, setErrors] = useState<[boolean, boolean]>([false, false]);

  // Auto-focus the first input field on component mount
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const validateFields = (): boolean => {
    const firstEmpty = firstValue.trim() === '';
    const secondEmpty = secondValue.trim() === '';
    setErrors([firstEmpty, secondEmpty]);
    return !firstEmpty && !secondEmpty;
  };

  const handleAdvance = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (validateFields()) {
      onSubmit([firstValue, secondValue]);
    } else {
      // Focus the first empty field
      if (errors[0] && firstInputRef.current) {
        firstInputRef.current.focus();
      } else if (errors[1] && secondInputRef.current) {
        secondInputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, isFirstField: boolean) => {
    // Clear error state when typing
    if (isFirstField) {
      setErrors([false, errors[1]]);
    } else {
      setErrors([errors[0], false]);
    }

    // If Enter is pressed in the first field, move focus to the second field
    if (e.key === "Enter" && isFirstField && secondInputRef.current) {
      e.preventDefault();
      
      // Validate first field before moving to second
      if (firstValue.trim() === '') {
        setErrors([true, errors[1]]);
      } else {
        secondInputRef.current.focus();
      }
    } 
    // If Enter is pressed in the second field, advance to the next screen
    else if (e.key === "Enter" && !isFirstField) {
      e.preventDefault();
      handleAdvance();
    }
  };

  return (
    <div className="flex flex-col h-full justify-center mt-6 md:mt-0">
      <h2 className="text-2xl font-bold tracking-tight mb-8">{question}</h2>
      
      <form onSubmit={handleAdvance} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className={`flex items-stretch border transition-all duration-200 ${
            errors[0] 
              ? 'border-red-500' 
              : 'border-gray-400 hover:border-primary focus-within:border-primary'
          }`}>
            <div className={`flex items-center px-4 min-h-full w-auto sm:w-[160px] font-medium border-r text-base ${
              errors[0]
                ? 'bg-red-50 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {firstFieldLabel}
            </div>
            <div className="flex-1">
              <Input
                id="first-field"
                ref={firstInputRef}
                type="text"
                value={firstValue}
                onChange={(e) => {
                  setFirstValue(e.target.value);
                  if (e.target.value.trim() !== '') {
                    setErrors([false, errors[1]]);
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, true)}
                className={`border-0 rounded-none shadow-none h-full p-5 text-black font-medium focus-visible:ring-0 focus-visible:border-0 ${
                  errors[0] ? 'bg-red-50' : ''
                }`}
                aria-invalid={errors[0]}
                required
              />
            </div>
          </div>
          
          <div className={`flex items-stretch border transition-all duration-200 ${
            errors[1] 
              ? 'border-red-500' 
              : 'border-gray-400 hover:border-primary focus-within:border-primary'
          }`}>
            <div className={`flex items-center px-4 min-h-full w-auto sm:w-[160px] font-medium border-r text-base ${
              errors[1]
                ? 'bg-red-50 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {secondFieldLabel}
            </div>
            <div className="flex-1">
              <Input
                id="second-field"
                ref={secondInputRef}
                type="text"
                value={secondValue}
                onChange={(e) => {
                  setSecondValue(e.target.value);
                  if (e.target.value.trim() !== '') {
                    setErrors([errors[0], false]);
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, false)}
                className={`border-0 rounded-none shadow-none h-full p-5 text-black font-medium focus-visible:ring-0 focus-visible:border-0 ${
                  errors[1] ? 'bg-red-50' : ''
                }`}
                aria-invalid={errors[1]}
                required
              />
            </div>
          </div>
          
          {(errors[0] || errors[1]) && (
            <div className="text-red-500 text-sm mt-1">
              Please fill out all fields. That’s 10 points off.
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-end mt-6">
          <div className="text-xs text-gray-500 mr-4">
            Press <kbd className="px-2 py-1 text-xs font-mono font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded">ENTER</kbd> to advance
          </div>

          <Button size="lg" type="submit">
            {buttonText}
          </Button>
        </div>
      </form>
    </div>
  );
} 