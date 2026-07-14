import type { Action } from 'svelte/action'

/**
 * Svelte action: fades/slides an element in when it scrolls into view.
 * Pair with the `.reveal` / `.reveal.visible` classes in style.css.
 */
export const reveal: Action<HTMLElement, { threshold?: number } | undefined> = (node, options) => {
	const { threshold = 0.15 } = options ?? {}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible')
					observer.unobserve(entry.target)
				}
			}
		},
		{ threshold },
	)

	observer.observe(node)

	return {
		destroy() {
			observer.disconnect()
		},
	}
}
