<script lang="ts">
	import { resolve } from '$app/paths'
	import { reveal } from '$lib/reveal'
</script>

<svelte:head>
	<title>Re-Dream</title>
</svelte:head>

<header class="top-header">
	<div class="header-content"></div>
</header>

<div class="content">
	<img src="/images/decorations/bob1.png" alt="" class="bob-decoration bob-1a" />
	<img src="/images/decorations/bob1.png" alt="" class="bob-decoration bob-1b" />
	<img src="/images/decorations/bob1.png" alt="" class="bob-decoration bob-1c" />
	<img src="/images/decorations/bob2.png" alt="" class="bob-decoration bob-2a" />
	<img src="/images/decorations/bob2.png" alt="" class="bob-decoration bob-2b" />
	<img src="/images/decorations/bob3.png" alt="" class="bob-decoration bob-3a" />
	<img src="/images/decorations/bob3.png" alt="" class="bob-decoration bob-3b" />
	<img src="/images/decorations/bob4.png" alt="" class="bob-decoration bob-4a" />
	<img src="/images/decorations/bob4.png" alt="" class="bob-decoration bob-4b" />

	<section class="hero">
		<!-- <img src="/images/sections/sponsor_text.png" alt="Sponsors" class="sponsors-img"> -->
		<img src="/images/ui/Logo.png" alt="Re-Dream" class="hero-logo reveal" use:reveal />
		<div class="button-group reveal reveal-delay-2" use:reveal>
			<a
				href="https://rsvp.soon.it/re-dream"
				class="img-btn rsvp-button"
				target="_blank"
				rel="noopener noreferrer"><img src="/images/ui/RSVP.png" alt="RSVP" /></a
			>
			<a href={resolve('/faq')} class="img-btn faq-button"
				><img src="/images/ui/faq.png" alt="FAQ" /></a
			>
		</div>
	</section>

	<section class="about-section reveal" use:reveal>
		<img
			src="/images/sections/hourMsg.png"
			alt="How does the budget work? Every 10 hours of code earns you 500 chips to spend on your project"
			class="about-message-img"
		/>
	</section>

	<section class="ship-section">
		<img
			src="/images/sections/Ship_message.png"
			alt="What can you ship? Any game at all!"
			class="ship-header-img reveal"
			use:reveal
		/>
		<div class="cards-container reveal reveal-delay-2" use:reveal>
			<div class="card var-card">
				<img src="/images/sections/var-1.png" alt="Variety 1" class="var-card-img" />
			</div>
			<div class="card var-card">
				<img src="/images/sections/var-4.png" alt="Variety 2" class="var-card-img" />
			</div>
			<div class="card var-card">
				<img src="/images/sections/var-3.png" alt="Variety 3" class="var-card-img" />
			</div>
		</div>
	</section>

	<section class="chips-section">
		<img
			src="/images/sections/Budget_message.png"
			alt="Every 10 hour devlog you ship you get 500 chips added to your budget! You can use your chips to get things that will improve your game: artist commissions, libraries, tools, or even a Steam publishing key. It's simple: log hours, earn chips, then spend those chips making your dream game just as good as you've imagined!"
			class="budget-header-img reveal"
			use:reveal
		/>

		<div class="chips-flow reveal reveal-delay-2" use:reveal>
			<img
				src="/images/sections/Log_10hrs.png"
				alt="Log 10 Hours - Submit a devlog every 10 hours"
				class="chips-step-img"
			/>
			<div class="chips-arrow"></div>
			<img
				src="/images/sections/Earn_500.png"
				alt="Earn 500 Chips - Gets added to your budget after your devlog is approved"
				class="chips-step-img"
			/>
			<div class="chips-arrow"></div>
			<img
				src="/images/sections/Apply_grants.png"
				alt="Apply for Grants - Spend chips on whatever you want for your project"
				class="chips-step-img"
			/>
		</div>

		<div class="grants-grid reveal reveal-delay-3" use:reveal>
			<img
				src="/images/sections/commission_art.png"
				alt="Commission Art - Get it looking just right"
				class="grant-img"
			/>
			<img
				src="/images/sections/Buy_libraries.png"
				alt="Buy Libraries - Makes your life a lot easier when coding"
				class="grant-img"
			/>
			<img
				src="/images/sections/Steam_publishing.png"
				alt="Steam Publishing - You can spend 1000 chips to publish your game on Steam"
				class="grant-img steam-img"
			/>
		</div>
	</section>

	<section class="stickers-section reveal" use:reveal>
		<img
			src="/images/sections/Stickers.png"
			alt="And Stickers! You won't receive anything until you ship your first 10 hour devlog, but after you do, not only will you get 500 chips, but you will also get an EXCLUSIVE STICKER SHEET!!"
			class="stickers-img"
		/>
	</section>

	<section class="demo-section reveal" use:reveal>
		<div class="demo-container">
			<div class="demo-text">
				<img
					src="/images/sections/demo_message.png"
					alt="Check out the demo project! You could submit this!"
					class="demo-message-img"
				/>
			</div>
			<div class="demo-image">
				<a
					href="https://bolb2019.itch.io/just-beats-and-dungeons"
					target="_blank"
					rel="noopener noreferrer"
					><img src="/images/sections/demo-screenshot.png" alt="Demo Game Project" /></a
				>
			</div>
		</div>
	</section>

	<section class="cta">
		<div class="cta-wrapper reveal" use:reveal>
			<img src="/images/ui/CTA.png" alt="Call to Action" class="cta-image" />
			<a
				href="https://rsvp.soon.it/re-dream"
				class="img-btn cta-rsvp-button"
				target="_blank"
				rel="noopener noreferrer"><img src="/images/ui/RSVP.png" alt="RSVP" /></a
			>
		</div>
	</section>
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
