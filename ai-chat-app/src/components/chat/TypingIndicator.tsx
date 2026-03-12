export function TypingIndicator() {
    return (
        <div className="flex w-full mb-4">
            <div className="flex gap-1 items-center py-2 px-4">
                <div 
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" 
                    style={{ animationDelay: '0ms' }}
                />
                <div 
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" 
                    style={{ animationDelay: '150ms' }}
                />
                <div 
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" 
                    style={{ animationDelay: '300ms' }}
                />
            </div>
        </div>
    );
}