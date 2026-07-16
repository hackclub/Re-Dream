import { env } from '$env/dynamic/private'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from '../submission/$types'
import { GrantSchema } from '$lib/server/schemas/grant'
import { slack } from '$lib/server/slack'
import { generateGrantMessage } from '$lib/server/slack/views/grant'

export const POST: RequestHandler = async (request) => {
	if (request.request.headers.get('Authorization') !== `Bearer ${env.AIRTABLE_SECRET_KEY}`) {
		return error(401, 'no')
	}

	const data = await request.request.json()
	const grant = GrantSchema.parse(data)

	const message = await slack.channel(env.SLACK_GRANTS_CHANNEL).send({
		text: 'new grant request',
		blocks: generateGrantMessage(grant),
	})

	return json({ success: true, ts: message.ts })
}
