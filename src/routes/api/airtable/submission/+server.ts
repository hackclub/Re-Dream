import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { slack } from '$lib/server/slack'
import { env } from '$env/dynamic/private'
import { actions, blocks, button, context, header, image, section } from 'slack.ts'
import { formatSeconds } from '$lib/utils/formatting'
import { error } from '@sveltejs/kit'
import { SubmissionSchema } from '$lib/server/schemas/submission'

export const POST: RequestHandler = async (request) => {
	if (request.request.headers.get('Authorization') !== `Bearer ${env.AIRTABLE_SECRET_KEY}`) {
		return error(401, 'no')
	}

	const data = await request.request.json()
	const submission = SubmissionSchema.parse(data)

	const buttonValue = JSON.stringify({
		r: submission.recordId,
		h: submission.hackatimeId,
		p: submission.hackatimeProjects,
		t: submission.submissionTime,
		a: submission.totalTime,
	})

	const user = await slack.user(submission.slackId)
	const pfp = user.profile.image_original || user.profile.image_192

	const message = await slack.channel(env.SLACK_REVIEWS_CHANNEL).send({
		text: 'new project submission',
		blocks: [
			...blocks(
				header(`new project submission: ${submission.name}`),
				context(...(pfp ? [image('pfp').url(pfp)] : []), `<@${submission.slackId}>`),
				section(submission.description).fields(
					`*hackatime projects*\n${submission.hackatimeProjects.join(', ')}`,
					`*submission time*\n${formatSeconds(submission.submissionTime)}`,
				),
				...(submission.isUpdate
					? [
							section(
								`*project is marked as an update!* total time (incl. this submission): ${formatSeconds(submission.totalTime)}. update description:\n${submission.updateDescription}`,
							),
						]
					: []),
				actions(
					button('code url').url(submission.codeUrl),
					button('playable url').url(submission.playableUrl),
					button('joe').url(`https://joe.fraud.hackclub.com/profile/${submission.hackatimeId}`),
					button('airtable').url(
						`https://airtable.com/${env.AIRTABLE_BASE}/${env.AIRTABLE_SUBMISSIONS_TABLE}/${submission.recordId}`,
					),
				),
				actions(
					button('approve').id('approve').style('primary').value(buttonValue),
					button('reject').id('reject').style('danger').value(buttonValue),
				),
			),
		],
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
