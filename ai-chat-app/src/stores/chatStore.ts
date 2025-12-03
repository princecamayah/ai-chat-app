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
    inputs: {
        goal: string;
        role: string;
        context: string;
        format: string;
        tone: string;
    };
    status: 'idle' | 'chatting' | 'reviewing'

    // -- actions --
    addMessage: (msg: Message) => void;
    updateInput: (field: keyof ChatState['inputs'], value: string) => void;
    setStatus: (status: ChatState['status']) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    // -- initial values --
    messages: [],
    inputs: {
        goal: '',
        role: '',
        context: '',
        format: '',
        tone: '',
    },
    status: 'idle',

    // -- action implementations --
    addMessage: (msg) =>
        set((state) => ({
            messages: [...state.messages, msg] // old messages + new one
        })),
    
    updateInput: (field, value) =>
        set((state) => ({
            inputs: {
                ...state.inputs, // keep other inputs the same
                [field]: value // update only the specific field
            }
        })),

    setStatus: (status) =>
        set({status: status}),
}));

