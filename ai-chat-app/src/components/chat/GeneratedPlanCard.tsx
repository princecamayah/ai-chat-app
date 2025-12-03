interface GeneratedPlanCardProps {
    plan: string;
}

export function GeneratedPlanCard({ plan }: GeneratedPlanCardProps) {
    return (
        <div className="flex w-full justify-start mb-4">
            <div className="w-full max-w-[90%] rounded-lg border-2 border-blue-400 bg-gray-300 p-4 text-gray-800 shadow-sm">
                <h3 className="mb-2 font-bold text-blue-700 uppercase text-xs tracking-wider">
                    Your Generated Plan:
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {plan}
                </p>
            </div>
        </div>
    )
}