/**
 * A `fetch` wrapper that retries when the server responds with 429 (Too Many
 * Requests). Respects the `Retry-After` header when present, otherwise backs
 * off exponentially.
 */
export async function fetchWithRetry(
	input: RequestInfo | URL,
	init?: RequestInit,
	{ retries = 3, baseDelay = 1000 }: { retries?: number; baseDelay?: number } = {},
): Promise<Response> {
	let attempt = 0
	while (true) {
		const resp = await fetch(input, init)
		if (resp.status !== 429 || attempt >= retries) return resp

		const retryAfter = resp.headers.get('Retry-After')
		const delay =
			retryAfter && !isNaN(Number(retryAfter))
				? Number(retryAfter) * 1000
				: baseDelay * 2 ** attempt

		await new Promise((resolve) => setTimeout(resolve, delay))
		attempt++
	}
}
