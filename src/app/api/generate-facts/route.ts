import { NextResponse } from "next/server";
import { InnieRequest, WellnessFactResponse } from "@/types/api";
import { FACT_CATEGORIES, FALLBACK_FACTS } from "@/lib/constants";
import { generateSingleFact, calculateSimilarity } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json() as InnieRequest;
    
    if (!body.innie_traits?.trim()) {
      return NextResponse.json(
        { error: "Innie traits cannot be empty" },
        { status: 400 }
      );
    }

    const facts: string[] = [];
    const factObjects: Array<{ fact: string; category: string }> = [];
    const usedCategories = new Set<string>();
    
    // Choose 5 different categories to ensure diversity
    const selectedCategories = FACT_CATEGORIES
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(5, FACT_CATEGORIES.length));

    for (const category of selectedCategories) {
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        const factResult = await generateSingleFact(
          body.innie_traits,
          category,
          facts
        );

        // Check if this fact is too similar to existing facts
        const isTooSimilar = facts.some(
          existingFact => calculateSimilarity(existingFact, factResult.fact) > 0.25
        );

        if (!isTooSimilar) {
          facts.push(factResult.fact);
          factObjects.push(factResult);
          usedCategories.add(factResult.category);
          break;
        }

        attempts++;
      }

      // If we couldn't generate a unique fact for this category, try a random fallback
      if (facts.length !== usedCategories.size) {
        const unusedFallbacks = FALLBACK_FACTS.filter(f => !facts.includes(f));
        if (unusedFallbacks.length > 0) {
          const fallback = unusedFallbacks[Math.floor(Math.random() * unusedFallbacks.length)];
          facts.push(fallback);
        }
      }
    }

    // If we still don't have enough facts, fill with fallbacks
    while (facts.length < 5) {
      const unusedFallbacks = FALLBACK_FACTS.filter(f => !facts.includes(f));
      if (unusedFallbacks.length === 0) break;
      
      const fallback = unusedFallbacks[Math.floor(Math.random() * unusedFallbacks.length)];
      facts.push(fallback);
    }

    return NextResponse.json({ facts } as WellnessFactResponse);
  } catch (error) {
    console.error("Error generating facts:", error);
    
    // If we can't generate facts, return some fallbacks
    const fallbacks = FALLBACK_FACTS.length >= 5 
      ? FALLBACK_FACTS.slice(0, 5)
      : FALLBACK_FACTS;
      
    return NextResponse.json({ facts: fallbacks } as WellnessFactResponse);
  }
} 