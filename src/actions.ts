import { CompanionActionContext, CompanionActionDefinitions, CompanionActionEvent } from '@companion-module/base'
import { DirectoutInstance } from './main.js'
import { PrevNextChoices } from './utils.js'
import { deviceTables, PICKOFFNUM } from './capabilities.js'

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

	const destinationSelectionChoices = [{ id: 'noselection', label: 'No selection' }, ...destinationChoices]

	const sourceChoices = [
		...self.choices.unassigned,
		...self.choices.inputChoices,
		...self.choices.inputDspChoices,
		...self.choices.generatorSources,
	]

	const sourceSelectionChoices = [{ id: 'noselection', label: 'No selection' }, ...sourceChoices]

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

	const getList = (liststr: string, allIds: string[]) => {
		if (liststr == '') return allIds
		const ids = liststr.split(',')
		if (ids.length < 1) return allIds
		const idarr = ids.map((id) => id.trim())
		const idsfound = idarr.flatMap((id) => {
			const globNumber = new RegExp(id.replaceAll('*', '-?\\d+'))
			const matches = allIds.filter((id: string) => id.match(globNumber))
			return matches || []
		})
		return [...new Set(idsfound.flat(3))]
	}

	actions['routing_selectsource'] = {
		name: 'Routing: Select Source',
		options: [
			{
				id: 'list',
				label: 'List of sources',
				type: 'textinput',
				default: '',
				useVariables: true,
				tooltip: `Leave empty to step thru all sources of the device with "Previous" and "Next". \nEnter a comma delimited list of source IDs to restrict previous and next to that list. You can use * as a placeholder for any number, e.g. src_madi1_* will cycle thru all inputs of madi 1 slot. \nWhen the current value is not part of the list, previous or next will use the first entry.`,
			},
			{
				id: 'source',
				type: 'dropdown',
				label: 'Source',
				choices: [...PrevNextChoices, ...sourceSelectionChoices],
				default: self.choices.unassigned[0].id,
			},
		],
		callback: async (event, context) => {
			let rawsource = event.options.source
			let liststr = ''

			if (rawsource == '%%next%%' || rawsource == '%%prev%%') {
				liststr = await context.parseVariablesInString(`${event.options.list}`)
			}
			if (rawsource == '%%next%%') {
				const list = getList(
					liststr,
					sourceSelectionChoices.map((choice) => choice.id),
				)
				if (list.length === 0) return
				const currentvalue = self.routingSelectedSource

				const index = list.findIndex((choice) => choice == currentvalue)
				if (index == -1) {
					rawsource = list[0]
				} else {
					const nextindex = (index + 1) % list.length
					rawsource = list[nextindex]
				}
			} else if (rawsource == '%%prev%%') {
				const list = getList(
					liststr,
					sourceSelectionChoices.map((choice) => choice.id),
				)
				if (list.length === 0) return
				const currentvalue = self.routingSelectedSource

				const index = list.findIndex((choice) => choice == currentvalue)
				if (index == -1) {
					rawsource = list[list.length - 1]
				} else {
					const previndex = index == 0 ? list.length - 1 : index - 1
					rawsource = list[previndex]
				}
			}

			self.routingSelectedSource = `${rawsource}`
			self.setVariableValues({
				routing_selected_source: self.routingSelectedSource,
			})
			self.checkFeedbacks('routing_selectedSorce')
		},
		learn: (event: CompanionActionEvent, _context: CompanionActionContext) => {
			const rawsink = `${self.routingSelectedSink}`
			if (rawsink == 'noselection') return { ...event.options, source: 'noselection' }

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

	actions['routing_selectsink'] = {
		name: 'Routing: Select Destination',
		options: [
			{
				id: 'list',
				label: 'List of destinations',
				type: 'textinput',
				useVariables: true,
				default: '',
				tooltip: `Leave empty to step thru all destinations of the device with "Previous" and "Next". \nEnter a comma delimited list of destination IDs to restrict previous and next to that list. You can use * as a placeholder for any number, e.g. snk_madi1_* will cycle thru all outputs of madi 1 slot. \nWhen the current value is not part of the list, previous or next will use the first entry.`,
			},
			{
				id: 'sink',
				type: 'dropdown',
				label: 'Destination',
				choices: [...PrevNextChoices, ...destinationSelectionChoices],
				default: destinationChoices[0].id,
			},
		],
		callback: async (event, context) => {
			let rawsink = `${event.options.sink}`
			let liststr = ''

			if (rawsink == '%%next%%' || rawsink == '%%prev%%') {
				liststr = await context.parseVariablesInString(`${event.options.list}`)
			}

			if (rawsink == '%%next%%') {
				const list = getList(
					liststr,
					destinationSelectionChoices.map((choice) => choice.id),
				)
				if (list.length === 0) return
				const currentvalue = self.routingSelectedSink

				const index = list.findIndex((choice) => choice == currentvalue)
				if (index == -1) {
					rawsink = list[0]
				} else {
					const nextindex = (index + 1) % list.length
					rawsink = list[nextindex]
				}
			} else if (rawsink == '%%prev%%') {
				const list = getList(
					liststr,
					destinationSelectionChoices.map((choice) => choice.id),
				)
				if (list.length === 0) return
				const currentvalue = self.routingSelectedSink

				const index = list.findIndex((choice) => choice == currentvalue)
				if (index == -1) {
					rawsink = list[list.length - 1]
				} else {
					const previndex = index == 0 ? list.length - 1 : index - 1
					rawsink = list[previndex]
				}
			}
			self.routingSelectedSink = rawsink
			self.setVariableValues({
				routing_selected_destination: self.routingSelectedSink,
				routing_source_of_selected_destination: self.getCurrentSourceForDestination(self.routingSelectedSink),
			})
			self.checkFeedbacks('routing_selectedSink')
		},
	}

	actions['routing_take'] = {
		name: 'Routing: Take Selected Route',
		options: [
			{
				id: 'count',
				label: 'Count of consecutive Channels',
				type: 'number',
				min: 1,
				max: 65536,
				default: 1,
				step: 1,
				tooltip: `Set to 1 to route only the selected channel, set to 2 to route the selected and the following channel and so on.\n\nWhen the end of a block is reached, the routing will advance to the next block. When the end of all channels is reached there is no rollover.\n\nIf "Unassigned" is the first source, all destinations will be unassigned. If routing a channel with pickoff points, the same pickoff point will be used for the following channels.`,
			},
		],
		callback: (event, _context) => {
			const rawsource = self.routingSelectedSource
			const rawsink = self.routingSelectedSink
			let count = Math.round(Number(event.options.count))
			if (isNaN(count) || count < 1) count = 1
			if (rawsource == 'noselection' || rawsink == 'noselection') return

			let deviceBasePath = '/settings/easy_routing/*'
			if (self.devicetype === 'MAVEN.A' || self.devicetype === 'PRODIGY.MC') {
				deviceBasePath = '/settings/routing/*'
			}

			let sinkPath = deviceBasePath
			let sinkTranslation: string | undefined = 'output'
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

			self.sendSetCmd(path, `${rawsource}`, 'input')
			if (count > 1) {
				const sourcelist = sourceSelectionChoices.map((choice) => choice.id)
				const sinklist = destinationSelectionChoices.map((choice) => choice.id)
				let nextSource = rawsource
				let nextSink = `${rawsink}`
				for (let i = 1; i < count; i += 1) {
					const sourceindex = sourcelist.findIndex((choice) => choice == nextSource)
					if (nextSource == 'src_gen_-1') {
						// stay on unassigned for all sources
					} else if (sourceindex == -1) {
						return
					} else if (nextSource.split('_')[2].includes('p')) {
						// we are in a source that supports multiple pickoff points
						if (sourcelist[sourceindex + PICKOFFNUM].split('_')[2].includes('p')) {
							// skip all pickoff points to the next source with pickoff points
							nextSource = sourcelist[sourceindex + PICKOFFNUM]
						} else {
							// we had been at the end of sources with pickoff points, now find the next source without pickoff points
							for (let i = 1; i <= PICKOFFNUM; i += 1) {
								nextSource = sourcelist[sourceindex + i]
								if (!nextSource.split('_')[2].includes('p')) break
							}
						}
					} else {
						let nextsourceindex = sourceindex + 1
						if (nextsourceindex > sourcelist.length) nextsourceindex = sourcelist.length - 1
						nextSource = sourcelist[nextsourceindex]
					}
					const sinkindex = sinklist.findIndex((choice) => choice == nextSink)
					if (sinkindex == -1) {
						return
					} else if (sinkindex >= sinklist.length) {
						nextSink = sinklist[sinklist.length - 1]
					} else {
						nextSink = sinklist[sinkindex + 1]
					}

					let sinkPath = deviceBasePath
					let sinkTranslation: string | undefined = 'output'
					if (nextSink.startsWith('snkdsp_flex')) {
						sinkPath = '/settings/flex_channel/*/source_routing'
						sinkTranslation = 'sinkFlex'
					} else if (nextSink.startsWith('snkdsp_mtx') && self.devicetype === 'PRODIGY.MP') {
						sinkPath = '/settings/mixer/*'
						sinkTranslation = 'sinkMixer'
					} else if (nextSink.startsWith('snkdsp_mtx')) {
						sinkPath = '/settings/mixer64x64/source_routing/*'
						sinkTranslation = 'sinkMixer'
					} else if (nextSink.startsWith('snkdsp_dyn')) {
						sinkPath = '/settings/compressor/*/side_chain_key'
						sinkTranslation = 'sinkSidechain'
					}

					const path = sinkPath.replace('*', self.translate('outgoing', sinkTranslation, nextSink))

					self.sendSetCmd(path, `${nextSource}`, 'input')
				}
			}
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
