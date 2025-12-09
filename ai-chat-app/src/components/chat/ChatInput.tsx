import { useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export function ChatInput() {
    const [inputText, setInputText] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    // get only the addMessage function from the store
    const messages = useChatStore((state) => state.messages);
    const addMessage = useChatStore((state) => state.addMessage);
    const setStatus = useChatStore((state) => state.setStatus);

    // modern ES6 JS using the arrow function
    // it just means create a variable named handleSend
    // and set it equal to a function that takes no inputs
    // that runs the following code
    const handleSend = async () => {

        // don't send empty input or input with just spaces
        if (!inputText.trim() || isLoading) return;

        const userText = inputText;

        // clear input
        setInputText('');
        setIsLoading(true);

        // update the global store with the user message
        addMessage({
            id: crypto.randomUUID(), // built-in JS function for random IDs
            role: 'user',
            content: userText
        });

        // switch to chatting mode if we were 'idle'
        setStatus('chatting');

        try {
            // construct the history including the new user message
            const currentHistory = [
                ...messages,
                { role: 'user', content: userText } // append the new message
            ];

            // call the cloud function
            const generateResponse = httpsCallable(functions, 'generateResponse');
            
            // result contains the metadata about the network request
            const result = await generateResponse({
                history: currentHistory,
                mode: 'chat'
            });

            // result.data contains the actual JSON object returned from the backend function in index.ts
            // React doesn't know the backend types, so we have to tell it what to expect
            const data = result.data as { content: string; type: 'text' | 'plan' };

            // add the AI response message to the store
            addMessage({
                id: crypto.randomUUID(),
                role: 'assistant',
                content: data.content,
                type: data.type
            });

            if (data.type === 'plan') {
                setStatus('reviewing');
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // stop text area from adding a new line
            handleSend();
        }
    };

    return (
        <div className="flex w-full items-end gap-2">
            <textarea
                className="flex-1 resize-none rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
                placeholder="Type here..."
                value={inputText} // we set the content of the textbox to be inputText
                onChange={(e) => setInputText(e.target.value)} // we trigger inputText to update whenever the user types
                onKeyDown={handleKeyDown}
            />

            <button
                onClick={handleSend}
                className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                disabled={isLoading || !inputText.trim()} // make the button gray if the text box is empty
            >
                Send
            </button>
        </div>
    );
}