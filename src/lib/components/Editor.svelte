<script>
    import { onMount, onDestroy } from 'svelte';

    let monaco; // Import monaco-editor library
    let container;
    let editor;
    let decorations = [];

    // Sample text
    let sample = `.data
x1: .word 100, 0x9FFF, 0b00101 # comment1

#comment 2

.text

main:
    LW x5, 0(x1)
    slli x6, x5, 2
    BEQ x7, x0, L1
    SW x6, 4(x1)
    SLLI x30, x31, 0x100
    SLT x7, x5, x6
    BLT x0, x5, L1
    BEQ x1, x2, L2
    
L1: SLL x10, x7, x6`

    onMount(async () => {
        monaco = await import('monaco-editor');

        // Register custom language for RISC-V
        monaco.languages.register({ id: 'riscv' });

        // Add custom tokens for syntax highlighting
        monaco.languages.setMonarchTokensProvider('riscv', {
            tokenizer: {
                root: [
                    // Keywords (only those required in our specs)
                    [/(lw|sw|slt|sll|slli|beq|blt)\b/i, 'keyword'],
                    // Registers
                    [/(x[0-9]|x[12][0-9]|x3[01]|ra|sp|gp|tp|t[0-6]|s[0-9]|s1[01]|a[0-7])\b/, 'variable'],
                    // Numeric literals
                    [/0x[0-9a-fA-F]+/, 'number.hex'],
                    [/-?\d+/, 'number'],
                    // Labels (identifiers)
                    [/[a-zA-Z_][a-zA-Z0-9_]*:/, 'label'],
                    // Comments
                    [/;.*$/, 'comment'],
                    // Whitespace
                    [/\s+/, 'white'],
                    // Directives
                    // TODO: Only .word is required (?)
                    [/(\.(text|data|globl|global|word|byte|half|align|extern))\b/i, 'directive'],
                ],
            },
        });

        // Define a custom theme
        monaco.editor.defineTheme('main-theme', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                // Add styling for assembler directive tokens
                { token: 'directive', foreground: '007acc', fontStyle: 'bold' },
                { token: 'label', foreground: '007acc', fontStyle: 'bold' }
            ],
            colors: {}, // Use colors inherited from vs-dark
        });

        // Instantiate the editor and bind to DOM element
        editor = monaco.editor.create(container, {
            value: sample,
            language: 'riscv',
            theme: 'main-theme'
        });
    })

    /** @returns The text currently stored in the editor */
    export const getValue = () => {
        return editor.getValue()
    }

    /** Clears highlight in the editor */
    export const clearHighlight = () => {
        // Clear previous decorations
    }

    /** @returns The text currently stored in the editor */
    export const setValue = (value) => {
        editor.setValue(value);
    }

    /** Highlights a specific line in the editor */
    export const highlightLine = (line) => {
        // Clear previous decorations if any
        decorations = editor.deltaDecorations(
            decorations,
            [
                {
                    range: new monaco.Range(line, 1, line, 1),
                    options: {
                        isWholeLine: true,
                        // Assigns a CSS class
                        className: 'editor--highlight',
                    },
                },
            ]
        );
    }

</script>

<div bind:this={container} style="width: 100%; height: 400px;"></div>
