import { env } from '$env/dynamic/private'
import { App } from 'slack.ts'

export const slack = new App({
	token: env.SLACK_BOT_TOKEN,
})
