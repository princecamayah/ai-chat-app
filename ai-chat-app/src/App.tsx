import { useEffect, useRef } from 'react';
import { useChatStore } from './stores/chatStore';
import { MessageBubble } from './components/chat/MessageBubble';
import { ChatInput } from './components/chat/ChatInput';
import { GeneratedPlanCard } from './components/chat/GeneratedPlanCard';
import { Sidebar } from './components/chat/Sidebar';
import { auth } from './lib/firebase'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { fetchConversationMessages, subscribeToUserConversations } from './lib/firebaseHelpers';

export default function App() {
  // connect to the store
  const messages = useChatStore((state) => state.messages);
  const userId = useChatStore((state) => state.userId);
  const setUserId = useChatStore((state) => state.setUserId);
  const setConversations = useChatStore((state) => state.setConversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setMessages = useChatStore((state) => state.setMessages);

  // authentication listener
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
    // when useEffect returns a function, React saves it and executes it right before the component unmounts, or before the hook re-runs
    return () => unsubscribe();

  }, [setUserId]);

  // opens the persistent pipeline to fetch conversations for the authenticated user
  useEffect(() => {
    // gatekeeper: only connect once we have a valid user ID
    if (!userId) return;

    // initiate the persistent pipeline
    const unsubscribe = subscribeToUserConversations(userId, setConversations);

    // clean up: close connection on unmount
    // when useEffect returns a function, React saves it and executes it right before the component unmounts, or before the hook re-runs
    return () => unsubscribe();

  }, [userId, setConversations]); // watches for a change in userId before running 

  // fetches all messages for a given conversation
  useEffect(() => {
    // do nothing if there is no active chat ID
    if (!activeConversationId) return;

    // otherwise fetch the messages
    const loadMessages = async () => {
      const pastMessages = await fetchConversationMessages(activeConversationId);
      setMessages(pastMessages);
    };

    loadMessages();
  }, [activeConversationId, setMessages]);

  // auto-scroll logic by attaching a ref to grab the bottom HTML element
  const bottomRef = useRef<HTMLDivElement>(null);

  // every time messages or generatedPlan changes, scroll to the bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    // main container
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">

      {/* left column sidebar */}
      <Sidebar />

      {/* right column: vertical stack (chat area + input area) */}
      <div className="flex-1 flex flex-col relative">
        {/* chat area */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-3xl flex flex-col">

            {/* empty state */}
            {messages.length === 0 && (
              <div className="mt-20 text-center text-muted-foreground">
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

        {/* bottom: input area */}
        <footer className="p-4 bg-background border-t border-border">
         <div className="mx-auto max-w-3xl">
            <ChatInput />
         </div>
        </footer>
      </div>
    </div>
  );
}