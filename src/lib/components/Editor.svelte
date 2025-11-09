<script>
    import { onMount, onDestroy } from 'svelte';

    let container;
    let editor;

    onMount(async () => {
        const monaco = await import('monaco-editor');

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
                    [/#.*$/, 'comment'],
                    // Whitespace
                    [/\s+/, 'white'],
                    // Directives
                    // TODO: Only .word is required (?)
                    [/(\.(text|data|global|word|byte|half|align|extern))\b/i, 'directive'],
                ],
            },
        });

        // Define a custom theme
        monaco.editor.defineTheme('main-theme', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                // Add styling for assembler directive tokens
                { token: 'directive', foreground: '007acc', fontStyle: 'bold' }
            ],
            colors: {}, // Use colors inherited from vs-dark
        });

        // Instantiate the editor and bind to DOM element
        editor = monaco.editor.create(container, {
            language: 'riscv',
            theme: 'main-theme'
        });
    })

    /** @returns The text currently stored in the editor */
    export const getValue = () => {
        return editor.getValue()
    }
</script>

<div bind:this={container} style="width: 100%; height: 400px;"></div>
