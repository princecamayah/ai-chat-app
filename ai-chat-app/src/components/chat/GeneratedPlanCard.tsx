import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface GeneratedPlanCardProps {
    plan: string;
}

export function GeneratedPlanCard({ plan }: GeneratedPlanCardProps) {
    return (
        <div className="flex w-full justify-start mb-4">
            <div className="w-full max-w-[90%] rounded-lg border-2 border-blue-400 bg-gray-100 p-4 text-gray-800 shadow-md">
                {/* header */}
                <div className="border-b-2 border-gray-200 pb-2 mb-4">
                    <h3 className="mb-2 font-bold text-blue-700 uppercase text-xs tracking-wider">
                        Your Generated Plan:
                    </h3>
                </div>

                {/* plan */}
                <div className="text-sm leading-relaxed">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // distinctly styled headings
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-blue-900 mt-4 mb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-blue-800 mt-4 mb-2 border-b border-gray-200 pb-1" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-md font-semibold text-blue-700 mt-3 mb-1" {...props} />,

                            // indentation for lists
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,

                            // spacing for paragraphs
                            p: ({node, ...props}) => <p className="mb-3 text-gray-700" {...props} />,

                            // code blocks
                            code: ({node, ...props}) => <code className="bg-gray-200 text-red-600 px-1 rounded text-xs font-mono" {...props} />,

                            // for summaries or notes, we use blockquotes
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-600 my-2" {...props} />
                        }}
                    >
                        {plan}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    )
}