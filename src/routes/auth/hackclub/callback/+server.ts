import { env } from '$env/dynamic/private'
import { EXTERNAL_URL } from '$lib/server/config'
import { fetchWithRetry } from '$lib/utils/fetch'
import { error, redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async (request) => {
	const code = request.url.searchParams.get('code')
	if (!code) return error(400, 'No code specified')

	const oauthResp = await fetch('https://auth.hackclub.com/oauth/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			client_id: env.HCA_CLIENT_ID,
			client_secret: env.HCA_CLIENT_SECRET,
			redirect_uri: `${EXTERNAL_URL}/auth/hackclub/callback`,
			code,
			grant_type: 'authorization_code',
		}),
	})
	if (!oauthResp.ok) return error(500, 'Failed to get access token')
	const { access_token } = await oauthResp.json()

	const profileResp = await fetch('https://auth.hackclub.com/api/v1/me', {
		headers: { Authorization: `Bearer ${access_token}` },
	})
	if (!profileResp.ok) return error(500)
	const {
		identity: {
			id,
			ysws_eligible,
			primary_email,
			first_name,
			last_name,
			slack_id,
			addresses,
			birthday,
			phone_number,
		},
	} = (await profileResp.json()) as HCAIdentity

	if (!ysws_eligible) {
		return new Response(
			"You are not eligible for Hack Club YSWS, or you haven't verified your identity yet. Visit https://auth.hackclub.com/verifications/new to verify your identity and login again!",
		)
	}
	const address = addresses.find((a) => a.primary) || addresses[0]
	if (!address) {
		return new Response(
			"You don't have an address configured on Hack Club Auth. Add one in https://auth.hackclub.com/addresses and login again!",
		)
	}

	const authState = crypto.randomUUID()

	const airtableResp = await fetchWithRetry(`https://api.airtable.com/v0/${env.AIRTABLE_BASE}/Users`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.AIRTABLE_PAT}` },
		body: JSON.stringify({
			performUpsert: { fieldsToMergeOn: ['Hack Club ID'] },
			records: [
				{
					fields: {
						'Hack Club ID': id,
						'Auth State': authState,
						Email: primary_email,
						'First Name': first_name,
						'Last Name': last_name,
						'Slack ID': slack_id,
						'Shipping First Name': address.first_name,
						'Shipping Last Name': address.last_name,
						'Shipping Phone Number': address.phone_number,
						'Address (Line 1)': address.line_1,
						'Address (Line 2)': address.line_2,
						City: address.city,
						'State / Province': address.state,
						'ZIP / Postal Code': address.postal_code,
						Country: address.country,
						Birthday: birthday,
						'Phone Number': phone_number,
					},
				},
			],
		}),
	})
	if (!airtableResp.ok) {
		return error(500, 'Failed to store user info')
	}

	const hackatimeUrl = new URL(
		'https://hackatime.hackclub.com/oauth/authorize?response_type=code&scope=profile+read',
	)
	hackatimeUrl.searchParams.set('client_id', env.HACKATIME_CLIENT_ID)
	hackatimeUrl.searchParams.set('redirect_uri', `${EXTERNAL_URL}/auth/hackatime/callback`)
	hackatimeUrl.searchParams.set('state', authState)
	return redirect(307, hackatimeUrl)
}
