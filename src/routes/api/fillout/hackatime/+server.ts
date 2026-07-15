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

	const url = new URL(`https://api.airtable.com/v0/${env.AIRTABLE_BASE}/Hackatime%20Projects`)
	url.searchParams.set('filterByFormula', `{Hackatime User ID}=${hackatimeId}`)
	url.searchParams.append('fields', 'Name')
	url.searchParams.append('fields', 'Time')
	const { records: existingProjects } = await fetch(url, {
		headers: { Authorization: `Bearer ${env.AIRTABLE_PAT}` },
	}).then((r) => r.json())

	const existingMap = Object.fromEntries(
		existingProjects.map((p: { id: string; fields: { Name: string } }) => [p.fields.Name, p]),
	)

	const toAdd = []
	const toUpdate = []

	for (const project of projects) {
		if (existingMap[project.name]) {
			toUpdate.push({
				id: existingMap[project.name].id,
				fields: { Time: project.total_seconds },
			})
		} else {
			toAdd.push({
				fields: {
					Name: project.name,
					Time: project.total_seconds,
					'Hackatime User ID': hackatimeId,
				},
			})
		}
	}

	const updateResp = await fetch(env.AIRTABLE_UPDATE_HACKATIME_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ add: toAdd, update: toUpdate }),
	})
	if (!updateResp.ok) {
		return json({
			success: false,
			message: 'Failed to update your Hackatime data. Please try again later.',
		})
	}

	return json({ success: true, message: '' })
}
