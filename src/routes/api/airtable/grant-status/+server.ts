import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'
import { slack } from '$lib/server/slack'
import { GrantSchema } from '$lib/server/schemas/grant'
import { generateGrantMessage } from '$lib/server/slack/views/grant'

export const POST: RequestHandler = async (request) => {
	if (request.request.headers.get('Authorization') !== `Bearer ${env.AIRTABLE_SECRET_KEY}`) {
		return error(401, 'no')
	}

	const data = await request.request.json()
	const grant = GrantSchema.parse(data)

	const formattedAmount = `$${grant.amount.toFixed(2)}`

	if (grant.status === 'Not Issued') {
		await slack
			.user(grant.slackId)
			.send(
				`:ultrafastparrot: your *${formattedAmount}* grant has been approved! it will soon be issued to you! :ultrafastparrot:`,
			)
		if (grant.grantMessageTs) {
			await slack
				.channel(env.SLACK_GRANTS_CHANNEL)
				.message(grant.grantMessageTs)
				.reply(`<@${grant.reviewerSlackId}> approved this grant.`)
		}
	} else if (grant.status === 'Active') {
		await slack
			.user(grant.slackId)
			.send(
				`your *${formattedAmount}* grant card has been issued. you can see it here: https://hcb.hackclub.com/grants/${grant.hcbId}. please make sure you only use it for: ${grant.hcbUsage}`,
			)
		if (grant.grantMessageTs) {
			await slack
				.channel(env.SLACK_GRANTS_CHANNEL)
				.message(grant.grantMessageTs)
				.reply(`grant issued: https://hcb.hackclub.com/grants/${grant.hcbId}`)
		}
	} else if (grant.status === 'Rejected') {
		await slack
			.user(grant.slackId)
			.send(
				`your *${formattedAmount}* grant has been rejected. your reviewer said: ${grant.comment}`,
			)
		if (grant.grantMessageTs) {
			await slack
				.channel(env.SLACK_GRANTS_CHANNEL)
				.message(grant.grantMessageTs)
				.reply(`<@${grant.reviewerSlackId}> rejected this grant. public comment: ${grant.comment}`)
		}
	} else if (grant.status === 'Canceled') {
		if (grant.grantMessageTs) {
			await slack
				.channel(env.SLACK_GRANTS_CHANNEL)
				.message(grant.grantMessageTs)
				.reply('grant has been canceled.')
		}
	} else if (grant.status === 'Under Review') {
		await slack
			.user(grant.slackId)
			.send(
				`your *${formattedAmount}* grant${grant.hcbId ? ` (https://hcb.hackclub.com/grants/${grant.hcbId})` : ''} has been reverted. a reviewer will follow up with you soon!`,
			)
		if (grant.grantMessageTs) {
			await slack
				.channel(env.SLACK_GRANTS_CHANNEL)
				.message(grant.grantMessageTs)
				.reply(`<@${grant.reviewerSlackId}> reverted this grant.`)
		}
	}

	if (grant.grantMessageTs) {
		await slack
			.channel(env.SLACK_GRANTS_CHANNEL)
			.message(grant.grantMessageTs)
			.edit({ blocks: generateGrantMessage(grant) })
	}

	return json({ success: true })
}
