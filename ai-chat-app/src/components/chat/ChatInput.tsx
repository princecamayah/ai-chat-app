import { useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import type { AIResponse, ChatRequest } from '../../types';
import type { ChatMessage } from '../../stores/chatStore';
import { createNewConversation, addMessageToConversation, updateConversationState, clearConversationHistory } from '@/lib/firebaseHelpers';

// helper function: transforms UI messages into an API-compatible history
// (1) appends the user's message; (2) strips local IDs; (3) appends hidden user message to start
// new logic (4) in refinement phase, we slice the history and show the latest plan and messages from there onwards
function prepareApiHistory(currentMessages: any[], newMessageContent: string, phase: string, activePlan: string | null) {

    // initialise the new sliced history with the full history
    let historySegment = [...currentMessages];

    // if refining, drop all history prior to the active plan
    if (phase === 'refinement' && activePlan) {
        // find index of the last message of type plan
        let lastPlanIndex = -1;
        for (let i = currentMessages.length - 1; i >= 0; i--) {
            if (currentMessages[i].type === 'plan') {
                lastPlanIndex = i;
                break;
            }
        }

        // if found, slice the history
        if (lastPlanIndex !== -1) {
            historySegment = currentMessages.slice(lastPlanIndex + 1);

            // inject the plan as the first message from the user
            const anchorMessage = {
                role: 'user',
                content: `Here is the current plan we are refining:\n\n${activePlan}`,
                type: 'text'
            };

            // prepend plan to the messages that comes directly after
            historySegment = [anchorMessage, ...historySegment];
        }

        console.log(historySegment);
    }

    // append new user message (UI format)
    const rawHistory = [
        ...currentMessages,
        { role: 'user', content: newMessageContent, type: 'text'}
    ];

    // convert to API format (stripping the IDs and filtering out transient messages)
    let apiHistory = rawHistory
        .filter(msg => msg.role !== 'transient')
        .map(msg => ({
            role: msg.role,
            content: msg.content,
            type: msg.type || 'text'
        }));

    // if history starts with the AI assistant, inject a hidden "hello" message on behalf of the user
    if (apiHistory.length > 0 && apiHistory[0].role === 'assistant') {
        apiHistory = [
            { role: 'user', content: 'Hello.', type: 'text'},
            ...apiHistory
        ];
    }

    return apiHistory;
}

export function ChatInput() {
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // store access
    const messages = useChatStore((state) => state.messages);
    const phase = useChatStore((state) => state.phase);
    const activePlan = useChatStore((state) => state.activePlan);
    const userId = useChatStore((state) => state.userId);
    const activeConversationId = useChatStore((state) => state.activeConversationId);

    const addMessage = useChatStore((state) => state.addMessage);
    const setPhase = useChatStore((state) => state.setPhase);
    const setActivePlan = useChatStore((state) => state.setActivePlan);
    const resetChat = useChatStore((state) => state.resetChat);
    const setActiveConversation = useChatStore((state) => state.setActiveConversation);

    // arrow function means create a variable handleSend and set it equal to a function that takes no inputs and that runs the following code
    // this function handles the standard chat message sent from the chat input area
    const handleSend = async () => {

        // don't send empty input or input with just spaces
        if (!inputText.trim() || isLoading) return;

        const userText = inputText;
        setInputText(''); // clear input
        setIsLoading(true);

        // create the message object
        const userMessage: ChatMessage = {
            id: crypto.randomUUID(), // built-in JS function for random IDs
            role: 'user',
            content: userText,
            type: 'text'
        };

        // optimistic UI update: update the global store with the user message
        addMessage(userMessage);

        // keep a local reference of the conversation id
        let currentConvId = activeConversationId;

        try {
            // save user message in the database
            if (userId) {
                if (!currentConvId) {
                    // path 1: brand new chat

                    // create the new conversation with the title using userMessage
                    currentConvId = await createNewConversation(userId, userMessage);

                    // save the AI welcome message
                    const welcomeMessage = messages[0];
                    if (welcomeMessage) {
                        await addMessageToConversation(currentConvId, welcomeMessage);
                    }

                    // save the user's message
                    await addMessageToConversation(currentConvId, userMessage);

                    // update active conversation id in the Zustand store
                    setActiveConversation(currentConvId);
                } else {
                    // path 2: existing chat
                    await addMessageToConversation(currentConvId, userMessage);
                }
            }

            // prepare history to send to the backend with new user message
            const apiHistory = prepareApiHistory(messages, userText, phase, activePlan);

            // determine phase  
            let backendPhase: ChatRequest['phase'] = 'discovery';
            if (phase === 'execution') backendPhase = 'execution';
            else if (phase === 'refinement') backendPhase = 'refinement';

            // call the cloud function in index.ts
            // we use the Generics <Input, Output> to tell TS that we promise to send ChatRequest, and we expect AIResponse back
            const generateResponse = httpsCallable<ChatRequest, AIResponse>(functions, 'generateResponse');

            // result contains the metadata about the network request
            const result = await generateResponse({
                history: apiHistory,
                phase: backendPhase,
                customPlan: phase === 'execution' ? (activePlan ?? undefined) : undefined // (activePlan ?? undefined) means if activePlan is null, return undefined
            });

            // result.data contains the actual JSON object returned from the backend function in index.ts
            const data = result.data;

            // create AI response message
            const aiMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: data.content,
                type: data.type
            };

            // add the AI response message to the store
            addMessage(aiMessage);

            // save the AI response message to the database
            if (userId && currentConvId) {
                await addMessageToConversation(currentConvId, aiMessage);
            }

            // if in refinement phase AND a new plan has been outputted, update plan and switch to review phase
            if (phase === 'refinement' && data.type === 'plan') {
                setActivePlan(data.content);
                setPhase('review'); // return to review phase

                // sync the current state to the database
                if (currentConvId) {
                    await updateConversationState(currentConvId, 'review', data.content);
                }
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
        // ensure we have a database connection
        if (!userId || !activeConversationId) {
            console.error("Cannot generate plan: missing user or conversation ID.");
            return;
        }

        setIsLoading(true);

        // UI message: this updates the global store but does not affect the local messages variable
        // therefore apiHistory defined below does not include it.
        // this is because when the user clicks generate plan, React takes a snapshot of the history
        // at that very moment and stores it in the messages variable.
        addMessage({
            id: crypto.randomUUID(),
            role: 'transient',
            content: "Analysing our conversation to generate your plan...",
            type: 'text'
        });

        try {
            // define the hidden trigger prompt that asks the AI to generate the plan
            const triggerPrompt = "Based on our conversation above, generate the structured System Instruction (Meta-Prompt) now. Return ONLY the prompt.";

            // prepare the history for the backend + append the trigger prompt as a user message
            const apiHistory = prepareApiHistory(messages, triggerPrompt, phase, activePlan);

            const generateResponse = httpsCallable<ChatRequest, AIResponse>(functions, 'generateResponse');

            const result = await generateResponse({
                history: apiHistory, // pass sanitised history, not raw messages
                phase: 'review' // send the review phase to trigger the Architect prompt
            });

            const data = result.data;

            // create the plan message
            const planMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: data.content,
                type: 'plan'
            }

            // save plan to the store as the most updated plan
            setActivePlan(data.content);

            // add the plan to the message history store
            addMessage(planMsg);

            // switch to review mode -> approve and edit plan buttons appear
            setPhase('review');

            // save AI's response message to the database
            await addMessageToConversation(activeConversationId, planMsg);

            // update database state
            await updateConversationState(activeConversationId, 'review', data.content);

        } catch (error) {
            console.error('Plan generation failed:', error);
            addMessage({
                id: crypto.randomUUID(),
                role: 'transient', // errors being transient prevent them from affecting AI's responses
                content: "Failed to generate plan. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    };

    // handle the user clicking the approve plan button, executing the plan
    const handleApprove = async () => {
        // ensure we have a database connection + plan
        if (!userId || !activeConversationId || !activePlan) {
            console.error("Cannot approve plan: missing context.");
            return;
        }

        setIsLoading(true);

        try {
            // clear the database subcollection pre-execution history
            console.log("Clearing pre-execution history from database...");
            await clearConversationHistory(activeConversationId);

            // update the conversation state
            await updateConversationState(activeConversationId, 'execution', activePlan);

            // clear the Zustand store, which directly affects the current rendering of the UI
            resetChat();

            setPhase('execution');
            
            // create an explicit trigger message to execute the plan which will act as the user's first post-execution message
            const executionText = "Hello. I am ready to begin. Please proceed with generating the output exactly as described in your system instructions.";
            const executionMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'user',
                content: executionText,
                type: 'text'
            };

            // add the execution message to store
            addMessage(executionMsg);

            // save the execution message to database
            await addMessageToConversation(activeConversationId, executionMsg);

            // transient message replying to plan execution
            addMessage({
                id: crypto.randomUUID(),
                role: 'transient',
                content: "Plan approved. Executing your blueprint now...",
                type: 'text'
            });

            // prepare API history, passing the execution message with an empty history
            const apiHistory = prepareApiHistory([], executionText, 'execution', activePlan);

            const generateResponse = httpsCallable<ChatRequest, AIResponse>(functions, 'generateResponse');

            const result = await generateResponse({
                history: apiHistory,
                phase: 'execution',
                customPlan: activePlan ?? undefined
            });

            const data = result.data;

            // save AI response
            const aiMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: data.content,
                type: 'text'
            };

            // add AI response message to store
            addMessage(aiMessage);

            // save AI response message to the database
            await addMessageToConversation(activeConversationId, aiMessage);

        } catch (error) {
            console.error("Execution failed:", error);
            addMessage({
                id: crypto.randomUUID(),
                role: 'transient',
                content: "Sorry, I encountered an error while trying to execute the plan.",
                type: 'text'
            });
        } finally {
            setIsLoading(false);
        }
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