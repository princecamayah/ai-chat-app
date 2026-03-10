import type { ChatMessage } from '../../stores/chatStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
    message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';
    const isTransient = message.role === 'transient';

    return (
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    isUser
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
                        : isTransient
                            ? 'text-muted-foreground italic text-sm'
                            : 'text-foreground'
                }`}
            >
                <div className="text-sm leading-relaxed wrap-break-word">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // support headings but scale them down to fit the message bubble style
                            h1: ({node, ...props}) => <h1 className="text-base font-bold mb-2 mt-3" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-sm font-bold mb-2 mt-3" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-sm font-semibold mb-1 mt-2 underline" {...props} />,

                            // styling for lists
                            ul: ({node, ...props}) => <ul className='list-disc ml-4 mb-2 space-y-1' {...props} />,
                            ol: ({node, ...props}) => <ol className='list-decimal ml-4 mb-2 space-y-1' {...props} />,

                            // text formatting
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                            em: ({node, ...props}) => <em className="italic" {...props} />,

                            // style links: blue for AI, underlined for user
                            a: ({node, ...props}) => (
                                <a
                                    className={`underline font-medium ${isUser ? 'text-primary-foreground' : 'text-primary hover:text-primary/80'}`}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    {...props}
                                />
                            ),

                            // code styling
                            code: ({node, ...props}) => {
                                // to do: conditional styling: block vs inline
                                return (
                                    <code 
                                        className={`px-1 py-0.5 rounded text-xs font-mono ${
                                            isUser 
                                                ? 'bg-primary-foreground/20 text-primary-foreground' 
                                                : 'bg-muted text-muted-foreground border border-border'
                                        }`} 
                                        {...props} 
                                    />
                                )
                            },

                            // blockquotes
                            blockquote: ({node, ...props}) => (
                                <blockquote 
                                    className={`border-l-4 pl-3 italic my-2 ${
                                        isUser ? 'border-primary-foreground/50' : 'border-border text-muted-foreground'
                                    }`} 
                                    {...props} 
                                />
                            )
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>    
                </div>
            </div>
        </div>
    )
}