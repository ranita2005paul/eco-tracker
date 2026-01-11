
import { GoogleGenAI, Type } from "@google/genai";
import { EmissionSummary } from "../types";

export const getPersonalizedAdvice = async (summary: EmissionSummary) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    A user has the following carbon footprint profile (in kg CO2 per month):
    - Travel: ${summary.travel.toFixed(2)}
    - Electricity: ${summary.electricity.toFixed(2)}
    - LPG: ${summary.lpg.toFixed(2)}
    - Total: ${summary.total.toFixed(2)}

    Please provide 3 specific, actionable, and encouraging pieces of advice to help them reduce their footprint.
    Keep each tip short (under 30 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              tip: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["tip", "category"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [
      { tip: "Reduce high-emission travel by using bikes for short distances.", category: "Travel" },
      { tip: "Unplug electronics when not in use to stop 'vampire' energy loss.", category: "Electricity" }
    ];
  }
};
