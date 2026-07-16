import z from 'zod'

export const GrantSchema = z.object({
	recordId: z.string(),
	amount: z.float64(),
	usage: z.string(),
	chipsBefore: z.int().nullish(),
	chips: z.int(),
	slackId: z.string(),
	status: z
		.enum(['Under Review', 'Not Issued', 'Active', 'Canceled', 'Rejected'])
		.default('Under Review'),
	hcbId: z.string().nullish(),
	grantMessageTs: z.string().nullish(),
	reviewerSlackId: z.string().nullish(),
	hcbUsage: z.string().nullish(),
	comment: z.string().nullish(),
	email: z.string(),
	preAuth: z.boolean().nullish(),
})
export type GrantSchema = z.infer<typeof GrantSchema>
