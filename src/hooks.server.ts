import type { Handle } from '@sveltejs/kit'
import { error } from '@sveltejs/kit'

const WEBHOOK_PATHS = ['/slack/events']

function isFormContentType(request: Request) {
	const type = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() ?? ''
	return ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'].includes(type)
}

export const handle: Handle = async ({ event, resolve }) => {
	const { request, url } = event

	const isWebhookPath = WEBHOOK_PATHS.some((p) => url.pathname.startsWith(p))

	const forbidden =
		!isWebhookPath &&
		isFormContentType(request) &&
		['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) &&
		request.headers.get('origin') !== url.origin

	if (forbidden) {
		return error(403, `Cross-site ${request.method} form submissions are forbidden`)
	}

	return resolve(event)
}
