import { env } from '$env/dynamic/private'
import { waitUntil } from '@vercel/functions'
import {
	App,
	blocks,
	header,
	input,
	numberInput,
	plain,
	plainTextInput,
	R,
	richText,
	section,
	type SubmissionInstance,
} from 'slack.ts'
import { EXTERNAL_URL } from '../config'

export const slack = new App({
	token: env.SLACK_BOT_TOKEN,
	receiver: { type: 'fetch', signingSecret: env.SLACK_SIGNING_SECRET, waitUntil },
})

slack.on('home', async (event) => {
	if (event.tab !== 'home') return

	const getUserUrl = new URL(`https://api.airtable.com/v0/${env.AIRTABLE_BASE}/Users?maxRecords=1`)
	getUserUrl.searchParams.set('filterByFormula', `{Slack ID}='${event.user}'`)
	const getUserResp = await fetch(getUserUrl, {
		headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}` },
	})
	if (!getUserResp.ok) {
		return event.respond({
			type: 'home',
			blocks: blocks(section('failed to load data from airtable')),
		})
	}

	const {
		records: [userRecord],
	} = await getUserResp.json()
	if (!userRecord) {
		return event.respond({
			type: 'home',
			blocks: blocks(
				header('Re-Dream'),
				section(
					`hey, welcome to <#${env.SLACK_MAIN_CHANNEL}>! it seems like you're not signed up yet. please go to <${EXTERNAL_URL}/auth/hackclub/redirect|this link> to sign up!`,
				),
			),
		})
	}

	const chips: number = userRecord.fields.Chips || 0

	await event.respond({
		type: 'home',
		blocks: blocks(
			header('Re-Dream'),
			section(
				`hey <@${event.user}>, welcome back to <#${env.SLACK_MAIN_CHANNEL}>! your current balance is *${chips}* chips.`,
			),
			section('resources:'),
			richText(
				R.list(
					R.section('help channel: ', R.channel(env.SLACK_HELP_CHANNEL || env.SLACK_MAIN_CHANNEL)),
					R.section(
						'bulletin channel: ',
						R.channel(env.SLACK_BULLETIN_CHANNEL || env.SLACK_MAIN_CHANNEL),
					),
					R.section('submit your project: ', R.link('https://forms.hackclub.com/re-dream-submit')),
					R.section('apply for a grant: ', R.link('https://forms.hackclub.com/re-dream-apply')),
				),
			),
		),
	})
})

function buildApproveModal(justification: string) {
	return blocks(
		input(plainTextInput().multiline().default(justification).id('value'))
			.label('internal justification')
			.hint("don't get jolly fined please")
			.id('justification'),
		input(numberInput().decimal().default(0).id('value'))
			.label('time adjustment (in hours)')
			.hint('negative to deflate')
			.id('adjustment'),
	)
}

slack.on('action:button.approve', async (event) => {
	if (event.event.container.type !== 'message') return

	const {
		h: hackatimeId,
		p: hackatimeProjects,
		t: submissionTime,
		a: totalTime,
	} = JSON.parse(event.value!) as { r: string; h: number; p: string[]; t: number; a: number }

	const startDate = env.HACKATIME_START_DATE.substring(0, 10)
	const endDate = new Date().toISOString().substring(0, 10)
	const submissionHours = (submissionTime / 3600).toFixed(1)

	let justification = `User has ${submissionHours}h tracked on Hackatime (user ID: ${hackatimeId}; projects: ${hackatimeProjects.join(', ')}) from ${startDate} to ${endDate}`
	if (submissionTime < totalTime) {
		const previousTime = totalTime - submissionTime
		const previousHours = (previousTime / 3600).toFixed(1)
		justification += ` (excluding ${previousHours}h spent on previous submissions of the same project)`
	}
	justification += `. Heartbeat pattern is consistent with active development. Commit history shows TODO commits, which is consistent with this scope.\nThis project is TODO. User is TODO-level because they have TODO per GitHub repos.\nThis project is deflated from ${submissionHours}h to TODO h because TODO, and the user has prior experience with this type of project.`

	await event.respond.modal({
		type: 'modal',
		callback_id: 'approve_modal',
		private_metadata: JSON.stringify({
			...JSON.parse(event.value!),
			ts: event.event.container.message_ts,
		}),
		title: plain('approve project').build(),
		submit: plain('approve').build(),
		close: plain('cancel').build(),
		blocks: buildApproveModal(justification),
	})
})

