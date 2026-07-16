import { env } from '$env/dynamic/private'

export async function getHCBAccessToken() {
	const getResp = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/storage/kv/namespaces/${env.CF_KV_NAMESPACE}/bulk/get`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.CF_API_TOKEN}` },
			body: JSON.stringify({ keys: ['hcb_token'], type: 'json' }),
		},
	)
	if (!getResp.ok) throw new Error('Failed to get HCB tokens')
	const {
		result: {
			values: {
				hcb_token: { access_token, refresh_token: refresh, expiry },
			},
		},
	} = (await getResp.json()) as {
		result: {
			values: { hcb_token: { access_token: string; refresh_token: string; expiry: number } }
		}
	}

	if (Date.now() > expiry * 1000) {
		const refreshResp = await fetch('https://hcb.hackclub.com/api/v4/oauth/token', {
			method: 'POST',
			body: new URLSearchParams({
				refresh_token: refresh,
				grant_type: 'refresh_token',
				client_id: env.HCB_CLIENT_ID,
				client_secret: env.HCB_CLIENT_SECRET,
			}),
		})
		if (!refreshResp.ok) throw new Error('Failed to refresh HCB token')

		const data = await refreshResp.json()
		const { access_token, refresh_token, created_at, expires_in } = data as {
			access_token: string
			refresh_token: string
			created_at: number
			expires_in: number
		}
		const expiry = created_at + expires_in

		const putResp = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/storage/kv/namespaces/$${env.CF_KV_NAMESPACE}/bulk`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${env.CF_API_TOKEN}`,
				},
				body: JSON.stringify([
					{ key: 'hcb_token', value: JSON.stringify({ access_token, refresh_token, expiry }) },
				]),
			},
		)
		if (!putResp.ok) throw new Error('Failed to save HCB tokens')

		return access_token
	}

	return access_token
}
