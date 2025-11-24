<script>
	import favicon from '$lib/assets/favicon.png';

	import 'normalize.css'

	import "@fontsource/outfit";
	import "@fontsource/fira-code";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="stylesheet" href="./global.css" />
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<footer style="padding: 20px; text-align: center">
	<hr style="border: 1px dashed gray; margin-bottom: 40px;"/>
	<p>RISC-V Case project for <strong>CEPARCO: Multiprocessing and Parallel Computing</strong></p>
	<small>LLOVIT, Benn Erico ・ MARQUESES, Lorenz Bernard ・ SILVA, Paulo Grane Gabriel</small>
	<br /><br />
	<img src={favicon} style="width: 2em" />
</footer>
