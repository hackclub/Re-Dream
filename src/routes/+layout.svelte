<script lang="ts">
	import type { Snippet } from 'svelte'
	import '$lib/styles/style.css'
	import { reveal } from '$lib/reveal'

	let { children }: { children: Snippet } = $props()
</script>

{@render children()}

<footer class="reveal" use:reveal>
	<p>Made by Skylar and Jordan with as much love as we're legally allowed to give :3</p>
</footer>
