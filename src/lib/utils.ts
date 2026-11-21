import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ChatOpenAI } from "@langchain/openai";
// import { AzureChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { FactCategory } from "@/types/api";
import { FALLBACK_FACTS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000) + 1;
}

export function extractKeyThemes(fact: string): Set<string> {
  const cleaned = fact.toLowerCase().replace("your Outie", "").trim();
  const words = cleaned.match(/\b[a-z]{4,}\b/g) || [];
  return new Set(words);
}

export function calculateSimilarity(fact1: string, fact2: string): number {
  const themes1 = extractKeyThemes(fact1);
  const themes2 = extractKeyThemes(fact2);
  
  if (!themes1.size || !themes2.size) {
    return 0.0;
  }
  
  const intersection = new Set([...themes1].filter(x => themes2.has(x)));
  const union = new Set([...themes1, ...themes2]);
  
  return intersection.size / union.size;
}

const outputParser = StructuredOutputParser.fromZodSchema(
  z.object({
    fact: z.string().startsWith("Your Outie"),
    category: z.enum([
      "moral_virtues",
      "social_interactions",
      "practical_skills",
      "aesthetic_appreciation",
      "physical_abilities",
      "cultural_knowledge",
      "quirky_habits",
      "social_standing",
      "emotional_traits",
      "etiquette_behaviors",
      "unusual_talents",
      "possessions",
      "animal_relations",
      "achievements",
      "future_predictions"
    ])
  })
);

const formatInstructions = outputParser.getFormatInstructions();

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are an award-winning smart TV comedy writer. Write for the character Ms. Casey from the TV show Severance. Write one deadpan, oddly specific wellness fact about someone's \"Outie\". Use their answers as quiet inspiration, without mentioning those answers, the Innie, or work."],
  ["human", `Generate a wellness fact about an Outie based on these Innie traits: {innieTraits}

The fact should:
1. Let a supplied trait quietly inspire the fact. Do not mention the answers, the Innie, or work, or explain how the idea relates to the input.
2. Describe one observable behavior with one oddly specific detail.
3. Sound slightly absurd yet plausible
4. Have the same clinical, corporate tone used in Severance
5. Be a single sentence starting with "Your Outie"
6. Keep it to about 15 words or less
7. Focus on the category: {factCategory}

Note on tone: State the behavior in a flat, matter-of-fact voice. Let the specific detail carry the humor.

Example wellness facts from the show:
- "Your Outie can parallel park in less than 20 seconds."
- "Your Outie knows a beautiful rock from a plain one."
- "Your Outie is splendid and can swim gracefully and well."
- "Your Outie has both zaz and pep."
- "Your Outie makes pleasing noises."
- "Your Outie can leap admirably but does not do so to show off."
- "Your Outie is the second tallest of their friend group."
- "Your Outie listens to music while shaving, but not while showering."
- "Your Outie prefers two scoops of ice cream in a serving, but they must be the same flavor."

Examples of using trait inspiration quietly:
- Innie: "Detail-oriented" → "Your Outie alphabetizes the spices in every furnished apartment they rent."
- Innie: "Reserved in meetings" → "Your Outie performs amateur stand-up comedy every third Thursday."
- Innie: "Rule-follower" → "Your Outie frames their parking tickets in identical walnut frames."

Previously generated facts:
{previousFacts}

IMPORTANT: Your fact MUST be completely different from any previously generated facts. Do not repeat themes, activities, or concepts.

{format_instructions}`],
]);

// Azure OpenAI Configuration
// const model = new AzureChatOpenAI({
//   azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
//   azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
//   azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
//   azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview",
//   modelName: process.env.AZURE_OPENAI_MODEL || "gpt-4.1-mini",
//   temperature: Number(process.env.AZURE_OPENAI_TEMPERATURE) || 0.8,
//   modelKwargs: {
//     seed: generateRandomSeed(),
//   }
// });

// OpenAI Configuration
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  temperature: Number(process.env.OPENAI_TEMPERATURE) || 0.8,
  modelKwargs: {
    seed: generateRandomSeed(),
  }
});

export async function generateSingleFact(
  innieTraits: string,
  factCategory: FactCategory,
  previousFacts: string[]
): Promise<{ fact: string; category: string }> {
  try {
    const chain = prompt.pipe(model).pipe(outputParser);
    
    const result = await chain.invoke({
      innieTraits,
      factCategory,
      previousFacts: previousFacts.length > 0 ? previousFacts.join("\n") : "None yet",
      format_instructions: formatInstructions,
    });

    return {
      fact: result.fact,
      category: result.category
    };
  } catch (error) {
    console.error("Error generating fact:", error);
    return {
      fact: FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)],
      category: "fallback"
    };
  }
}
