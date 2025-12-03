import { Message } from '../../stores/chatStore';

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    isUser
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-200 text-white rounded-bl-none'
                }`}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                </p>
            </div>
        </div>
    )
}