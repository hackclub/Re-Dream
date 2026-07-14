import { env } from '$env/dynamic/private'
import { waitUntil } from '@vercel/functions'
import { App, blocks, header, R, richText, section } from 'slack.ts'
import { EXTERNAL_URL } from './config'

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
