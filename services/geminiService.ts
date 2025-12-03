
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a fun fact or celebratory message based on the winner (number or text).
 */
export const getPrizeFunFact = async (value: string | number): Promise<string> => {
  try {
    const isNumber = typeof value === 'number';
    
    let prompt = "";
    if (isNumber) {
        prompt = `Dime un dato curioso, divertido, breve y muy interesante sobre el número ${value}. Máximo 25 palabras. El tono debe ser festivo.`;
    } else {
        prompt = `El ganador de un sorteo es: "${value}". Si es un nombre de persona, escribe una felicitación épica y breve (máx 20 palabras). Si es un objeto o lugar, di un dato curioso divertido sobre ello. Tono festivo y emocionante.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fact: {
              type: Type.STRING,
              description: "El dato curioso o felicitación"
            }
          },
          required: ["fact"]
        }
      }
    });

    const jsonResponse = JSON.parse(response.text || '{}');
    return jsonResponse.fact || `¡"${value}" es el ganador absoluto!`;
  } catch (error) {
    console.error("Error fetching fun fact:", error);
    return `¡"${value}" es el ganador de hoy!`;
  }
};
