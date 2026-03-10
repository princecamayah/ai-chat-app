import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface GeneratedPlanCardProps {
    plan: string;
}

export function GeneratedPlanCard({ plan }: GeneratedPlanCardProps) {
    return (
        <div className="flex w-full justify-start mb-6">
            <div className="w-full rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
                {/* header */}
                <div className="border-b border-border pb-3 mb-5">
                    <h3 className="font-bold text-primary uppercase text-xs tracking-wider">
                        Your Generated Plan:
                    </h3>
                </div>

                {/* plan */}
                <div className="text-sm leading-relaxed">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // distinctly styled headings
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-foreground mt-5 mb-3" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-foreground mt-5 mb-3 border-b border-border pb-1" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-md font-semibold text-foreground mt-4 mb-2" {...props} />,

                            // indentation for lists
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,

                            // spacing for paragraphs
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,

                            // code blocks
                            code: ({node, ...props}) => <code className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs font-mono border border-border" {...props} />,

                            // for summaries or notes, we use blockquotes
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-3" {...props} />
                        }}
                    >
                        {plan}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    )
}