// ABOUTME: InputHandler class that manages keyboard input and text events
// ABOUTME: Handles typing, backspace, special key events, and debounced search

import { DebounceHandler } from './DebounceHandler';

export class InputHandler {
    private text: string = '';
    private onTextChange: (text: string) => void;
    private onSpecialKey: (key: string) => void;
    private onSearchTrigger: (text: string) => void;
    private hiddenInput: HTMLInputElement;
    private debounceHandler: DebounceHandler;

    constructor(
        onTextChange: (text: string) => void,
        onSpecialKey: (key: string) => void,
        onSearchTrigger: (text: string) => void
    ) {
        this.onTextChange = onTextChange;
        this.onSpecialKey = onSpecialKey;
        this.onSearchTrigger = onSearchTrigger;
        this.debounceHandler = new DebounceHandler(2500);
        
        const input = document.getElementById('hiddenInput') as HTMLInputElement;
        if (!input) {
            throw new Error('Hidden input element not found');
        }
        this.hiddenInput = input;
        
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Canvas click to focus input
        const canvas = document.getElementById('articleCanvas');
        if (canvas) {
            canvas.addEventListener('click', () => {
                this.hiddenInput.focus();
            });
        }

        // Single input handler for both mobile and desktop
        this.hiddenInput.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.text = target.value;
            this.onTextChange(this.text);
            
            // Trigger debounced search
            this.debounceHandler.debounce(() => {
                this.onSearchTrigger(this.text);
            });
        });

        // Special keys only
        this.hiddenInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.onSpecialKey('Enter');
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.onSpecialKey('Tab');
            }
        });
    }


    getText(): string {
        return this.text;
    }

    setText(text: string): void {
        this.text = text;
        this.hiddenInput.value = text;
        this.onTextChange(this.text);
    }

    clear(): void {
        this.text = '';
        this.hiddenInput.value = '';
        this.onTextChange(this.text);
    }

    focus(): void {
        this.hiddenInput.focus();
    }

    cancelPendingSearch(): void {
        this.debounceHandler.clearPending();
    }
}