import { useState, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";

export const Sidebar = () => {
    const conversations = useChatStore((state) => state.conversations);
    const activeConversationId = useChatStore((state) => state.activeConversationId);
    const setActiveConversation = useChatStore((state) => state.setActiveConversation);
    const startNewChat = useChatStore((state) => state.startNewChat);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <aside className="w-64 h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">

            {/* header area */}
            <div className="p-4 border-b border-sidebar-border">
                <h2 className="text-xl font-bold mb-4">Scaffolding Assistant</h2>
                <button
                    onClick={startNewChat}
                    className="w-full py-2 px-4 bg-primary text-primary-foreground hover:brightness-110 cursor-pointer rounded-md text-sm font-semibold transition-all"
                >
                    + New Chat
                </button>
            </div>

            {/* scrollable list of conversations */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.map((conv) => {
                    const isActive = conv.id === activeConversationId;

                    return (
                        <button
                            key={conv.id}
                            onClick={() => setActiveConversation(conv.id)}
                            className={`w-full text-left px-3 py-3 rounded-md text-sm truncate transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                    : 'text-muted-foreground hover:brightness-110 hover:text-sidebar-foreground'
                            }`}
                        >
                            {conv.title}
                        </button>
                    );
                })}
            </div>

            <div className="p-4 border-t border-sidebar-border mt-auto">
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="w-full py-2 px-4 bg-secondary text-secondary-foreground hover:brightness-110 cursor-pointer rounded-md text-sm font-medium transition-all flex justify-center items-center gap-2"
                >
                    {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                </button>
            </div>
        </aside>
    );
};