import { create } from 'zustand';
import type { Message as APIMessage } from '../types';

// create a specific type for the frontend that includes ID (we cannot add ID to types.ts without invalidating the API contract as the backend does not expect an ID)
export interface ChatMessage extends APIMessage {
    id: string;
}

interface ChatState {
    // -- state --
    messages: ChatMessage[];
    phase: 'discovery' | 'review' | 'execution' | 'refinement';
    activePlan: string | null; // stores the most recent plan

    // -- actions --
    addMessage: (msg: ChatMessage) => void;
    setPhase: (phase: ChatState['phase']) => void;
    setActivePlan: (plan: string) => void;
    resetChat: () => void; // clears conversation history
}

export const useChatStore = create<ChatState>((set) => ({
    // -- initial values --
    messages: [],
    phase: 'discovery',
    activePlan: null,

    // -- action implementations --
    addMessage: (msg) =>
        set((state) => ({
            messages: [...state.messages, msg] // old messages + new one
        })),

    setPhase: (phase) =>
        set(() => ({ phase })),

    setActivePlan: (plan) =>
        set(() => ({ activePlan: plan })),

    // used when switching from review -> execution
    resetChat:() =>
        set(() => ({ messages: [] })),
}));

