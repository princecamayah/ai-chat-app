import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './AIProvider';
import { Message, AIResponse } from '../types';

export class GeminiProvider implements AIProvider {
    private client: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        // initialise the Google SDK
        this.client = new GoogleGenerativeAI(apiKey);
        // select the Flash model (fast and free)
        this.model = this.client.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    // we use async to tell the computer to pause execution at specific lines of this function
    async generateResponse(history: Message[]): Promise<AIResponse> {
        // TODO: logic for converting messages

        // filter for system message
        const systemMessage = history.find(m => m.role === 'system');

        // filter for chat history and translate syntax
        const chatHistory = history
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            }));
        
        // split history into context and the new message
        const lastMessage = chatHistory.pop();
        const pastMessages = chatHistory

        if (!lastMessage) {
            throw new Error("No user message found in history.");
        }
        
        const instructionText = systemMessage ? systemMessage.content : "You are a helpful AI.";

        // initialise chat with system instruction and history; SDK handles formatting
        const chat = this.model.startChat({
            history: pastMessages,
            systemInstruction: instructionText
        });

        // send the new message and wait for the Promise
        const result = await chat.sendMessage(lastMessage.parts[0].text);
        const responseText = result.response.text();

        return {
            content: responseText,
            type: "text" // we override this in index.ts in the case of a plan
        };
    }
}