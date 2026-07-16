/* eslint-disable */

const {
	data: { add, update },
} = input.config()

const hackatimeTable = base.getTable('Hackatime Projects')

for (let i = 0; i < add.length; i += 50) {
	const batch = add.slice(i, i + 50)
	await hackatimeTable.createRecordsAsync(batch)
}

for (let i = 0; i < update.length; i += 50) {
	const batch = update.slice(i, i + 50)
	await hackatimeTable.updateRecordsAsync(batch)
}
