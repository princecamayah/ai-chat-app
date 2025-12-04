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
        return {
            content: "Gemini connection established. Logic pending.",
            type: "text"
        };
    }
}