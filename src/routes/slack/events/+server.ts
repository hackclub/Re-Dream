import { slack } from '$lib/server/slack'
import type { ServerLoad } from '@sveltejs/kit'

export const POST: ServerLoad = async (request) => {
	return slack.receiver.fetch(request.request)
}
