import { useEffect, useRef } from 'react';
import { useChatStore } from './stores/chatStore';
import { MessageBubble } from './components/chat/MessageBubble';
import { ChatInput } from './components/chat/ChatInput';
import { GeneratedPlanCard } from './components/chat/GeneratedPlanCard';
import { ActionButtons } from './components/chat/ActionButtons';

function App() {
  // connect to the store  
  const messages = useChatStore((state) => state.messages);
  const status = useChatStore((state) => state.status);

  // auto-scroll logic by attaching a ref to grab the bottom HTML element
  const bottomRef = useRef<HTMLDivElement>(null);

  // every time messages or generatedPlan changes, scroll to the bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    // 1. Main Container: Full screen height, light gray background
    <div className="flex h-screen w-full flex-col bg-gray-100">
      
      {/* 2. Top Bar (Placeholder for your "Open" sidebar button) */}
      <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-blue-600 text-sm text-white font-medium rounded hover:bg-blue-700">
            Open Sidebar (Placeholder)
          </button>
          <h1 className="ml-4 font-bold text-xl">Assisted Mode</h1>
        </div>
      </header>

      {/* the chat area */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl flex flex-col">

          {/* empty state */}
          {messages.length === 0 && (
            <div className="mt-20 text-center text-gray-400">
              <p>Start by saying "Hello"...</p>
            </div>
          )}

          {/* message list */}
          {messages.map((msg) => {
            if (msg.type == 'plan') {
              return <GeneratedPlanCard key={msg.id} plan={msg.content} />
            } else {
              return <MessageBubble key={msg.id} message={msg} />
            }
          })}

          {/* invisible element to auto-scroll to */}
          <div ref={bottomRef}/>
        </div>
         
      </main>

      {/* footer */}
      <footer className="p-4 bg-white border-t">
         <div className="mx-auto max-w-3xl">
            {status === 'reviewing' ? (
              <ActionButtons />
            ) : (
              <ChatInput />
            )}
         </div>
      </footer>

    </div>
  );
}

export default App;