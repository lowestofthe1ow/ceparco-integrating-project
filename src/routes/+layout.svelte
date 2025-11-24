<script>
	import favicon from '$lib/assets/favicon.svg';

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
