import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getAIResponse(prompt: string, stats: any) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are the AI Admin Assistant for Suni Net, an ISP business.
    You have access to the following business statistics:
    ${JSON.stringify(stats, null, 2)}
    
    The user is the Admin and may ask questions in English or Urdu.
    Respond accurately based on the data provided.
    If the user asks in Urdu, respond in Urdu.
    
    Business Logic:
    - Profit = My Price - Company Price
    - Total Profit = Active Users * (My Price - Company Price)
    - Terminated users are NOT included in profit calculations.
    - Payment Status:
      - "Paid": Users whose expiration date is in the NEXT month or later (e.g., March 2026+).
      - "Pending": Users whose expiration date is in the CURRENT month (February 2026). These users still need to pay.
    
    Current Date: February 23, 2026.
    
    Pricing Reference:
    12 MB: Company 485, My 1200
    17 MB: Company 535, My 1400
    22 MB: Company 625, My 1800
    27 MB: Company 710, My 2500
    32 MB: Company 810, My 3500
    52 MB: Company 1950, My 5000
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
}
