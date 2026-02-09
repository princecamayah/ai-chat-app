import type { ChatMessage } from '../../stores/chatStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
    message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    isUser
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-400 text-white rounded-bl-none'
                }`}
            >
                <div className="text-sm leading-relaxed break-words">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // Tailwind resets list styles, so we re-add them
                            ul: ({node, ...props}) => <ul className='list-disc ml-4 mb-2' {...props} />,
                            ol: ({node, ...props}) => <ol className='list-decimal ml-4 mb-2' {...props} />,
                            // add margin to paragraphs
                            p: ({node, ...props}) => <p className='mb-2 last:mb-0' {...props} />,
                            // style links
                            a: ({node, ...props}) => <a className='underline font-bold' target='_blank' rel='noopener noreferrer' {...props} />
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>    
                </div>
            </div>
        </div>
    )
}