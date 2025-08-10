// ABOUTME: DebounceHandler utility class for delaying function execution
// ABOUTME: Prevents excessive API calls by waiting for user to stop typing

export class DebounceHandler {
    private timeoutId: number | null = null;
    private delay: number;

    constructor(delay: number = 2500) {
        this.delay = delay;
    }

    debounce(callback: () => void): void {
        this.clearPending();
        this.timeoutId = window.setTimeout(() => {
            callback();
            this.timeoutId = null;
        }, this.delay);
    }

    clearPending(): void {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    isPending(): boolean {
        return this.timeoutId !== null;
    }
}