slack.on('submit.approve_modal', async (event) => {
	const { r: recordId, ts } = JSON.parse(event.view.private_metadata) as { r: string; ts: string }
	const values = (event as SubmissionInstance<ReturnType<typeof buildApproveModal>>).values

	const justification = values.justification.value.value
	const adjustment = (values.adjustment.value as { value: number }).value

	const resp = await fetch(
		`https://api.airtable.com/v0/${env.AIRTABLE_BASE}/Hackatime%20Projects/${recordId}`,
		{
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.AIRTABLE_PAT}` },
			body: JSON.stringify({
				fields: {
					Status: 'Approved',
					'Reviewer Slack ID': event.user.id,
					'Internal Justification': justification,
					'Public Comment': null,
					'Time Adjustment': adjustment * 3600,
				},
			}),
		},
	)
	if (!resp.ok) {
		return slack
			.channel(env.SLACK_REVIEWS_CHANNEL)
			.message(ts)
			.reply(`<@${event.user.id}>: failed to submit approval, please try again later`)
	}
})

function buildRejectModal() {
	return blocks(
		input(plainTextInput().multiline().id('value'))
			.label('comment to user')
			.hint(
				'this will be sent in the rejection message ("your project XYZ has been rejected. your reviewer said: ...")',
			)
			.id('comment'),
		input(plainTextInput().multiline().id('value'))
			.label('internal comment')
			.id('justification')
			.optional(),
	)
}

slack.on('action:button.reject', async (event) => {
	if (event.event.container.type !== 'message') return

	await event.respond.modal({
		type: 'modal',
		callback_id: 'reject_modal',
		private_metadata: JSON.stringify({
			...JSON.parse(event.value!),
			ts: event.event.container.message_ts,
		}),
		title: plain('reject project').build(),
		submit: plain('reject').build(),
		close: plain('cancel').build(),
		blocks: buildRejectModal(),
	})
})

slack.on('submit.reject_modal', async (event) => {
	const { r: recordId, ts } = JSON.parse(event.view.private_metadata) as { r: string; ts: string }
	const values = (event as SubmissionInstance<ReturnType<typeof buildRejectModal>>).values

	const justification = values.justification.value.value
	const comment = values.comment.value.value

	const resp = await fetch(
		`https://api.airtable.com/v0/${env.AIRTABLE_BASE}/Hackatime%20Projects/${recordId}`,
		{
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.AIRTABLE_PAT}` },
			body: JSON.stringify({
				fields: {
					Status: 'Rejected',
					'Reviewer Slack ID': event.user.id,
					'Internal Justification': justification || null,
					'Public Comment': comment,
				},
			}),
		},
	)
	if (!resp.ok) {
		return slack
			.channel(env.SLACK_REVIEWS_CHANNEL)
			.message(ts)
			.reply(`<@${event.user.id}>: failed to submit rejection, please try again later`)
	}
})

slack.on('action:button.undo', async (event) => {
	const { r: recordId } = JSON.parse(event.value!) as { r: string }

	const resp = await fetch(
		`https://api.airtable.com/v0/${env.AIRTABLE_BASE}/Hackatime%20Projects/${recordId}`,
		{
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.AIRTABLE_PAT}` },
			body: JSON.stringify({
				fields: {
					Status: 'Pending',
					'Reviewer Slack ID': event.event.user.id,
					'Time Adjustment': 0,
				},
			}),
		},
	)
	if (!resp.ok) {
		return event.respond.message({
			text: 'failed to undo, please try again later',
			ephemeral: true,
		})
	}
})
