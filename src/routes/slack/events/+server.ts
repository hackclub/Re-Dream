import { slack } from '$lib/server/slack'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async (request) => {
	return slack.receiver.fetch(request.request)
}
