'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ContentTextOnly } from '@/components/ContentTextOnly';
import { ContentPageTemplate } from '@/components/ContentPageTemplate';
import { InnieSelections, createNarrativeFromSelections } from '@/lib/api-types';
import { generateWellnessFacts } from '@/lib/api-client';
import { useUserStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { generateWellnessPNG } from '@/lib/canvas-utils';

export default function SplendidResults() {
  const router = useRouter();
  const { firstName, lastName } = useUserStore();
  const [pageState, setPageState] = useState({
    isLoading: true,
    isReady: false,
    error: null as string | null,
    facts: [] as string[]
  });

  // Add a ref to track if we've already fetched
  const hasFetchedRef = useRef(false);

  // Redirect if no name is set
  useEffect(() => {
    if (!firstName && !lastName) {
      router.replace('/');
    }
  }, [firstName, lastName, router]);

  // Mock selections (in a real app, these would come from previous page state)
  const mockSelections = useMemo<InnieSelections>(() => ({
    primary_work_skill: "Data analysis",
    work_personality: "Focused",
    office_habit: "Takes meticulous notes",
    worst_fear: "Making mistakes",
    break_room_activity: "Reading quietly"
  }), []);

  // Function to fetch facts
  const fetchFacts = useCallback(async () => {
    // Reset state
    setPageState(prev => ({
      ...prev,
      isLoading: true,
      isReady: false,
      error: null
    }));
    
    try {
      const narrative = createNarrativeFromSelections(mockSelections);
      const response = await generateWellnessFacts({
        innie_traits: narrative,
        raw_selections: mockSelections
      });

      // Update state with new facts and ready state
      setPageState({
        isLoading: false,
        isReady: true,
        error: null,
        facts: response.facts
      });
    } catch {
      setPageState(prev => ({
        ...prev,
        isLoading: false,
        isReady: false,
        error: 'Unable to retrieve your wellness facts at this time. Please check your internet connection and try again.'
      }));
    }
  }, [mockSelections]);

  // Modify the useEffect to use the ref
  useEffect(() => {
    // Only fetch if we haven't already
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchFacts();
    }
  }, [fetchFacts]);

  // Handle download
  const handleDownload = async () => {
    try {
      const displayName = `${firstName}${lastName ? ` ${lastName[0]}` : ''}`;
      const pngDataUrl = await generateWellnessPNG({
        name: displayName,
        facts: pageState.facts
      });
      
      const link = document.createElement('a');
      link.href = pngDataUrl;
      link.download = 'wellness-facts.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to generate PNG:', error);
      
      // Fallback to text download
      const displayName = `${firstName}${lastName ? ` ${lastName[0]}` : ''}`;
      const content = `Wellness Facts for ${displayName}\n\n${pageState.facts.join('\n')}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wellness-facts.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Handle copy
  const handleCopy = async () => {
    const displayName = `${firstName}${lastName ? ` ${lastName[0]}` : ''}`;
    const content = `Lumon Outie Query System Interface (OQSI)\n\nWellness Facts for ${displayName}:\n${pageState.facts.map(fact => `- ${fact}`).join('\n')}\n\nGet your Outie facts at: YourOutie.is`;
    
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        throw new Error('Failed to copy to clipboard');
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  // Render error state
  if (pageState.error) {
    return (
      <ContentPageTemplate>
        <ContentTextOnly
          key="error-state"
          title="We apologize for the error."
          text={[pageState.error]}
          onComplete={fetchFacts}
          buttonText="Try Again"
          animationConfig={{
            enabled: true,
            duration: 1000,
            pause: 1000
          }}
        />
      </ContentPageTemplate>
    );
  }

  // Render loading state
  if (pageState.isLoading) {
    return (
      <ContentPageTemplate>
        <ContentTextOnly 
          key="loading-state"
          title="Consulting Ms. Casey…"
          animationConfig={{
            enabled: true,
            duration: 1000,
            pause: 1000
          }}
        />
      </ContentPageTemplate>
    );
  }

  // Don't render until ready
  if (!pageState.isReady || !pageState.facts.length) {
    return (
      <ContentPageTemplate>
        <div className="opacity-0">Loading...</div>
      </ContentPageTemplate>
    );
  }

  const displayName = `${firstName}${lastName ? ` ${lastName[0]}` : ''}`;

  return (
    <ContentPageTemplate>
      <ContentTextOnly
        key="facts-display"
        title={`Wellness Facts for ${displayName}.`}
        text={pageState.facts}
        onComplete={handleDownload}
        buttonText="Download Outie Facts"
        secondaryAction={{
          text: "Copy to Clipboard",
          onClick: handleCopy,
          variant: "secondary",
          successText: "Praise Kier!"
        }}
        animationConfig={{
          enabled: true,
          duration: 1000,
          pause: 1000
        }}
      />
    </ContentPageTemplate>
  );
} 