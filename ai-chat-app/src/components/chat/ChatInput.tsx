import { useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import type { AIResponse, ChatRequest } from '../../types';

export function ChatInput() {
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // store access
    const messages = useChatStore((state) => state.messages);
    const phase = useChatStore((state) => state.phase);
    const activePlan = useChatStore((state) => state.activePlan);

    const addMessage = useChatStore((state) => state.addMessage);
    const setPhase = useChatStore((state) => state.setPhase);
    const setActivePlan = useChatStore((state) => state.setActivePlan);
    const resetChat = useChatStore((state) => state.resetChat);

    // arrow function means create a variable handleSend and set it equal to a function that takes no inputs and that runs the following code
    // this function handles the standard chat message sent from the chat input area
    const handleSend = async () => {

        // don't send empty input or input with just spaces
        if (!inputText.trim() || isLoading) return;

        const userText = inputText;
        setInputText(''); // clear input
        setIsLoading(true);

        // optimistic UI update: update the global store with the user message
        addMessage({
            id: crypto.randomUUID(), // built-in JS function for random IDs
            role: 'user' as const,
            content: userText
        });

        try {
            // construct the history including the new user message (used for UI state)
            const uiHistory = [
                ...messages,
                { id: crypto.randomUUID(), role: 'user' as const, content: userText } // append the new message
            ];

            // mode selection sends the appropriate phase to the backend to select the appropriate prompt (system instruction)
            let backendPhase: ChatRequest['phase'] = 'discovery';

            if (phase === 'execution') backendPhase = 'execution'; // if in execution phase, we remain 
            else if (phase === 'refinement') backendPhase = 'review'; // if in refinement phase, we want to return to review phase to generate another plan
            else backendPhase = 'discovery'; // if in discovery, we remain so long as the user is still typing

            // call the cloud function in index.ts
            // We use the Generics <Input, Output> to tell TS that we promise to send ChatRequest, and we expect AIResponse back
            const generateResponse = httpsCallable<ChatRequest, AIResponse>(functions, 'generateResponse');
            
            // create a sanitised history (used for backend)
            // we remove the ID to satisfy the API contract
            let apiHistory = uiHistory.map(msg => ({
                role: msg.role,
                content: msg.content,
                type: msg.type
            }))

            // if the first message (i.e. welcome message) is from the assistant, the API will complain, so must have a hidden user message first
            if (apiHistory.length > 0 && apiHistory[0].role === 'assistant') {
                apiHistory = [
                    {
                        role: 'user',
                        content: 'Hello.',
                        type: 'text'
                    },
                    ...apiHistory
                ];
            }

            // result contains the metadata about the network request
            const result = await generateResponse({
                history: apiHistory,
                phase: backendPhase,
                customPlan: phase === 'execution' ? (activePlan ?? undefined) : undefined // (activePlan ?? undefined) means if activePlan is null, return undefined
            });

            // result.data contains the actual JSON object returned from the backend function in index.ts
            const data = result.data;

            // add the AI response message to the store
            addMessage({
                id: crypto.randomUUID(),
                role: 'assistant',
                content: data.content,
                type: data.type
            });

            // if we were refining, update plan and display approve/edit buttons
            if (phase === 'refinement' && data.type === 'plan') {
                setActivePlan(data.content);
                setPhase('review'); // return to review phase
            }
        } catch (error) {
            console.error('Error generating AI response:', error);
            addMessage({
                id: crypto.randomUUID(),
                role: 'assistant',
                content: "Sorry, I'm having trouble responding right now."
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleGeneratePlan = async () => {
        setIsLoading(true);

        // UI message
        addMessage({
            id: crypto.randomUUID(),
            role: 'assistant',
            content: "Analysing our conversation to generate your plan..."
        });

        try {
            const generateResponse = httpsCallable<ChatRequest, AIResponse>(functions, 'generateResponse');

            // map the UI messages (with IDs) to API messages
            let apiHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                type: msg.type
            }));

            // if the first message (i.e. welcome message) is from the assistant, the AI API might complain, so must have a hidden user message first
            if (apiHistory.length > 0 && apiHistory[0].role === 'assistant') {
                apiHistory = [
                    {
                        role: 'user',
                        content: 'Hello.',
                        type: 'text'
                    },
                    ...apiHistory
                ];
            }

            // insert a trigger message which (1) ensures the AI gives the plan and (2) prevents breaking the user -> AI -> user flow
            apiHistory = [
                ...apiHistory,
                {
                    role: 'user' as const,
                    content: "Based on our conversation above, generate the structured System Instruction (Meta-Prompt) now. Return ONLY the prompt.",
                    type: "text"
                }
            ];

            console.log(apiHistory);

            const result = await generateResponse({
                history: apiHistory, // pass sanitised history, not raw messages
                phase: 'review' // send the review phase to trigger the Architect prompt
            });

            const data = result.data;

            // save plan to the store as the most updated plan
            setActivePlan(data.content);

            // add the plan to the message history store
            addMessage({
                id: crypto.randomUUID(),
                role: 'assistant',
                content: data.content,
                type: 'plan'
            });

            // switch to review mode -> approve and edit plan buttons appear
            setPhase('review');

        } catch (error) {
            console.error('Plan generation failed:', error);
            addMessage({
                id: crypto.randomUUID(),
                role: 'assistant',
                content: "Failed to generate plan. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    };

    // handle the user clicking the approve plan button
    const handleApprove = () => {
        resetChat(); // clear the current message history in the store (but remains in the UI)

        // switch to execution mode
        setPhase('execution');
    };

    // handle the user clicking the edit plan button
    const handleEdit = () => {
        setPhase('refinement');
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // stop text area from adding a new line
            handleSend();
        }
    };

    // if in review mode, show the action buttons and hide the input
    if (phase === 'review') {
        return (
            <div className="flex w-full gap-4">
                <button
                    className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-md hover:bg-blue-200 font-medium"
                    onClick={handleEdit}
                >
                    Edit Plan
                </button>

                <button
                    className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 font-medium"
                    onClick={handleApprove}
                >
                    Approve & Get Answer
                </button>
            </div>
        )
    }

    // if in discovery or execution mode, we show the chat input area
    return (
        <div className="flex flex-col w-full gap-2">
            {/* Show "Generate Plan" only in Discovery mode if we have had enough messages */}
            {phase === 'discovery' && messages.length > 10 && (
                <div className="flex justify-center pb-2">
                    <button
                        onClick={handleGeneratePlan}
                        disabled={isLoading}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
                    >
                        {isLoading ? 'Generating...' : 'Ready? Generate Plan'}
                    </button>
                </div>
            )}

            <div className="flex w-full items-end gap-2">
                <textarea
                    className="flex-1 resize-none rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={1}
                    placeholder={phase === 'refinement' ? "What would you like to change?" : "Type here..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />

                <button
                    onClick={handleSend}
                    className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                    disabled={isLoading || !inputText.trim()} // make the button gray if the text box is empty
                >
                    {phase === 'refinement' ? "Update" : "Send"}
                </button>
            </div>
        </div>
    );
}