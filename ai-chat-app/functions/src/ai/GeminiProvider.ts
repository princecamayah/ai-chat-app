import { GoogleGenAI } from '@google/genai';
import { AIProvider } from './AIProvider';
import { Message, AIResponse } from '../types';

export class GeminiProvider implements AIProvider {
    private client: GoogleGenAI;

    constructor(apiKey: string) {
        // initialise the Google SDK
        this.client = new GoogleGenAI({ apiKey });
    }

    // we use async to tell the computer to pause execution at specific lines of this function
    async generateResponse(history: Message[]): Promise<AIResponse> {

        // extract system message
        const systemMessage = history.find(m => m.role === 'system');
        const systemInstruction = systemMessage ? systemMessage.content : "You are a helpful AI.";

        console.log("DEBUG: System Message found?", !!systemMessage);
        console.log("DEBUG: System instruction:", `"${systemInstruction}"`);

        const modelName = "gemma-3-12b-it";
        // check if model is gemini (supports system instructions) or gemma (does not support)
        const isGemini = modelName.startsWith("gemini");

        // filter for chat history and translate syntax
        const formattedContents = history
            .filter(m => m.role !== 'system') // remove system msg
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user', // Gemini uses the term "model" instead of "assistant"
                parts: [{ text: m.content }]
            }));

        if (!isGemini) {
            if (formattedContents.length > 0) {
                // prepend to the first existing user message
                const originalText = formattedContents[0].parts[0].text;
                formattedContents[0].parts[0].text = `[SYSTEM INSTRUCTION: ${systemInstruction}]\n\n${originalText}`
            } else {
                // if history is empty then create a fake user message
                formattedContents.push({
                    role: 'user',
                    parts: [{ text: `[SYSTEM INSTRUCTION: ${systemInstruction}]`}]
                });
            }
        }

        try {
            const result = await this.client.models.generateContent({
                model: "gemma-3-27b-it",
                contents: formattedContents,
                config: {
                    ...(isGemini ? {
                        systemInstruction: {
                            parts: [{ text: systemInstruction }]
                        }
                    } : {}),
                    temperature: 0.7, // controls sensitivity
                }
            });

            console.log("DEBUG: Raw Google Response:", JSON.stringify(result, null, 2));

            const responseText = result.text || "I'm sorry, I couldn't generate a text response.";

            return {
                content: responseText,
                type: "text" // we override this in index.ts in the case of a plan
            };

        } catch (error: any) {
            console.error("Gemini API Error:", error);
            throw new Error(`Gemini Provider failed: ${error.message}`);
        }
    }
}