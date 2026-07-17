<script lang="ts">
	import '$lib/styles/faq.css'
	import { resolve } from '$app/paths'
	import { reveal } from '$lib/reveal'
</script>

<svelte:head>
	<title>Re-Dream FAQ</title>
	<link rel="icon" type="image/png" href="/images/decorations/bob3.png" />
</svelte:head>

<header class="top-header faq-top-header">
	<div class="header-content"></div>
</header>

<div class="content">
	<!-- Decorative Bobs -->
	<img src="/images/decorations/bob1.png" alt="" class="bob-decoration bob-1a" />
	<img src="/images/decorations/bob2.png" alt="" class="bob-decoration bob-2a" />
	<img src="/images/decorations/bob3.png" alt="" class="bob-decoration bob-3a" />

	<div class="back-btn-wrap reveal" use:reveal>
		<a href={resolve('/')} class="back-btn"
			><img src="/images/ui/return_button.png" alt="Back to Re-Dream" /></a
		>
	</div>

	<div class="faq-hero reveal" use:reveal>
		<img src="/images/faq/Faq_header.png" alt="FAQ" />
	</div>

	<div class="faq-container">
		<!-- General -->
		<div class="faq-category reveal" use:reveal>
			<img src="/images/faq/Faq_general.png" alt="General" class="faq-category-img" />
			<img src="/images/faq/Faq_4.png" alt="What is Re-Dream?" class="faq-item-img" />
			<img src="/images/faq/Faq_1.png" alt="When does Re-Dream start?" class="faq-item-img" />
			<img src="/images/faq/Faq_2.png" alt="Who can participate?" class="faq-item-img" />
			<img src="/images/faq/Faq_3.png" alt="And all of this is free?" class="faq-item-img" />
			<img src="/images/faq/Faq_5.png" alt="How do I track my time?" class="faq-item-img" />
		</div>

		<!-- Projects -->
		<div class="faq-category reveal reveal-delay-1" use:reveal>
			<img src="/images/faq/Faq_projects.png" alt="Projects" class="faq-category-img" />
			<img src="/images/faq/Faq_10.png" alt="What if I'm new to coding?" class="faq-item-img" />
			<img src="/images/faq/Faq_9.png" alt="What can I make?" class="faq-item-img" />
			<img
				src="/images/faq/Faq_8.png"
				alt="Can I make more than one project?"
				class="faq-item-img"
			/>
			<img
				src="/images/faq/Faq_7.png"
				alt="Can I submit an existing project?"
				class="faq-item-img"
			/>
			<img
				src="/images/faq/Faq_6.png"
				alt="Does my code have to be open source?"
				class="faq-item-img"
			/>
		</div>

		<!-- Other -->
		<div class="faq-category reveal reveal-delay-2" use:reveal>
			<img src="/images/faq/Faq_other.png" alt="Other" class="faq-category-img" />
			<img src="/images/faq/Faq_11.png" alt="Can I use AI?" class="faq-item-img" />
			<img
				src="/images/faq/Faq_12.png"
				alt="Can I submit to another hack club program?"
				class="faq-item-img"
			/>
			<img
				src="/images/faq/Faq_13.png"
				alt="Can I get involved or contribute?"
				class="faq-item-img"
			/>
		</div>

		<!-- Help Banner -->
		<div class="help-banner reveal" use:reveal>
			<img src="/images/faq/Help.png" alt="Still have questions? Reach out in #re-dream-help." />
		</div>
	</div>
</div>

<style>
	:global(body) {
		background:
			linear-gradient(
				to bottom,
				rgba(224, 213, 240, 1) 0%,
				rgba(224, 213, 240, 1) 30%,
				transparent 0%
			),
			url('/images/backgrounds/bgg2.png');
		background-size:
			30% auto,
			cover;
		background-position: top, center;
		background-attachment: scroll, scroll;
		background-blend-mode: multiply;
	}
</style>
