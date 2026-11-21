"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ContentPageTemplate } from "@/components/ContentPageTemplate";
import { ContentMultipleChoice, Option } from "@/components/ContentMultipleChoice";
import { ContentInputFields } from "@/components/ContentInputFields";
import { ContentTextOnly } from "@/components/ContentTextOnly";
import { SlideTransition } from "@/components/SlideTransition";
import contentData from "@/content.json";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { hasCompleteSelections, type InnieSelections } from "@/lib/api-types";

// Define types for our content structure
type Slide = {
  order: number;
  title: string;
  options: string[];
} & (
  | { type: "inputFields" | "textOnly" }
  | { type: "multipleChoice"; selectionKey: keyof InnieSelections }
);

interface ContentData {
  content: {
    slides: Slide[];
  };
}

// Define transition types
type TransitionType = "fade" | "slide";

export default function ObservingPage() {
  const router = useRouter();
  // State to track current slide index
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(-1); // Start at -1 for intro slide
  
  const [name, setName] = useState<[string, string]>(["", ""]);
  const [selections, setSelections] = useState<Partial<InnieSelections>>({});
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // State to track slide transition direction
  const [direction, setDirection] = useState<"left" | "right">("left");
  
  // State to track transition type
  const [transitionType, setTransitionType] = useState<TransitionType>("fade");
  
  // Get the slides from content data
  const slides = (contentData as ContentData).content.slides;
  
  // Define intro text with multiple lines
  const introText = [
    "What I'd like to do is share with you some facts about your Outie.",
    "Because your Outie is an exemplary person, these facts should be very pleasing.",
    "Just relax your body and be open to the facts. Try to enjoy each equally.",
    "To begin, I'll need to ask you a few questions."
  ];
  
  // Get the current slide (could be null if we're on the intro slide)
  const currentSlide = currentSlideIndex >= 0 ? slides[currentSlideIndex] : null;
  
  const [isLoading, setIsLoading] = useState(false);

  const cancelAdvance = useCallback(() => {
    if (advanceTimer.current !== null) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  useEffect(() => cancelAdvance, [cancelAdvance]);

  const advance = useCallback((
    nextName: [string, string],
    nextSelections: Partial<InnieSelections>
  ) => {
    if (currentSlideIndex < slides.length - 1) {
      setDirection("left");
      setTransitionType(currentSlideIndex === -1 ? "fade" : "slide");
      setCurrentSlideIndex(currentSlideIndex + 1);
      return;
    }

    if (!nextName.every(Boolean) || !hasCompleteSelections(nextSelections)) return;

    setIsLoading(true);
    useUserStore.getState().completeQuestionnaire(...nextName, nextSelections);
    router.push("/splendid");
  }, [currentSlideIndex, router, slides.length]);

  const goToNextSlide = useCallback(() => {
    if (isLoading || currentSlide?.type === "inputFields") return;
    if (currentSlide?.type === "multipleChoice" && !selections[currentSlide.selectionKey]) return;
    cancelAdvance();
    advance(name, selections);
  }, [advance, cancelAdvance, currentSlide, isLoading, name, selections]);

  const goToPrevSlide = useCallback(() => {
    if (currentSlideIndex <= -1 || isLoading) return;
    cancelAdvance();
    setDirection("right");
    setTransitionType(currentSlideIndex === 0 ? "fade" : "slide");
    setCurrentSlideIndex(currentSlideIndex - 1);
  }, [cancelAdvance, currentSlideIndex, isLoading]);

  const handleMultipleChoiceSelect = useCallback((option: Option) => {
    if (currentSlide?.type !== "multipleChoice" || isLoading) return;

    // Pass the selected option to the timer so the last answer is not read
    // from the render before setSelections took effect.
    const nextSelections = { ...selections, [currentSlide.selectionKey]: option.description };
    setSelections(nextSelections);
    cancelAdvance();
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      advance(name, nextSelections);
    }, 500);
  }, [advance, cancelAdvance, currentSlide, isLoading, name, selections]);

  const handleInputFieldsSubmit = useCallback((values: [string, string]) => {
    setName(values);
    advance(values, selections);
  }, [advance, selections]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable]")) return;

      if (currentSlide?.type === "multipleChoice" && /^[1-9]$/.test(event.key)) {
        const optionIndex = Number(event.key) - 1;
        const description = currentSlide.options[optionIndex];
        if (description) {
          handleMultipleChoiceSelect({ id: optionIndex + 1, label: event.key, description });
        }
      } else if (event.key === "ArrowLeft") {
        goToPrevSlide();
      } else if (event.key === "ArrowRight" ||
        (event.key === "Enter" && !(event.target instanceof Element && event.target.closest("a, button")))) {
        goToNextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSlide, goToNextSlide, goToPrevSlide, handleMultipleChoiceSelect]);

  // Render the appropriate component based on slide type
  const renderSlide = () => {
    // If we're in loading state
    if (isLoading) {
      return (
        <ContentTextOnly 
          title="Consulting Ms. Casey…"
          animationConfig={{
            enabled: false,
            duration: 1000,
            pause: 1000
          }}
        />
      );
    }

    // If we're on the intro slide (index -1)
    if (currentSlideIndex === -1) {
      // Ensure intro text is ready before showing the component
      if (!introText.length) return null;

      return (
        <ContentTextOnly 
          key="intro-slide" // Ensure clean remount when transitioning back to intro
          text={introText}
          onComplete={goToNextSlide}
          buttonText="Begin"
          animationConfig={{
            enabled: true,
            duration: 1000,
            pause: 1000
          }}
        />
      );
    }
    
    if (!currentSlide) return null;
    
    switch (currentSlide.type) {
      case "textOnly":
        return (
          <ContentTextOnly
            key={`text-slide-${currentSlide.order}`}
            title={currentSlide.title}
            text={currentSlide.options}
            onComplete={goToNextSlide}
            buttonText="Continue"
            animationConfig={{
              enabled: true,
              duration: 1000,
              pause: 1000
            }}
          />
        );

      case "inputFields":
        return (
          <ContentInputFields
            question={currentSlide.title}
            firstFieldLabel={currentSlide.options[0]}
            secondFieldLabel={currentSlide.options[1]}
            initialValues={name}
            onSubmit={handleInputFieldsSubmit}
            buttonText="Next"
          />
        );
        
      case "multipleChoice":
        const options: Option[] = currentSlide.options.map((option, index) => ({
          id: index + 1,
          label: String(index + 1),
          description: option
        }));
        
        return (
          <ContentMultipleChoice
            question={currentSlide.title}
            options={options}
            selectedOption={options.find((option) => option.description === selections[currentSlide.selectionKey]) ?? null}
            onSelect={handleMultipleChoiceSelect}
          />
        );
        
      default:
        return <div>Unknown slide type</div>;
    }
  };
  
  return (
    <ContentPageTemplate>
      <SlideTransition 
        slideKey={isLoading ? "loading" : currentSlideIndex} 
        direction={isLoading ? "left" : direction}
        transitionType={transitionType}
      >
        {renderSlide()}
      </SlideTransition>
    </ContentPageTemplate>
  );
} 