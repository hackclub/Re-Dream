import { env } from '$env/dynamic/private'
import { SubmissionSchema } from '$lib/server/schemas/submission'
import { slack } from '$lib/server/slack'
import { generateReviewMessage } from '$lib/server/slack/views/review'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async (request) => {
	if (request.request.headers.get('Authorization') !== `Bearer ${env.AIRTABLE_SECRET_KEY}`) {
		return error(401, 'no')
	}

	const data = await request.request.json()
	const submission = SubmissionSchema.parse(data)

	const message = await slack.channel(env.SLACK_REVIEWS_CHANNEL).send({
		text: 'new project submission',
		blocks: generateReviewMessage(submission),
	})
	if (submission.screenshot) {
		await message.reply({
			blocks: submission.screenshot.map((s) => ({
				type: 'image',
				alt_text: 'screenshot',
				image_url: s,
			})),
		})
	}

	return json({ success: true, ts: message.ts })
}
