import { env } from '$env/dynamic/private'
import { EXTERNAL_URL } from '$lib/server/config'
import { slack } from '$lib/server/slack'
import { error, redirect, type ServerLoad } from '@sveltejs/kit'
import { SlackWebAPIPlatformError } from 'slack.ts'

export const GET: ServerLoad = async (request) => {
	const code = request.url.searchParams.get('code')
	const state = request.url.searchParams.get('state')
	if (!state || !code) return error(400, 'State or code not found')
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(state)) {
		return error(400, 'Malformed state')
	}

	const oauthResp = await fetch('https://hackatime.hackclub.com/oauth/token', {
		method: 'POST',
		body: new URLSearchParams({
			client_id: env.HACKATIME_CLIENT_ID,
			client_secret: env.HACKATIME_CLIENT_SECRET,
			redirect_uri: `${EXTERNAL_URL}/auth/hackatime/callback`,
			code,
			grant_type: 'authorization_code',
		}),
	})
	if (!oauthResp.ok) return error(500, 'Failed to get access token')
	const { access_token } = await oauthResp.json()

	const getUserUrl = new URL(`https://api.airtable.com/v0/${env.AIRTABLE_BASE}/Users?maxRecords=1`)
	getUserUrl.searchParams.set('filterByFormula', `{Auth State}='${state}'`)
	const getUserResp = await fetch(getUserUrl, {
		headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}` },
	})
	if (!getUserResp.ok) return error(500, 'Failed to get user info')
	const {
		records: [userRecord],
	} = await getUserResp.json()
	if (!userRecord) return error(400, 'Invalid state')
	const {
		id: airtableUserId,
		fields: { 'Slack ID': slackId },
	} = userRecord

	const hackatimeResp = await fetch('https://hackatime.hackclub.com/api/v1/authenticated/me', {
		headers: { Authorization: `Bearer ${access_token}` },
	})
	if (!hackatimeResp) return error(500, 'Failed to get hackatime info')
	const { id } = await hackatimeResp.json()

	const updateUserResp = await fetch(
		`https://api.airtable.com/v0/${env.AIRTABLE_BASE}/Users/${airtableUserId}`,
		{
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.AIRTABLE_PAT}` },
			body: JSON.stringify({
				fields: { 'Auth State': null, 'Hackatime Token': access_token, 'Hackatime ID': id },
			}),
		},
	)
	if (!updateUserResp.ok) return error(500, 'Failed to save user info')

	try {
		await slack.channel(env.SLACK_MAIN_CHANNEL).invite(slackId)
	} catch (e) {
		if (!(e instanceof SlackWebAPIPlatformError) || e.error !== 'already_in_channel') {
			throw e
		}
	}
	const dm = await slack.user(slackId).im()
	await dm.send(
		`hi, and welcome to <#${env.SLACK_MAIN_CHANNEL}>! i'll be sending you reminders when your projects and grants are reviewed.\n\nhelpful resources:\n* submit your project: https://forms.hackclub.com/re-dream-submit\n* apply for a grant: https://forms.hackclub.com/re-dream-apply\n* check your balance: slack://app?team=T0266FRGM&id=${env.SLACK_APP_ID}&tab=home`,
	)

	return redirect(307, `https://hackclub.enterprise.slack.com/archives/${dm.id}`)
}
