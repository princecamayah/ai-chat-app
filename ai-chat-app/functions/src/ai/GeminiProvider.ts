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

        // filter for system message
        const systemMessage = history.find(m => m.role === 'system');
        const instructionText = systemMessage ? systemMessage.content : "You are a helpful AI.";

        console.log("DEBUG: System Message found?", !!systemMessage);
        console.log("DEBUG: Instruction Text:", `"${instructionText}"`);

        // filter for chat history and translate syntax
        const formattedContents = history
            .filter(m => m.role !== 'system') // remove system msg
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

        try {
            const result = await this.client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: formattedContents,
                config: {
                    systemInstruction: {
                        parts: [{ text: instructionText }]
                    },
                    temperature: 0.7, // controls sensitivity
                }
            });

            const responseText = result.text || "I'm sorry, I couldn;t generate a text response";

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