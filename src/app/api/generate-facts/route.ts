import { NextResponse } from "next/server";
import { InnieRequest, WellnessFactResponse } from "@/types/api";
import { FACT_CATEGORIES } from "@/lib/constants";
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
    const usedCategories = new Set<string>();
    
    // Choose 5 different categories to ensure diversity
    const selectedCategories = FACT_CATEGORIES
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(5, FACT_CATEGORIES.length));

    for (const category of selectedCategories) {
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        const result = await generateSingleFact(
          body.innie_traits,
          category,
          facts
        );

        // Check if the fact is too similar to existing ones
        const isTooSimilar = facts.some(
          existingFact => calculateSimilarity(existingFact, result.fact) > 0.5
        );

        if (!isTooSimilar) {
          facts.push(result.fact);
          usedCategories.add(result.category);
          break;
        }

        attempts++;
      }
    }

    // If we don't have enough facts, fill with fallback facts
    while (facts.length < 5) {
      const result = await generateSingleFact(
        body.innie_traits,
        FACT_CATEGORIES[Math.floor(Math.random() * FACT_CATEGORIES.length)],
        facts
      );
      facts.push(result.fact);
    }

    return NextResponse.json({ facts } as WellnessFactResponse);
  } catch (error) {
    console.error("Error generating facts:", error);
    return NextResponse.json(
      { error: "Failed to generate facts" },
      { status: 500 }
    );
  }
} 