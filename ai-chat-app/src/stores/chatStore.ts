import { create } from 'zustand';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    type?: 'text' | 'plan'; // optional, defaults to 'text' 
}

interface ChatState {
    // -- state --
    messages: Message[];
    status: 'discovery' | 'review' | 'execution';
    activePlan: string | null; // stores the most recent plan

    // -- actions --
    addMessage: (msg: Message) => void;
    setStatus: (status: ChatState['status']) => void;
    setActivePlan: (plan: string) => void;
    resetChat: () => void; // clears conversation history
}

export const useChatStore = create<ChatState>((set) => ({
    // -- initial values --
    messages: [],
    status: 'discovery',
    activePlan: null,

    // -- action implementations --
    addMessage: (msg) =>
        set((state) => ({
            messages: [...state.messages, msg] // old messages + new one
        })),

    setStatus: (status) =>
        set(() => ({ status })),

    setActivePlan: (plan) =>
        set(() => ({ activePlan: plan })),

    resetChat:() =>
        set(() => ({ messages: [] })),
}));

