"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ContentPageTemplate } from "@/components/ContentPageTemplate";
import { ContentMultipleChoice, Option } from "@/components/ContentMultipleChoice";
import { ContentInputFields } from "@/components/ContentInputFields";
import { ContentTextOnly } from "@/components/ContentTextOnly";
import { SlideTransition } from "@/components/SlideTransition";
import contentData from "@/content.json";
import { useRouter } from "next/navigation";
import { motion } from 'motion/react';
import { useUserStore } from '@/lib/store';

// Define types for our content structure
interface Slide {
  order: number;
  title: string;
  type: "inputFields" | "multipleChoice" | "textOnly";
  options: string[];
}

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
  
  // State to store user responses
  const [responses, setResponses] = useState<Record<number, string | string[]>>({});
  
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
  
  // State for multiple choice selection
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  
  // State for loading
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Handle completion and navigation
  const handleCompletion = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Get the name from responses[1] which contains [firstName, lastName]
      const nameResponse = responses[1] as [string, string];
      const [firstName, lastName] = nameResponse || ['', ''];
      
      // Store user info in the global store
      useUserStore.getState().setUserInfo(firstName, lastName);
      
      // Navigate to results page
      router.push('/splendid');
    } catch (error) {
      console.error("Error submitting responses:", error);
      setIsLoading(false);
    }
  }, [router, responses]);
  
  // Handle advancing to the next slide
  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setDirection("left");
      setTransitionType(currentSlideIndex === -1 ? "fade" : "slide");
      setCurrentSlideIndex(currentSlideIndex + 1);
      setSelectedOption(null);
    } else {
      // Set fade transition and reset direction for loading state
      setDirection("left"); // Reset direction to prevent slide animation
      setTransitionType("fade");
      handleCompletion();
    }
  }, [currentSlideIndex, slides.length, handleCompletion]);
  
  // Handle going back to the previous slide
  const goToPrevSlide = useCallback(() => {
    if (currentSlideIndex > -1) { // Allow going back to intro slide
      setDirection("right");
      // Use fade transition when going back to intro slide, slide transition otherwise
      setTransitionType(currentSlideIndex === 0 ? "fade" : "slide");
      setCurrentSlideIndex(currentSlideIndex - 1);
      setSelectedOption(null); // Reset selection for previous slide
    }
  }, [currentSlideIndex]);
  
  // Handle multiple choice selection
  const handleMultipleChoiceSelect = useCallback((option: Option) => {
    if (!currentSlide) return;
    
    setSelectedOption(option);
    setResponses(prev => ({
      ...prev,
      [currentSlide.order]: option.description
    }));
    
    // Check if this is the last slide before starting the transition
    if (currentSlideIndex === slides.length - 1) {
      setTransitionType("fade");
    }
    
    // Advance to next slide after a short delay
    setTimeout(goToNextSlide, 500);
  }, [currentSlide, goToNextSlide, currentSlideIndex, slides.length]);
  
  // Handle input fields submission
  const handleInputFieldsSubmit = useCallback((values: [string, string]) => {
    if (!currentSlide) return;
    
    setResponses(prev => ({
      ...prev,
      [currentSlide.order]: values
    }));
    
    // Check if this is the last slide before starting the transition
    if (currentSlideIndex === slides.length - 1) {
      setTransitionType("fade");
    }
    
    goToNextSlide();
  }, [currentSlide, goToNextSlide, currentSlideIndex, slides.length]);
  
  // Handle keyboard navigation for multiple choice
  useEffect(() => {
    if (currentSlide?.type !== "multipleChoice") return;
    
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      
      // Check if the key pressed is a number within the range of options
      if (/^[1-9]$/.test(key)) {
        const optionIndex = parseInt(key) - 1;
        if (optionIndex < currentSlide.options.length) {
          const option: Option = {
            id: optionIndex + 1,
            label: String(optionIndex + 1),
            description: currentSlide.options[optionIndex]
          };
          handleMultipleChoiceSelect(option);
        }
      }
      
      // Remove arrow key navigation
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyPress);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentSlide, handleMultipleChoiceSelect]);
  
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
            selectedOption={selectedOption}
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