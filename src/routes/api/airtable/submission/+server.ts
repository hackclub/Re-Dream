import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import * as z from 'zod'
import { slack } from '$lib/server/slack'
import { env } from '$env/dynamic/private'
import { actions, blocks, button, context, header, image, section } from 'slack.ts'
import { formatSeconds } from '$lib/utils/formatting'

const RequestSchema = z.object({
	recordId: z.string().nonempty(),
	name: z.string().nonempty(),
	codeUrl: z.url().nonempty(),
	playableUrl: z.url().nonempty(),
	totalTime: z.int(),
	slackId: z.string().nonempty(),
	description: z.string().nonempty(),
	isUpdate: z.boolean(),
	updateDescription: z.string().nullable(),
	hackatimeId: z.int(),
	hackatimeProjects: z.string().array().nonempty(),
	submissionTime: z.int(),
	screenshot: z.string().array(),
})

export const POST: RequestHandler = async (request) => {
	const data = await request.request.json()
	const submission = RequestSchema.parse(data)

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
								`*project is marked as an update!*\ntotal time (incl. ship): ${formatSeconds(submission.totalTime)}\nupdate description:\n${submission.updateDescription}`,
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

	return json({ success: true })
}
