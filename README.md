<div align="center">
    <h1>CEPARCO Integrating Project: Simplified RISC-V Simulator</h1>
    <p>LLOVIT, Benn Erico ・ MARQUESES, Lorenz Bernard ・ SILVA, Paulo Grane Gabriel</p>
</div>

The application may be accessed [here](https://lowestofthe1ow.github.io/ceparco-integrating-project/).

A demo video may be viewed [here](https://drive.google.com/file/d/1ynbkoh1QwuF1toIZbrdjQcD_8ES4Jj3h/view?usp=sharing).

## Design methodology

**Supported instructions:** `LW`, `SW`, `SLT`, `SLL`, `SLLI`, `BEQ`, `BLT` <br />
**`.data` directives**: `.word` <br />
**Structural**: Separate memory (program from `0x80` to `0xFF`; data from `0x00` to `0x7F`) <br />
**Data**: No forwarding <br />
**Control**: Modified pipeline ("Pipeline #2")

We used [SvelteKit](https://svelte.dev/) with its static adapter to create the webpage, which is a single-page application. The application's Node.js `src/` directory is shown below. We created separate Svelte components for the different GUI elements as well as methods for each of the supported instructions, placed in separate modules in `src/lib/riscv`.

```
.
├── src
│   ├── app.html
│   ├── lib
│   │   ├── assets
│   │   │   └── favicon.svg
│   │   ├── components
│   │   │   ├── Editor.svelte
│   │   │   ├── InstructionViewer.svelte
│   │   │   ├── MemoryViewer.svelte
│   │   │   ├── PipelineMapViewer.svelte
│   │   │   ├── PipelineRegisterViewer.svelte
│   │   │   └── RegisterViewer.svelte
│   │   ├── helpers
│   │   │   └── hex.js
│   │   └── riscv
│   │       ├── instructions
│   │       │   ├── beq.js
│   │       │   ├── blt.js
│   │       │   ├── lw.js
│   │       │   ├── slli.js
│   │       │   ├── sll.js
│   │       │   ├── slt.js
│   │       │   └── sw.js
│   │       ├── instructions.js
│   │       ├── memory.svelte.js
│   │       ├── pipeline.svelte.js
│   │       ├── riscv.js
│   │       └── state.svelte.js
│   └── routes
│       ├── +layout.js
│       ├── +layout.svelte
│       ├── +page.js
│       └── +page.svelte
├── static
│   ├── global.css
│   └── robots.txt
```

Program execution is performed per cycle. The **Run (step)** button will execute one cycle, while the **Run (full)** button will repeatedly execute cycles until there are no instructions left. (`IR == 0x00`). Each cycle follows the RISC-V pipelining algorithm (Pipeline #2, i.e., the variant that checks for branch during the decode stage) for each stage. However, it works **backwards** (we start with WB, then MEM, and so on) so that it can properly _pipe_ the previous values of the pipeline registers.

SvelteKit manages to streamline how we present the frontend for the application due to its ability to use _reactive_ objects. For instance, memory is treated as a 256-element array (to support address locations `0x0000` to `0x00FF`, although this address space is not fully used by the simulator. General-purpose and pipelining registers are stored as dictionary objects. The state of these objects are maintained globally, and any time a single component updates them, changes are reflected across the entire system.

We also found considerable difficulty with constructing the pipeline map. To account for **loops**, we simplify the process by dynamically updating the map every cycle. **A row is added for every instruction fetched, instead of having a fixed number of rows based on the length of the program**. This allows us to easily update each row per stage.

## Milestones 1 and 2

### Updates (20 November 2025)
We have implemented a GUI to display registers and memory. Clicking "run" will assemble the program. Clicking "step" will run an instruction in sequence. Currently, the pipeline roughly supports initial execution up to EX/MEM.ALUOUT.

[Short demo video](https://drive.google.com/file/d/1ZMur02V1XTQILYaj5C6t2zaHj93UWbPY/view?usp=sharing)

### Updates (13 November 2025)

[Short demo video](https://drive.google.com/file/d/1CNoDc2ll5lurYX4iQ_8idGqS7uOwHeM4/view?usp=sharing)

We have implemented error checking and parsing the subset of RISC-V instructions assigned to our group, and have implemented registers and memory. Clicking "run" will now also place the relevant opcodes for the instructions into memory, starting at address `0x0080`.
