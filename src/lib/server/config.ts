import { env } from '$env/dynamic/private'

export const EXTERNAL_URL =
	env.EXTERNAL_URL || `https://${env.VERCEL_URL}` || 'https://re-dream.hackclub.com'
