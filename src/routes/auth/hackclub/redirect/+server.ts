import { env } from '$env/dynamic/private'
import { EXTERNAL_URL } from '$lib/server/config'
import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
	const url = new URL(
		'https://auth.hackclub.com/oauth/authorize?response_type=code&scope=name+birthdate+address+verification_status+basic_info',
	)
	url.searchParams.set('client_id', env.HCA_CLIENT_ID)
	url.searchParams.set('redirect_uri', `${EXTERNAL_URL}/auth/hackclub/callback`)
	return redirect(307, url)
}
