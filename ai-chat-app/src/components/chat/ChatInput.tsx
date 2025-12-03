import { useState } from 'react';
import { useChatStore } from '../../stores/chatStore';

export function ChatInput() {
    const [inputText, setInputText] = useState('');

    // get only the addMessage function from the store
    const addMessage = useChatStore((state) => state.addMessage);

    // modern ES6 JS using the arrow function
    // it just means create a variable named handleSend
    // and set it equal to a function that takes no inputs
    // that runs the following code
    const handleSend = () => {

        // don't send empty input or input with just spaces
        if (!inputText.trim()) return;

        // update the global store
        addMessage({
            id: crypto.randomUUID(), // built-in JS function for random IDs
            role: 'user',
            content: inputText
        });

        // reset the text box
        setInputText('');
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
                disabled={!inputText.trim()} // make the button gray if the text box is empty
            >
                Send
            </button>
        </div>
    );
}