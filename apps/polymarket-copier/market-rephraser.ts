import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import type { MarketplaceConfig } from "polybets-common";
import { z } from "zod";
import type { PolymarketMarket, RephrasedMarket } from "./types";
import { RephrasedMarketSchema } from "./types";
const RephrasedMarketArraySchema = z.array(RephrasedMarketSchema);

export class MarketRephraser {
  private llm: ChatOpenAI;
  private promptTemplate: PromptTemplate;
  private chain: RunnableSequence;

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string = "https://openrouter.ai/api/v1"
  ) {
    // Initialize ChatOpenAI with OpenRouter configuration
    this.llm = new ChatOpenAI({
      modelName: "anthropic/claude-3-5-sonnet-20241022",
      temperature: 0.3, // Lower temperature for more consistent JSON output
      openAIApiKey: apiKey,
      configuration: {
        baseURL: baseUrl,
      },
    });

    // Create the prompt template
    this.promptTemplate = this.createPromptTemplate();

    // Create the chain with structured output
    this.chain = this.createChain();
  }

  /**
   * Rephrases a Polymarket market for a specific marketplace
   * @param market - The original Polymarket market
   * @param marketplace - The target marketplace configuration
   * @returns Promise<RephrasedMarket[]>
   */
  async rephraseMarket(
    market: PolymarketMarket,
    marketplace: MarketplaceConfig,
    suggestionCount: number = 1
  ): Promise<RephrasedMarket[]> {
    try {
      console.log(
        `🔄 Rephrasing market "${market.question}" for ${marketplace.name} with ${suggestionCount} suggestions...`
      );

      const outcomes = JSON.parse(market.outcomes);
      const prices = JSON.parse(market.outcomePrices);

      const input = {
        originalQuestion: market.question,
        originalDescription: market.description,
        originalOutcomes: outcomes,
        originalCategory: market.category,
        originalPrices: prices,
        originalVolume: market.volumeNum,
        originalLiquidity: market.liquidityNum,
        marketplaceDescription: marketplace.description,
        marketplaceName: marketplace.name,
        endDate: market.endDate,
        hasImage: !!market.image,
        imageUrl: market.image,
        suggestionCount,
      };

      const result = await this.chain.invoke(input);

      console.log(
        `✅ Successfully rephrased market for ${marketplace.name} with ${result.length} suggestions.`
      );
      result.forEach((r: RephrasedMarket, i: number) => {
        console.log(`  📝 Suggestion ${i + 1}: "${r.question}"`);
      });

      return result;
    } catch (error) {
      console.error(
        `❌ Failed to rephrase market ${market.id} for ${marketplace.name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Creates the prompt template for market rephrasing
   * @returns PromptTemplate
   */
  private createPromptTemplate(): PromptTemplate {
    const template = `You are an expert at creating prediction markets. You need to rephrase an existing market from Polymarket to fit a new marketplace with its own style and audience.

**Original Market:**
- Question: {originalQuestion}
- Description: {originalDescription}
- Outcomes: {originalOutcomes}
- Category: {originalCategory}
- Current Prices: {originalPrices}
- Volume: {originalVolume}
- Liquidity: {originalLiquidity}
- End Date: {endDate}
- Has Image: {hasImage}
- Image URL: {imageUrl}

**Target Marketplace:**
- Name: {marketplaceName}  
- Description: {marketplaceDescription}

**CRITICAL REQUIREMENT - WIN CONDITIONS MUST BE IDENTICAL:**
The rephrased market MUST have exactly the same win conditions as the original market. People betting "Yes" or "No" must win or lose based on precisely the same real-world outcome. You can change the wording, style, and language, but the underlying event being predicted and the criteria for winning MUST remain 100% identical.

**Instructions:**
1.  Generate {suggestionCount} unique rephrased versions of the market. Each version must be a distinct, creative take while adhering to all constraints.
2.  For each version, rephrase the question to be engaging and clear for the target marketplace.
3.  Rewrite the description to be comprehensive but accessible.
4.  Adapt the outcomes to be clear and unambiguous.
5.  Choose an appropriate category.
6.  Determine the best media type for this market.
7.  Maintain the core prediction while adapting the language and style.
8.  Use sentence case for the rephrased question (e.g., "Will the US add more than 200k jobs in July?") - only capitalize the first word and proper nouns.

**Guidelines:**
- Keep the fundamental prediction unchanged
- Make the language accessible and engaging
- Ensure outcomes are mutually exclusive and exhaustive
- Add context that helps users understand what they're predicting
- Use clear, simple language that avoids jargon
- Make it relevant to the target marketplace's audience
- The question should be answerable with yes/no or binary outcomes
- Include resolution criteria in the description

**ABSOLUTELY CRITICAL - IDENTICAL WIN CONDITIONS:**
- The EXACT SAME event must determine the outcome (e.g., if original is about "US adding 200k+ jobs in July", the rephrased version must resolve based on that same BLS report with that same threshold)
- The EXACT SAME data source must be used (e.g., BLS Employment Situation Summary)
- The EXACT SAME date/time must apply (e.g., August 1, 2025 release)
- The EXACT SAME numerical threshold must apply (e.g., 200,000 jobs)
- The EXACT SAME resolution methodology must apply
- If original says "Yes" wins when X happens, rephrased "Yes" must win when X happens
- People who bet the same way (Yes/No) must have identical winning conditions

**Example of CORRECT rephrasing:**
Original: "Will the US add more than 200k jobs in July?"
✅ GOOD: "Will July job growth exceed 200,000 new positions?"
✅ GOOD: "Will US employment see over 200k job additions in July?"
❌ BAD: "Will the US see strong job growth in July?" (vague threshold)
❌ BAD: "Will July jobs exceed expectations?" (different win condition)

**EXACT JSON FORMAT REQUIRED:**
Your response must be a valid JSON array containing {suggestionCount} objects. Each object must have these exact field names (no wrapper objects):

[
  {{
    "question": "string - the rephrased question",
    "description": "string - the comprehensive description with resolution criteria", 
    "outcomes": ["string", "string"] - exactly 2 outcome options,
    "category": "string - appropriate category",
    "mediaType": "image" | "video" | "text" - one of these three only,
    "reasoning": "string - brief explanation of your rephrasing choices"
  }}
]

**EXAMPLE OUTPUT for suggestionCount = 2:**
[
  {{
    "question": "Will July job growth exceed 200,000 new positions?",
    "description": "This market resolves based on the U.S. Bureau of Labor Statistics Employment Situation Summary for July 2025, scheduled for release on August 1, 2025 at 8:30 AM ET. The market tracks whether nonfarm payroll employment increases by more than 200,000 jobs. Official data source: https://www.bls.gov/bls/newsrels.htm",
    "outcomes": ["Yes", "No"],
    "category": "Economics", 
    "mediaType": "image",
    "reasoning": "Simplified language while preserving exact resolution criteria and BLS data source"
  }},
  {{
    "question": "Will the US nonfarm payroll report for July show an increase of over 200k jobs?",
    "description": "This market is about the monthly US jobs report. It settles based on the 'Nonfarm Payroll Employment' figure in the Bureau of Labor Statistics (BLS) Employment Situation Summary for July 2025. If the number is greater than 200,000, 'Yes' wins. The report is expected on August 1, 2025, at 8:30 AM ET.",
    "outcomes": ["Yes", "No"],
    "category": "Finance",
    "mediaType": "text",
    "reasoning": "More direct question format, framing it around the report itself. Maintained all key resolution details."
  }}
]

Return only the JSON array, no additional text or formatting.`;

    return new PromptTemplate({
      template,
      inputVariables: [
        "originalQuestion",
        "originalDescription",
        "originalOutcomes",
        "originalCategory",
        "originalPrices",
        "originalVolume",
        "originalLiquidity",
        "marketplaceDescription",
        "marketplaceName",
        "endDate",
        "hasImage",
        "imageUrl",
        "suggestionCount",
      ],
    });
  }

  /**
   * Creates the LangChain chain with structured output
   * @returns RunnableSequence
   */
  private createChain(): RunnableSequence {
    // Create the chain
    const chain = RunnableSequence.from([
      this.promptTemplate,
      this.llm,
      // Custom JSON parser with better error handling
      (output: any) => {
        try {
          let jsonText = output.content || output;

          // If it's already an object, return it
          if (typeof jsonText === "object") {
            return jsonText;
          }

          // Clean up the text - remove any markdown formatting
          if (typeof jsonText === "string") {
            // Remove markdown code blocks if present
            jsonText = jsonText.replace(/```json\s*|\s*```/g, "");
            jsonText = jsonText.replace(/```\s*|\s*```/g, "");
            jsonText = jsonText.trim();

            // Try to parse as JSON
            return JSON.parse(jsonText);
          }

          throw new Error("Could not extract JSON from output");
        } catch (parseError) {
          console.error("❌ JSON parsing failed:", parseError);
          console.error("❌ Raw LLM output:", JSON.stringify(output, null, 2));
          throw parseError;
        }
      },
      // Add Zod validation as a final step
      (output: any) => {
        try {
          // Ensure we have a valid object before parsing
          if (!output || !Array.isArray(output)) {
            throw new Error("Output is not a valid array");
          }
          return RephrasedMarketArraySchema.parse(output);
        } catch (error) {
          console.error("❌ Zod validation failed:", error);
          console.error("❌ Parsed output:", JSON.stringify(output, null, 2));
          throw new Error(
            `Invalid structured output format: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      },
    ]);

    return chain;
  }

  /**
   * Validates a rephrased market object
   * @param market - The rephrased market to validate
   * @returns boolean
   */
  validateRephrasedMarket(market: RephrasedMarket): boolean {
    try {
      RephrasedMarketSchema.parse(market);
      if (market.outcomes.length !== 2) {
        console.warn(
          `⚠️ Validation failed: Rephrased market must have exactly 2 outcomes.`
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("❌ Rephrased market failed Zod validation:", error);
      return false;
    }
  }

  /**
   * Batch rephrase multiple markets for multiple marketplaces
   * @param markets - Array of markets to rephrase
   * @param marketplaces - Array of target marketplaces
   * @param concurrency - Number of concurrent operations
   * @returns Promise<Array<{market: PolymarketMarket, marketplace: MarketplaceConfig, rephrased: RephrasedMarket | null}>>
   */
  async batchRephrase(
    markets: PolymarketMarket[],
    marketplaces: MarketplaceConfig[],
    concurrency: number = 3
  ): Promise<
    Array<{
      market: PolymarketMarket;
      marketplace: MarketplaceConfig;
      rephrased: RephrasedMarket | null;
      error?: string;
    }>
  > {
    const results: Array<{
      market: PolymarketMarket;
      marketplace: MarketplaceConfig;
      rephrased: RephrasedMarket | null;
      error?: string;
    }> = [];

    // Create all combinations of markets and marketplaces
    const combinations: Array<{
      market: PolymarketMarket;
      marketplace: MarketplaceConfig;
    }> = [];

    for (const market of markets) {
      for (const marketplace of marketplaces) {
        combinations.push({ market, marketplace });
      }
    }

    console.log(
      `🔄 Starting batch rephrasing of ${combinations.length} market-marketplace combinations...`
    );

    // Process in batches with concurrency limit
    for (let i = 0; i < combinations.length; i += concurrency) {
      const batch = combinations.slice(i, i + concurrency);

      const batchPromises = batch.map(async ({ market, marketplace }) => {
        try {
          const rephrasedMarkets = await this.rephraseMarket(
            market,
            marketplace
          );
          results.push({
            market,
            marketplace,
            rephrased: rephrasedMarkets[0] || null,
          });
        } catch (error) {
          results.push({
            market,
            marketplace,
            rephrased: null,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });

      const batchResults = await Promise.all(batchPromises);
    }

    const successful = results.filter((r) => r.rephrased !== null).length;
    const failed = results.length - successful;

    console.log(
      `✅ Batch rephrasing completed: ${successful} successful, ${failed} failed`
    );

    return results;
  }

  /**
   * Utility function for delays
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
