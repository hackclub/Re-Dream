import { env } from '$env/dynamic/private'
import type { SubmissionSchema } from '$lib/server/schemas/submission'
import { formatSeconds } from '$lib/utils/formatting'
import { actions, blocks, button, context, header, image, section } from 'slack.ts'

export function generateReviewMessage(submission: SubmissionSchema) {
	const buttonValue = JSON.stringify({
		r: submission.recordId,
		h: submission.hackatimeId,
		p: submission.hackatimeProjects,
		t: submission.submissionTime,
		a: submission.totalTime,
	})

	return blocks(
		header(`new project submission: ${submission.name}`),
		context(
			image('pfp').url(`https://cachet.dunkirk.sh/users/${submission.slackId}/r`),
			`<@${submission.slackId}>`,
		),
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
		...(submission.pastUnifiedHours?.length
			? [
					section(
						`*PROJECT IS PREVIOUSLY IN UNIFIED!* past ships unified hours: ${Array.from({
							length: Math.min(
								submission.pastUnifiedHours.length,
								submission.pastUnifiedYsws?.length || 0,
							),
						})
							.map(
								(_, i) => `${submission.pastUnifiedHours![i]} (${submission.pastUnifiedYsws![i]})`,
							)
							.join(', ')}. total: ${submission.pastUnifiedHours.reduce((a, b) => a + b, 0)} hours`,
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
			...(submission.status === 'Pending'
				? [
						button('approve').id('approve').style('primary').value(buttonValue),
						button('reject').id('reject').style('danger').value(buttonValue),
					]
				: [button(`undo ${submission.status.toLowerCase()}`).id('undo').value(buttonValue)]),
		),
	)
}
