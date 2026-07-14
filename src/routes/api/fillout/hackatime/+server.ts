import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'

export const GET: RequestHandler = async (request) => {
	if (request.request.headers.get('Authorization') !== `Bearer ${env.FILLOUT_SECRET_KEY}`) {
		return error(401, 'no')
	}

	const hackatimeId = Number(request.url.searchParams.get('id'))
	const hackatimeToken = request.url.searchParams.get('token')

	if (!hackatimeId || !hackatimeToken || isNaN(hackatimeId)) {
		return json({
			success: false,
			message:
				"You didn't link your Hackatime yet. Please complete the sign up form, then try again!",
		})
	}

	const resp = await fetch(
		`https://hackatime.hackclub.com/api/v1/authenticated/projects?start=${env.HACKATIME_START_DATE}`,
		{
			headers: { Authorization: `Bearer ${hackatimeToken}` },
		},
	)
	if (!resp.ok) {
		return json({
			success: false,
			message: 'Failed to fetch your data from Hackatime. Please try again later.',
		})
	}
	const { projects } = (await resp.json()) as { projects: HackatimeProject[] }

	for (let i = 0; i < projects.length; i += 10) {
		const batch = projects.slice(i, i + 10)
		const airtableResp = await fetch(
			`https://api.airtable.com/v0/${env.AIRTABLE_BASE}/Hackatime%20Projects`,
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${env.AIRTABLE_PAT}`,
				},
				body: JSON.stringify({
					performUpsert: { fieldsToMergeOn: ['Name', 'Hackatime User ID'] },
					records: batch.map((p) => ({
						fields: {
							Name: p.name,
							Time: p.total_seconds,
							'Hackatime User ID': hackatimeId,
						},
					})),
				}),
			},
		)
		if (!airtableResp.ok) {
			console.log(await airtableResp.text())
			return json({
				success: false,
				message: 'Failed to update your data from Hackatime. Please try again later.',
			})
		}
	}

	return json({ success: true, message: '' })
}
