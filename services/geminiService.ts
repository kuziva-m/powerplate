
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, Language, LANGUAGE_LABELS } from "../types";

export const analyzeProduce = async (base64Image: string, language: Language): Promise<ScanResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: `Identify the fruit or vegetable in this image and provide official nutritional data for the "PowerPlate by FNC" app. 
          The information must be objective, direct, and scientifically accurate. 
          Provide all content in ${LANGUAGE_LABELS[language]}.

          Requirements:
          1. Provide the common name and a concise description.
          2. List exact nutritional values (calories, protein, carbs, fiber, vitamins, minerals).
          3. List three healthy Zimbabwean recipes incorporating this produce.
          4. For each recipe, include specific healthy pairings to create a balanced Zimbabwean meal (using local grains like zviyo/mapfunde and proteins like legumes or lean meats).
          5. Provide direct dietary and health advice focused on nutritional benefits. 
          6. DO NOT use personal introductions or phrases like "As a nutritionist" or "I recommend". 
          7. Provide seasonal availability information for Zimbabwe.

          Return the data strictly in JSON format according to this schema:
          {
            "foodName": "string",
            "description": "string",
            "nutrients": {
              "calories": "string",
              "protein": "string",
              "carbs": "string",
              "fiber": "string",
              "vitamins": ["string"],
              "minerals": ["string"]
            },
            "recipes": [
              {
                "name": "string",
                "ingredients": ["string"],
                "steps": ["string"],
                "culturalNote": "string",
                "healthyPairings": ["string"],
                "mealBalanceReason": "string"
              }
            ],
            "healthAdvice": "string",
            "seasonalInfo": "string"
          }`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          foodName: { type: Type.STRING },
          description: { type: Type.STRING },
          nutrients: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.STRING },
              protein: { type: Type.STRING },
              carbs: { type: Type.STRING },
              fiber: { type: Type.STRING },
              vitamins: { type: Type.ARRAY, items: { type: Type.STRING } },
              minerals: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["calories", "protein", "carbs", "fiber", "vitamins", "minerals"]
          },
          recipes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                culturalNote: { type: Type.STRING },
                healthyPairings: { type: Type.ARRAY, items: { type: Type.STRING } },
                mealBalanceReason: { type: Type.STRING }
              },
              required: ["name", "ingredients", "steps", "culturalNote", "healthyPairings", "mealBalanceReason"]
            }
          },
          healthAdvice: { type: Type.STRING },
          seasonalInfo: { type: Type.STRING }
        },
        required: ["foodName", "description", "nutrients", "recipes", "healthAdvice", "seasonalInfo"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from analysis");
  }

  try {
    return JSON.parse(response.text.trim()) as ScanResult;
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Invalid response format");
  }
};
