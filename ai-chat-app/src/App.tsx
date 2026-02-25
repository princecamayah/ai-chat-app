import { use, useEffect, useRef } from 'react';
import { useChatStore } from './stores/chatStore';
import { MessageBubble } from './components/chat/MessageBubble';
import { ChatInput } from './components/chat/ChatInput';
import { GeneratedPlanCard } from './components/chat/GeneratedPlanCard';
import { auth } from './lib/firebase'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export default function App() {
  // connect to the store
  const messages = useChatStore((state) => state.messages);
  const setUserId = useChatStore((state) => state.setUserId);

  useEffect(() => {
    // set up the listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // if user found, save their anonymous UID to the store
        console.log("User is signed in with UID:", user.uid);
        setUserId(user.uid);
      } else {
        // if no user found, we need to create a new anonymous session
        console.log("No user found. Signing in anonymously...");
        signInAnonymously(auth).catch((error) => {
          console.error("Error signing in anonymously:", error);
        });
      }
    });

    // clean up: forces the listener to stop if the component ever unmounts (preventing memory leaks)
    return () => unsubscribe();
  }, [setUserId]); 

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
            <ChatInput />
         </div>
      </footer>

    </div>
  );
}