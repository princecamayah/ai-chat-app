import { useChatStore } from '../../stores/chatStore'

export function ActionButtons() {
    const setPhase = useChatStore((state) => state.setPhase);

    const handleEdit = () => {
        setPhase('discovery');
    }

    const handleApprove = () => {
        alert("Approve logic coming soon!")
    }

    return (
        <div className="flex w-full gap-4">
            <button
                className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 font-medium"
                onClick={handleApprove}
            >
                Approve & Get Answer
            </button>

            <button
                className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-md hover:bg-blue-200 font-medium"
                onClick={handleEdit}
            >
                Edit Plan
            </button>
        </div>
    )
}