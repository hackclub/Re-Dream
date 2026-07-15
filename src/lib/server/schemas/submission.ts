import z from 'zod'

export const SubmissionSchema = z.object({
	recordId: z.string().nonempty(),
	name: z.string().nonempty(),
	codeUrl: z.url().nonempty(),
	playableUrl: z.url().nonempty(),
	totalTime: z.int(),
	slackId: z.string().nonempty(),
	description: z.string().nonempty(),
	isUpdate: z.boolean(),
	updateDescription: z.string().nullable(),
	hackatimeId: z.int(),
	hackatimeProjects: z.string().array().nonempty(),
	submissionTime: z.int(),
	screenshot: z.string().array(),
	status: z.enum(['Approved', 'Pending', 'Rejected']).default('Pending'),
	comment: z.string().nullish(),
	justification: z.string().nullish(),
	reviewMessageTs: z.string().nullish(),
	reviewerSlackId: z.string().nullish(),
	timeAdjustment: z.int().nullish(),
})
