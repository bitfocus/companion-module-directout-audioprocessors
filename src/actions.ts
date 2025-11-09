import { CompanionActionContext, CompanionActionDefinitions, CompanionActionEvent } from '@companion-module/base'
import { DirectoutInstance } from './main.js'
import { PrevNextChoices } from './utils.js'
import { deviceTables } from './capabilities.js'

export function returnActionDefinitions(self: DirectoutInstance): CompanionActionDefinitions {
	const actions: CompanionActionDefinitions = {
		set_custom_value: {
			name: 'Set Custom Value',
			options: [
				{
					id: 'path',
					type: 'textinput',
					label: 'Path',
					default: '/',
					useVariables: { local: true },
					tooltip: `Path must start with a forward slash and every segment is divided by a slash.`,
				},
				{
					id: 'value',
					type: 'textinput',
					label: 'Value',
					default: '',
					useVariables: { local: true },
					tooltip: `Value must be in JSON value notation, that means a string must be enclosed in double quotes.`,
				},
			],
			callback: async (event, context) => {
				const path = await context.parseVariablesInString(`${event.options.path}`)
				const valuestr = await context.parseVariablesInString(`${event.options.value}`)
				if (!path.match(/^(\/[a-zA-Z0-9_-]+)+$/)) {
					self.log('error', `Path: ${path} of custom set action is not a valid path format.`)
					return
				}
				let value
				try {
					value = JSON.parse(valuestr)
				} catch (_error) {
					self.log('error', `Value: ${valuestr} of custom set action is not a valid value format.`)
					return
				}
				if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
					self.log(
						'error',
						`Value: ${valuestr} of custom set action is not a type that can be used. Only string, number and boolean are allowed.`,
					)
					return
				}
				const currentValue = self.getState(path)
				if (currentValue === undefined) {
					self.log('error', `Path ${path} can't be found on the device. Custom set not possible.`)
					return
				}
				if (typeof currentValue !== typeof value) {
					self.log(
						'error',
						`Path ${path} requires type ${typeof currentValue} but custom value is of type ${typeof value}. Custom set not possible.`,
					)
					return
				}
				self.sendSetCmd(path, value)
			},
			learn(action, _context) {
				return { ...action.options, path: self.lastChange.path, value: JSON.stringify(self.lastChange.value) }
			},
		},

		snapshot_recall_id: {
			name: 'Recall Snapshot by ID',
			options: [
				{
					id: 'snapshot',
					type: 'dropdown',
					label: 'Snapshot',
					default: '',
					choices: Array.from({ length: 99 }, (_, i) => self.getState(`/snapshots/${i}`))
						.map((snap, i) => ({
							label: `${snap.name}`,
							id: i,
							valid: snap.valid,
							position: Number(snap.position),
						}))
						.filter((snap) => snap.valid)
						.sort((a, b) => a.position - b.position) // a.label.localeCompare(b.label))
						.map((snap) => ({ label: snap.label, id: snap.id })),
					tooltip: `The ID is an internal number that keeps assigned to the snapshot even if you rename or reposition the snapshot. In the selection you see the current name.`,
				},
			],
			callback: async (event, _context) => {
				self.sendCmd({ type: 'cmd', payload: `recall_snapshot_${event.options.snapshot}` })
			},
			learn(action, _context) {
				const snapshot = self.getState('/last_snapshot_recalled')
				if (typeof snapshot === 'number' && snapshot >= 0) {
					return { ...action.options, snapshot }
				} else return {}
			},
		},
		snapshot_recall_pos: {
			name: 'Recall Snapshot by Position',
			options: [
				{
					id: 'position',
					type: 'dropdown',
					label: 'Position',
					default: '',
					choices: Array.from({ length: 99 }, (_, i) => self.getState(`/snapshots/${i}`))
						.map((snap) => ({
							label: `${snap.position + 1} (${snap.name})`,
							id: Number(snap.position),
						}))
						.sort((a, b) => a.id - b.id), // a.label.localeCompare(b.label))
					tooltip: `The snapshot at the selected position will be recalled. In the selection you see the name of the snapshot at each position only for reference.`,
				},
			],
			callback: async (event, _context) => {
				self.sendCmd({ type: 'cmd', payload: `recall_pos_snapshot_${event.options.position}` })
			},
			learn(action, _context) {
				const position = self.getState('/last_snapshot_recalled_pos')
				if (typeof position === 'number' && position >= 0) {
					return { ...action.options, position }
				} else return {}
			},
		},
		flash: {
			name: 'Identify Device',
			options: [],
			callback: async (_event, _context) => {
				self.sendCmd({ type: 'cmd', payload: `flash` })
			},
		},
	}

	const destinationChoices =
		self.devicetype === 'PRODIGY.MP' || self.devicetype === 'PRODIGY.MX' || self.devicetype === 'MAVEN.A'
			? [
					...self.choices.outputChoices,
					...self.choices.outputFlexChoices,
					...self.choices.outputMixerChoices,
					...self.choices.outputSidechainChoices,
				]
			: self.choices.outputChoices

	const sourceChoices = [
		...self.choices.unassigned,
		...self.choices.inputChoices,
		...self.choices.inputDspChoices,
		...self.choices.generatorSources,
	]

	actions['routing_standard'] = {
		name: 'Routing: Patch Route',
		options: [
			{
				id: 'sink',
				type: 'dropdown',
				label: 'Destination',
				choices: destinationChoices,
				default: destinationChoices[0].id,
			},
			{
				id: 'source',
				type: 'dropdown',
				label: 'Source',
				choices: [...PrevNextChoices, ...sourceChoices],
				default: self.choices.unassigned[0].id,
			},
		],
		callback: (event, _context) => {
			let rawsource = event.options.source
			const rawsink = `${event.options.sink}`
			let sinkPath = '/settings/easy_routing/*'
			let sinkTranslation: string | undefined = 'output'

			if (self.devicetype === 'MAVEN.A' || self.devicetype === 'PRODIGY.MC') {
				sinkPath = '/settings/routing/*'
			}

			if (rawsink.startsWith('snkdsp_flex')) {
				sinkPath = '/settings/flex_channel/*/source_routing'
				sinkTranslation = 'sinkFlex'
			} else if (rawsink.startsWith('snkdsp_mtx') && self.devicetype === 'PRODIGY.MP') {
				sinkPath = '/settings/mixer/*'
				sinkTranslation = 'sinkMixer'
			} else if (rawsink.startsWith('snkdsp_mtx')) {
				sinkPath = '/settings/mixer64x64/source_routing/*'
				sinkTranslation = 'sinkMixer'
			} else if (rawsink.startsWith('snkdsp_dyn')) {
				sinkPath = '/settings/compressor/*/side_chain_key'
				sinkTranslation = 'sinkSidechain'
			}

			const path = sinkPath.replace('*', self.translate('outgoing', sinkTranslation, rawsink))

			if (rawsource == '%%next%%') {
				const list: any[] = sourceChoices
				const currentvalue = self.getState(path, 'input')

				const index = list.findIndex((choice) => choice.id == currentvalue)
				if (index == -1) return
				const nextindex = (index + 1) % list.length
				rawsource = list[nextindex].id
			} else if (rawsource == '%%prev%%') {
				const list: any[] = sourceChoices
				const currentvalue = self.getState(path, 'input')

				const index = list.findIndex((choice) => choice.id == currentvalue)
				if (index == -1) return
				const previndex = index == 0 ? list.length - 1 : index - 1
				rawsource = list[previndex].id
			}

			self.sendSetCmd(path, `${rawsource}`, 'input')
		},
		learn: (event: CompanionActionEvent, _context: CompanionActionContext) => {
			const rawsink = `${event.options.sink}`

			let sinkPath = '/settings/easy_routing/*'
			let sinkTranslation: string | undefined = 'output'

			if (self.devicetype === 'MAVEN.A') {
				sinkPath = '/settings/routing/*'
			}

			if (rawsink.startsWith('snkdsp_flex')) {
				sinkPath = '/settings/flex_channel/*/source_routing'
				sinkTranslation = 'sinkFlex'
			} else if (rawsink.startsWith('snkdsp_mtx') && self.devicetype === 'PRODIGY.MP') {
				sinkPath = '/settings/mixer/*'
				sinkTranslation = 'sinkMixer'
			} else if (rawsink.startsWith('snkdsp_mtx')) {
				sinkPath = '/settings/mixer64x64/source_routing/*'
				sinkTranslation = 'sinkMixer'
			} else if (rawsink.startsWith('snkdsp_dyn')) {
				sinkPath = '/settings/compressor/*/side_chain_key'
				sinkTranslation = 'sinkSidechain'
			}

			const path = sinkPath.replace('*', self.translate('outgoing', sinkTranslation, rawsink))
			const value = self.getState(path, 'input')

			// self.log('debug', `learn called. value: ${value}\noptionValues: ${JSON.stringify(optionsValues, null, 2)}`)

			return { ...event.options, source: value }
		},
	}

	actions['routing_sumbus'] = {
		name: 'Routing: Sum Bus Assign',
		options: [
			{
				id: 'sink',
				type: 'dropdown',
				label: 'Destination',
				choices: self.choices.sumbusSinkChoices,
				default: self.choices.sumbusSinkChoices[0].id,
			},
			{
				id: 'source',
				type: 'dropdown',
				label: 'Source',
				choices: self.choices.sumbusSourceChoices,
				default: self.choices.sumbusSourceChoices[0].id,
			},
			{
				id: 'action',
				type: 'dropdown',
				label: 'Action',
				choices: [
					{ label: 'Toggle', id: '%%toggle%%' },
					{ label: 'Set Crosspoint', id: '%%true%%' },
					{ label: 'Clear Crosspoint', id: '%%false%%' },
				],
				default: '%%toggle%%',
			},
		],
		callback: (event, _context) => {
			const rawsink = event.options.sink as string
			const sink = self.translate('outgoing', 'sinkSumbus', rawsink)
			const rawsource = event.options.source as string
			const action = event.options.action

			let path = '/settings/sum_bus_assign_io/*/segment/#'
			if (rawsource.startsWith('srcdsp_')) path = '/settings/sum_bus_assign_dsp/*/segment/#'

			const sinkOpt = (
				deviceTables.sumBusSources[self.devicetype] as Array<{ chId: string; segment: number; bit: number }>
			).find((opt) => opt.chId === rawsource)
			if (!sinkOpt) {
				self.log('error', `sumbus source ${rawsource} not found`)
				return
			}

			path = path.replace('#', `${sinkOpt.segment}`)
			path = path.replace('*', `${sink}`)

			const getBit = (byte: number, pos: number) => (byte >> pos) & 1
			const setBit = (byte: number, pos: number, val: number) => (byte & ~(1 << pos)) | ((val & 1) << pos)
			let byte = Number(self.getState(path))
			const bitNum = sinkOpt.bit

			let value = getBit(byte, bitNum)

			if (action === '%%toggle%%' && value === 0) value = 1
			else if (action === '%%toggle%%' && value === 1) value = 0
			else if (action === '%%true%%') value = 1
			else value = 0

			byte = setBit(byte, bitNum, value)

			self.sendSetCmd(path, byte)
		},
		learn: (event: CompanionActionEvent, _context: CompanionActionContext) => {
			const rawsink = event.options.sink as string
			const sink = self.translate('outgoing', 'sinkSumbus', rawsink)
			const rawsource = event.options.source as string

			let path = '/settings/sum_bus_assign_io/*/segment/#'
			if (rawsource.startsWith('srcdsp_')) path = '/settings/sum_bus_assign_dsp/*/segment/#'

			const sinkOpt = (
				deviceTables.sumBusSources[self.devicetype] as Array<{ chId: string; segment: number; bit: number }>
			).find((opt) => opt.chId === rawsource)
			if (!sinkOpt) {
				self.log('error', `sumbus source ${rawsource} not found`)
				return {}
			}

			path = path.replace('#', `${sinkOpt.segment}`)
			path = path.replace('*', `${sink}`)

			const getBit = (byte: number, pos: number) => (byte >> pos) & 1
			const byte = Number(self.getState(path))
			const bitNum = sinkOpt.bit

			const value = getBit(byte, bitNum)

			let action = '%%false%%'
			if (value === 1) action = '%%true%%'
			else if (value === 0) action = '%%false%%'
			else return {}

			// self.log('debug', `learn called. value: ${value}\noptionValues: ${JSON.stringify(optionsValues, null, 2)}`)

			return { ...event.options, action }
		},
	}

	return actions
}
