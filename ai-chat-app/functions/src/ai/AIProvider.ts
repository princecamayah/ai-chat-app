// this file lists the requirements that any AI provider must have

import { Message, AIResponse } from '../types';

export interface AIProvider {
    // input: array of Messages; output: a Promise of an AIResponse 
    generateResponse(history: Message[]): Promise<AIResponse>; // a Promise is the temporary "guarantee" until the response is recieved from the AI provider
}