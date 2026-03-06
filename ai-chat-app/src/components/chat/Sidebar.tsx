import { useChatStore } from "@/stores/chatStore";

export const Sidebar = () => {
    const conversations = useChatStore((state) => state.conversations);
    const activeConversationId = useChatStore((state) => state.activeConversationId);
    const setActiveConversation = useChatStore((state) => state.setActiveConversation);
    const startNewChat = useChatStore((state) => state.startNewChat);

    return (
        <aside className="w-64 h-screen bg-gray-900 text-gray-100 flex flex-col border-r border-gray-800">

            {/* header area */}
            <div className="p-4 border-b border-gray-800">
                <h2 className="text-xl font-bold mb-4">Scaffolding Assistant</h2>
                <button
                    onClick={startNewChat}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition"
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
                            className={`w-full text-left px-3 py-3 rounded text-sm truncate transition colors ${
                                isActive
                                    ? 'bg-gray-700 text-white font-medium'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                            }`}
                        >
                            {conv.title}
                        </button>
                    );
                })}
            </div>

        </aside>
    );
};