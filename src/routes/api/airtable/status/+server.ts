import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'
import { SubmissionSchema } from '$lib/server/schemas/submission'
import { slack } from '$lib/server/slack'

export const POST: RequestHandler = async (request) => {
	if (request.request.headers.get('Authorization') !== `Bearer ${env.AIRTABLE_SECRET_KEY}`) {
		return error(401, 'no')
	}

	const data = await request.request.json()
	const submission = SubmissionSchema.parse(data)

	if (submission.status === 'Approved') {
		await slack
			.user(submission.slackId)
			.send(`:yayayayayay: your project *${submission.name}* has been approved! :yayayayayay:`)
		if (submission.reviewMessageTs) {
			const hourAdjustment = ((submission.timeAdjustment || 0) / 3600).toFixed(1)
			await slack
				.channel(env.SLACK_REVIEWS_CHANNEL)
				.message(submission.reviewMessageTs)
				.reply(
					`<@${submission.reviewerSlackId}> approved this project with hour adjustment: ${hourAdjustment}. justification:\n${submission.justification}`,
				)
		}
	} else if (submission.status === 'Rejected') {
		await slack
			.user(submission.slackId)
			.send(
				`your project *${submission.name}* has been rejected. your reviewer said: ${submission.comment}\n\nfix your project and resubmit!`,
			)
		if (submission.reviewMessageTs) {
			await slack
				.channel(env.SLACK_REVIEWS_CHANNEL)
				.message(submission.reviewMessageTs)
				.reply(
					`<@${submission.reviewerSlackId}> rejected this project. comment to user: ${submission.comment}\n\ninternal comment: ${submission.justification}`,
				)
		}
	}

	return json({ success: true })
}
