import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from 'motion/react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContentTextOnlyProps {
  title?: string;
  text?: string[];
  onComplete?: () => void;
  buttonText?: string;
  secondaryAction?: {
    text: string;
    onClick: () => Promise<void> | void;
    variant?: 'default' | 'secondary' | 'outline';
    successText?: string;
  };
  animationConfig?: {
    enabled: boolean;
    duration: number;
    pause: number;
  };
  className?: string;
}

export function ContentTextOnly({
  title,
  text = [],
  onComplete,
  buttonText,
  secondaryAction,
  animationConfig = {
    enabled: true,
    duration: 1000,
    pause: 1000
  },
  className
}: ContentTextOnlyProps) {
  // Initialize state with current text length
  const [animationState, setAnimationState] = useState({
    visibleLines: new Array(text.length).fill(!animationConfig.enabled),
    showButton: !animationConfig.enabled,
    isAnimating: false
  });

  // Add state for secondary action
  const [secondaryActionState, setSecondaryActionState] = useState({
    isLoading: false,
    isSuccess: false
  });

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const prevTextLengthRef = useRef(text.length);
  const isFirstRenderRef = useRef(true);

  // Cleanup function
  const cleanup = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // Reset success state after delay
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (secondaryActionState.isSuccess) {
      timeout = setTimeout(() => {
        setSecondaryActionState(prev => ({ ...prev, isSuccess: false }));
      }, 2000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [secondaryActionState.isSuccess]);

  // Handle text content changes and initial animation
  useEffect(() => {
    // Always run on first render or when text length changes
    if (isFirstRenderRef.current || prevTextLengthRef.current !== text.length) {
      cleanup();
      prevTextLengthRef.current = text.length;
      
      if (!animationConfig.enabled) {
        setAnimationState({
          visibleLines: new Array(text.length).fill(true),
          showButton: true,
          isAnimating: false
        });
      } else {
        setAnimationState({
          visibleLines: new Array(text.length).fill(false),
          showButton: false,
          isAnimating: true
        });
      }
      
      isFirstRenderRef.current = false;
    }
  }, [text.length, animationConfig.enabled, cleanup]);

  // Handle animation
  useEffect(() => {
    if (!animationState.isAnimating) return;

    // Function to show each line
    const showLine = (index: number) => {
      if (!animationState.isAnimating) return;

      setAnimationState(prev => ({
        ...prev,
        visibleLines: prev.visibleLines.map((v, i) => i === index ? true : v)
      }));

      if (index < text.length - 1) {
        const timeout = setTimeout(
          () => showLine(index + 1),
          animationConfig.duration + animationConfig.pause
        );
        timeoutsRef.current.push(timeout);
      } else {
        const buttonTimeout = setTimeout(() => {
          setAnimationState(prev => ({
            ...prev,
            showButton: true,
            isAnimating: false
          }));
        }, animationConfig.duration);
        timeoutsRef.current.push(buttonTimeout);
      }
    };

    // Start animation sequence
    const initialDelay = setTimeout(() => showLine(0), 200);
    timeoutsRef.current.push(initialDelay);

    return cleanup;
  }, [animationState.isAnimating, text.length, animationConfig.duration, animationConfig.pause, cleanup]);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (!animationConfig.enabled || !animationState.isAnimating) return;
    
    cleanup();
    setAnimationState({
      visibleLines: new Array(text.length).fill(true),
      showButton: true,
      isAnimating: false
    });
  }, [animationConfig.enabled, text.length, cleanup, animationState.isAnimating]);

  // Render buttons
  const renderButtons = () => {
    if (!onComplete && !secondaryAction) return null;

    return (
      <motion.div
        key="buttons"
        initial={{ opacity: 0 }}
        animate={{ opacity: animationState.showButton ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 flex gap-4 justify-center"
      >
        {secondaryAction && (
          <div className="w-[180px]">
            <Button
              onClick={async (e) => {
                e.stopPropagation();
                setSecondaryActionState({ isLoading: true, isSuccess: false });
                try {
                  await secondaryAction.onClick();
                  setSecondaryActionState({ isLoading: false, isSuccess: true });
                } catch {
                  setSecondaryActionState({ isLoading: false, isSuccess: false });
                }
              }}
              size="lg"
              variant={secondaryAction.variant || 'secondary'}
              disabled={secondaryActionState.isLoading}
              className="w-full"
            >
              {secondaryActionState.isSuccess 
                ? (secondaryAction.successText || 'Copied!') 
                : secondaryAction.text}
            </Button>
          </div>
        )}
        {onComplete && buttonText && (
          <div className="w-[180px]">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              size="lg"
              className="w-full"
            >
              {buttonText}
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div 
      className={cn(
        "flex-1 flex flex-col items-center min-h-0 py-8 min-[801px]:justify-center max-[800px]:mt-6",
        className
      )}
      onClick={handleSkip}
    >
      <div className="w-full max-w-2xl text-center">
        {title && (
          <motion.h2
            key="title"
            initial={{ opacity: 0.4 }}
            animate={{ 
              opacity: text.length === 0 && animationConfig.enabled ? [0.4, 1, 0.4] : 1 
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: {
                duration: text.length === 0 ? 2 : animationConfig.duration / 1000,
                ease: "easeInOut",
                repeat: text.length === 0 ? Number.POSITIVE_INFINITY : 0,
                repeatType: "reverse"
              }
            }}
            className="text-2xl font-bold tracking-tight mb-8"
          >
            {title}
          </motion.h2>
        )}

        <div className="space-y-6">
          {text.map((line, index) => (
            <motion.p
              key={`line-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: animationState.visibleLines[index] ? 1 : 0 }}
              transition={{
                duration: animationConfig.duration / 1000,
                ease: "easeOut"
              }}
              className="text-base font-medium tracking-tight text-pretty"
            >
              {line}
            </motion.p>
          ))}
        </div>

        {renderButtons()}
      </div>
    </div>
  );
} 