import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { BaseMessage } from "@langchain/core/messages";
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

export const promptTemplate = ChatPromptTemplate.fromTemplate(
  `You are an award-winning smart TV comedy writer. Write for the character Ms. Casey from the TV show Severance. Generate a wellness fact about someone's "Outie" (outside work self) that contrasts with their "innie" (work self).

The fact should follow this format: "Your Outie [fact about outside life]."

The innie (work self) is described as, or has these traits:
{innie_traits}

The wellness fact should:
1. Create an interesting contrast with their work traits
2. Be oddly specific
3. Sound slightly absurd yet plausible
4. Have the same clinical, corporate tone used in Severance
5. Be a single sentence starting with "Your Outie"
6. Keep it to about 15 words or less
7. Focus on the category: {fact_category}

Note on tone: The wellness facts should have a clinical, corporate delivery but describe something oddly specific or slightly absurd about the Outie's life outside work. The contrast between the formal delivery and the quirky content creates the distinctive Severance humor.

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
- "Your Outie has been mistaken for a celebrity who is widely considered handsome."
- "Your Outie understands the difference between an insect and an arachnid."
- "Your Outie is familiar with the myth of Hercules and derives great meaning from it."
- "Your Outie has survived multiple earthquakes and will survive more."
- "Your Outie does not make adults with visible orthodontia feel unwelcome or judged."
- "Your Outie likes the sound of radar."

Example contrasts between innie traits and Outie facts:
- Innie: "Detail-oriented" → "Your Outie alphabetizes their spice rack but never cooks."
- Innie: "Reserved in meetings" → "Your Outie performs amateur stand-up comedy every third Thursday."
- Innie: "Rule-follower" → "Your Outie has a collection of parking tickets they're oddly proud of."

Previously generated facts for this person:
{previous_facts}

IMPORTANT: Your fact MUST be completely different from any previously generated facts. Do not repeat themes, activities, or concepts.

Return only the wellness fact as a JSON object with keys "fact" and "category", like this:
{"fact": "Your Outie [fact about outside life].", "category": "[one of: moral_virtues, social_interactions, practical_skills, aesthetic_appreciation, physical_abilities, cultural_knowledge, quirky_habits, social_standing, emotional_traits, etiquette_behaviors, unusual_talents, possessions, animal_relations, achievements, future_predictions]"}`
);

export async function generateSingleFact(
  innieTraits: string,
  factCategory: FactCategory,
  previousFacts: string[]
): Promise<{ fact: string; category: string }> {
  try {
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0.8,
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelKwargs: { seed: generateRandomSeed() }
    });

    const prompt = await promptTemplate.formatMessages({
      innie_traits: innieTraits,
      fact_category: factCategory,
      previous_facts: previousFacts.length > 0 ? previousFacts.join("\n") : "None yet"
    });

    const response = await model.invoke(prompt);
    const content = getMessageContent(response);

    try {
      const factObj = JSON.parse(content);
      return {
        fact: factObj.fact || content,
        category: factObj.category || factCategory
      };
    } catch {
      return {
        fact: content.trim().replace(/^"|"$/g, ""),
        category: factCategory
      };
    }
  } catch (error) {
    console.error("Error generating fact:", error);
    return {
      fact: FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)],
      category: "fallback"
    };
  }
}

function getMessageContent(message: BaseMessage): string {
  const content = message.content;
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map(item => {
      if (typeof item === 'string') {
        return item;
      }
      // Handle different types of message content
      if ('type' in item) {
        switch (item.type) {
          case 'text':
            return item.text;
          case 'image_url':
            return ''; // Skip image URLs in our text-only context
          default:
            return '';
        }
      }
      return '';
    }).join(' ').trim();
  }
  return String(content);
}
