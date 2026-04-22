import { create } from 'zustand';
import type { Message as APIMessage } from '../types';

// create a specific type for the frontend that includes ID (we cannot add ID to types.ts without invalidating the API contract as the backend does not expect an ID)
// also override the role to allow for the frontend-only 'transient' messages 
export interface ChatMessage extends Omit<APIMessage, 'role'> {
    id: string;
    role: APIMessage['role'] | 'transient';
}

// define the shape of the sidebar data
export interface ConversationMeta {
    id: string;
    title: string;
    updatedAt: number; // Unix timestamp
}

export type LoadingStatus = 'idle' | 'typing' | 'generating';

const WELCOME_MSG: ChatMessage = {
    id: 'intro-1',
    role: 'assistant',
    type: 'text',
    content: `Hello! I am here to assist you on your task.

I work a little differently to other AI - I use a structured 3-phase approach: think of it like constructing a blueprint for a house before you build it.

1. First, I'll ask a few questions to clarify your **Goal**, along with any details and preferences.
2. Then, I'll generate a **Blueprint**, helping you to see if I've understood your task accurately.
3. Finally, you'll have the opportunity to refine your blueprint, and once you approve it, we will **Execute** it.

To get started, tell me: what is your **goal** or task for this session?
`
};

// const TEST_PLAN: ChatMessage = {
//     id: 'test-plan-1',
//     role: 'assistant',
//     type: 'plan',
//     content: `You are an expert Research Assistant specializing in outerwear. I need you to help me find a suitable winter coat. Your responses should be friendly and helpful, yet maintain a professional tone. I am looking for a coat for myself, a man, to wear to work where smart attire is expected. The coat must be suitable for harsh UK winter weather – consistently cold and wet. My budget is £200.

// I require a short report detailing suitable coat options. Before presenting the report, you will Think Step-by-Step to ensure you fully understand my needs and to structure your research effectively. This includes considering coat types (e.g., trench coats, pea coats, duffle coats, parkas), materials (e.g., wool, synthetic blends, waterproof membranes), and key features (e.g., insulation, hood, pockets). Prioritize coats that balance warmth, weather protection, and a smart appearance appropriate for a professional work environment. The report should clearly outline the pros and cons of each suggested option, and where possible, provide examples within my budget. Always explain technical terms in a clear and accessible way. Do not include purchasing links; focus solely on providing informative research.`
// };

interface ChatState {
    // -- state --
    userId: string | null; // tracks current anonymous user
    activeConversationId: string | null; // tracks currently open chat
    conversations: ConversationMeta[]; // the history list for the sidebar
    messages: ChatMessage[];
    phase: 'discovery' | 'review' | 'refinement' | 'execution';
    activePlan: string | null; // stores the most recent plan
    loadingStatus: LoadingStatus;

    // -- actions --
    setUserId: (id: string | null) => void;
    addMessage: (msg: ChatMessage) => void;
    setPhase: (phase: ChatState['phase']) => void;
    setActivePlan: (plan: string) => void;
    setLoadingStatus: (status: LoadingStatus) => void;
    resetChat: () => void; // clears conversation history
    setConversations: (conversations: ConversationMeta[]) => void;
    setActiveConversation: (id: string | null) => void;
    startNewChat: () => void;
    setMessages: (messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    // -- initial values --
    userId: null,
    activeConversationId: null,
    conversations: [],  
    messages: [WELCOME_MSG],
    phase: 'discovery',
    activePlan: null,
    loadingStatus: 'idle',

    // TEST INITIAL VALUES (REFINEMENT)
    // messages: [TEST_PLAN],
    // phase: 'review',
    // activePlan: TEST_PLAN.content,

    // -- action implementations --
    setUserId: (id) =>
        set(() => ({ userId: id })),

    addMessage: (msg) =>
        // set expects you to give it a function that returns an object
        set((state) => ({
            messages: [...state.messages, msg] // old messages + new one
        })),

    setPhase: (phase) =>
        set(() => ({ phase })),

    setActivePlan: (plan) =>
        set(() => ({ activePlan: plan })),

    setLoadingStatus: (status) => 
        set(() => ({ loadingStatus: status })),

    // used when switching from review -> execution
    resetChat: () =>
        set(() => ({ messages: [] })),

    setConversations: (conversations) =>
        set(() => ({ conversations })),

    setActiveConversation: (id) =>
        set(() => ({ activeConversationId: id })),

    startNewChat: () => 
        set(() => ({
            activeConversationId: null,
            messages: [WELCOME_MSG],
            phase: 'discovery',
            activePlan: null
        })),

    setMessages: (messages) =>
        set(() => ({ messages })),
}));

