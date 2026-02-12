import { create } from 'zustand';
import type { Message as APIMessage } from '../types';

// create a specific type for the frontend that includes ID (we cannot add ID to types.ts without invalidating the API contract as the backend does not expect an ID)
export interface ChatMessage extends APIMessage {
    id: string;
}

const WELCOME_MSG: ChatMessage = {
    id: 'intro-1',
    role: 'assistant',
    type: 'text',
    content: `Hello! I am here to assist you on your task.

I work a little differently to other AI - I use a structured 3-phase approach: think of it like constructing a blueprint for a house before you build it.

1. First, I'll ask a few questions to clarify your **Goal**, **Details**, and **Preferences**.
2. Then, I'll generate a **Blueprint**, helping you to see if I've understood your task accurately.
3. Finally, you'll have the opportunity to refine your blueprint, and once you approve it, we will **Execute** it.

*To get started, tell me: what is your **goal** or **project** you want to work on today?*
`
};

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
    messages: [WELCOME_MSG],
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

