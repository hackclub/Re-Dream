import { env } from '$env/dynamic/private'
import { redirect, type ServerLoad } from '@sveltejs/kit'

export const GET: ServerLoad = async () => {
	const url = new URL(
		'https://auth.hackclub.com/oauth/authorize?response_type=code&scope=name+birthdate+address+verification_status+basic_info',
	)
	url.searchParams.set('client_id', env.HCA_CLIENT_ID)
	url.searchParams.set('redirect_uri', `${env.EXTERNAL_URL}/auth/hackclub/callback`)
	return redirect(307, url)
}
