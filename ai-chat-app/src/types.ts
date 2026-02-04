// we define what a Message is to our backend
export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    type?: 'text' | 'plan';
}

// data sent to the backend
export interface ChatRequest {
    history: Message[];
    phase?: 'discovery' | 'review' | 'execution';
    customPlan?: string;
}

// data sent from the backend
// we use this as a "universal translator": no matter which AI we use, the final result returns only content and type, something the frontend can expect.
export interface AIResponse {
    content: string;
    type: 'text' | 'plan';
}