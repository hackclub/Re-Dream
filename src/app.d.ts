// See https://svelte.dev/docs/kit/types#app.d.ts for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface HCAIdentity {
		identity: {
			id: string
			ysws_eligible: boolean
			first_name: string
			last_name: string
			primary_email: string
			slack_id: string
			phone_number: string
			birthday: string
			addresses: HCAAddress[]
		}
	}

	interface HCAAddress {
		id: string
		first_name: string
		last_name: string
		line_1: string
		line_2: string
		city: string
		state: string
		postal_code: string
		country: string
		phone_number?: string
		primary?: boolean
	}

	interface HackatimeProject {
		name: string
		total_seconds: number
		most_recent_heartbeat: string
		languages: string[]
		archived: boolean
	}
}

export {}
