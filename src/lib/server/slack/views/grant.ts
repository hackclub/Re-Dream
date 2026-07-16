import { env } from '$env/dynamic/private'
import type { GrantSchema } from '$lib/server/schemas/grant'
import { actions, blocks, button, context, header, image, section } from 'slack.ts'

function generateGrantButtons(grant: GrantSchema) {
	const buttonValue = JSON.stringify({
		r: grant.recordId,
		e: grant.email,
		a: grant.amount,
		p: !!grant.preAuth,
		u: grant.hcbUsage,
	})

	switch (grant.status) {
		case 'Under Review':
			return [
				button('approve').id('approve_grant').style('primary').value(buttonValue),
				button('reject').id('reject_grant').style('danger').value(buttonValue),
			]
		case 'Not Issued':
			return [
				button('issue').id('issue_grant').style('primary').value(buttonValue),
				button('unapprove').id('undo_grant').value(buttonValue),
			]
		case 'Active':
			return []
		case 'Rejected':
			return [button('unreject').id('undo_grant').value(buttonValue)]
		case 'Canceled':
			return []
	}
}

export function generateGrantMessage(grant: GrantSchema) {
	const amountFormatted = `$${grant.amount.toFixed(2)}`
	const buttons = generateGrantButtons(grant)

	return blocks(
		header(`new grant request for ${amountFormatted}`),
		context(
			image('pfp').url(`https://cachet.dunkirk.sh/users/${grant.slackId}/r`),
			`<@${grant.slackId}>`,
		),
		section(grant.usage),
		section().fields(
			`*user chips before purchase*\n${grant.chipsBefore || 'N/A'}`,
			`*chips cost*\n${grant.chips}`,
			`*user chips after purchase*\n${grant.chipsBefore ? grant.chipsBefore - grant.chips : 'N/A'}`,
			`*preauth enabled*\n${!!grant.preAuth}`,
		),
		section(grant.hcbUsage ? `hcb usage: ${grant.hcbUsage}` : 'hcb usage not set'),
		section(
			`status: ${grant.status.toLowerCase()}${grant.hcbId ? ` | hcb link: https://hcb.hackclub.com/grants/${grant.hcbId}` : ''}`,
		),
		actions(
			...buttons,
			button('airtable').url(
				`https://airtable.com/${env.AIRTABLE_BASE}/${env.AIRTABLE_GRANTS_TABLE}/${grant.recordId}`,
			),
		),
	)
}
