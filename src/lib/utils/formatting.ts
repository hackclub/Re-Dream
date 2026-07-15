export function formatSeconds(seconds: number) {
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor(seconds / 60) % 60

	if (hours) return `${hours}h ${minutes}m`
	return `${minutes}m`
}
