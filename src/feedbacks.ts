import { CompanionFeedbackDefinitions } from '@companion-module/base'
import { isSet } from 'util/types'
import { DirectoutInstance } from './main.js'
import { Subscription } from './types.js'
import { deviceTables } from './capabilities.js'

export function returnFeedbackDefinitions(self: DirectoutInstance): CompanionFeedbackDefinitions {
	const feedbacks: CompanionFeedbackDefinitions = {
		CustomValue: {
			name: 'Check Custom Value',
			type: 'boolean',
			description: `Observe a custom value and compare to a set value.`,
			defaultStyle: self.defaultDefaultStyle,
			options: [
				{
					id: 'path',
					type: 'textinput',
					label: 'Path',
					default: '/',
					tooltip: `Path must start with a forward slash and every segment is divided by a slash.`,
				},
				{
					id: 'type',
					type: 'dropdown',
					label: 'Interpret as',
					tooltip: `The value will be casted to the given type if it is different and possible.`,
					choices: [
						{ label: 'String', id: 'string' },
						{ label: 'Number', id: 'number' },
						{ label: 'Boolean', id: 'boolean' },
					],
					default: 'string',
				},
				{
					id: 'op_string',
					label: 'Check',
					type: 'dropdown',
					choices: [
						{ label: 'Equals', id: 'eq' },
						{ label: 'Starts With', id: 'sw' },
						{ label: 'Ends With', id: 'ew' },
						{ label: 'Contains', id: 'co' },
					],
					default: 'eq',
					isVisible: (options) => {
						return options.type === 'string'
					},
				},
				{
					id: 'op_number',
					label: 'Check',
					type: 'dropdown',
					choices: [
						{ label: '=', id: 'eq' },
						{ label: '>', id: 'gt' },
						{ label: '<', id: 'lt' },
						{ label: '% = 0', id: 'mo' },
					],
					default: 'eq',
					isVisible: (options) => {
						return options.type === 'number'
					},
				},
				{
					id: 'value',
					type: 'textinput',
					label: 'Value',
					default: '',
					tooltip: `Type number for numerical comparisons and text for string comparisons.`,
					isVisible: (options) => {
						return options.type !== 'boolean'
					},
				},
			],
			callback: (event) => {
				const opt = event.options
				const path = `${opt.path}`
				const type = opt.type
				const valuestr = `${opt.value}`
				if (!path.match(/^(\/[a-zA-Z0-9_-]+)+$/)) {
					self.log('error', `Path: ${path} of custom feedback is not a valid path format.`)
					return false
				}
				const currentValue = self.getState(path)
				if (currentValue === undefined) {
					self.log('error', `Path ${path} can't be found on the device. Custom feedback not possible.`)
					return false
				}

				if (type === 'boolean') {
					if (currentValue === true) return true
					else return false
				} else if (type === 'string') {
					let currStr = `${currentValue}`
					if (Array.isArray(currentValue)) currStr = currentValue.join(', ')
					if (opt.op_string === 'eq' && currStr == valuestr) return true
					else if (opt.op_string === 'sw' && currStr.startsWith(valuestr)) return true
					else if (opt.op_string === 'ew' && currStr.endsWith(valuestr)) return true
					else if (opt.op_string === 'co' && currStr.includes(valuestr)) return true
					else return false
				} else if (type === 'number') {
					const valueNum = Number(valuestr)
					if (isNaN(valueNum)) {
						self.log('warn', `Entered custom feedback value ${valuestr} can't be interpreted as a number.`)
						return false
					}
					const currNum = Number(currentValue)
					if (isNaN(currNum)) {
						self.log('warn', `Retrieved custom feedback value ${currentValue} can't be interpreted as a number.`)
						return false
					}
					if (opt.op_number === 'eq' && currNum == valueNum) return true
					else if (opt.op_number === 'gt' && currNum > valueNum) return true
					else if (opt.op_number === 'lt' && currNum < valueNum) return true
					else if (opt.op_number === 'mo' && currNum % valueNum == 0) return true
					else return false
				}
				return false
			},
			subscribe: (feedback) => {
				const path = `${feedback.options.path}`
				if (!self.validPath(path)) return

				if (self.subscriptions.has(path)) {
					const sub = self.subscriptions.get(path) as Subscription
					if (!isSet(sub?.listeners)) sub.listeners = new Set()
					sub.listeners.add(feedback.id)
					if (!Array.isArray(sub.feedback)) sub.feedback = [feedback.feedbackId] // subscription could had been added previously by variable feedback, then feedback array is not defined
				} else {
					self.subscriptions.set(path, {
						check: RegExp(path + '$'),
						feedback: [feedback.feedbackId],
						listeners: new Set([feedback.id]),
					})
				}
			},
			unsubscribe: (feedback) => {
				const path = `${feedback.options.path}`
				if (self.subscriptions.has(path)) {
					const sub = self.subscriptions.get(path) as Subscription
					if (isSet(sub?.listeners)) {
						sub.listeners.delete(feedback.id)
						if (sub.listeners.size === 0) {
							self.subscriptions.delete(path)
						}
					}
				}
			},
			learn: (event, _context) => {
				const value = self.lastChange.value
				let type = typeof value
				if (type !== 'number' && type !== 'string' && type !== 'boolean') type = 'string'
				const typeopt: any = {}
				if (type === 'number') typeopt.op_number = 'eq'
				else if (type === 'string') typeopt.op_string = 'eq'

				return { ...event.options, ...typeopt, path: self.lastChange.path, value }
			},
		},
		CustomVariable: {
			name: 'Create Custom Variable',
			type: 'advanced',
			description: `Observe a custom value and serve the value as a connection variable.`,
			options: [
				{
					id: 'path',
					type: 'textinput',
					label: 'Path',
					default: '/',
					tooltip: `Path must start with a forward slash and every segment is divided by a slash.`,
				},
				{
					id: 'variable',
					type: 'textinput',
					label: 'Variable',
					default: '',
					tooltip: `Generate a variable with this name for the value.`,
					regex: '/^[a-zA-Z0-9_-]+$/',
				},
			],
			callback: (_feedback) => {
				// unused, this only generates a variable
				return {}
			},
			subscribe: (feedback) => {
				const variable = `${feedback.options.variable}`
				if (!variable.match(/^[a-zA-Z0-9_-]+$/)) return
				const path = `${feedback.options.path}`
				if (!self.validPath(path)) return

				// add to variable definitions or add myself to publishers
				if (self.variablesTable.has(variable)) {
					const varDef = self.variablesTable.get(variable)
					varDef?.publishers.add(feedback.id)
				} else {
					self.variablesTable.set(variable, {
						variableId: variable,
						name: `Device path ${path}`,
						publishers: new Set([feedback.id]),
					})
					self.updateVariableDefinitions()
				}

				// add to subscriptions so the variable can be updated. Don't using deduplication of path here, so one can add multiple variables for one path (users are crazy)
				self.subscriptions.set(feedback.id, {
					check: RegExp(`^${path}$`),
					listeners: new Set([feedback.id]),
					fun: () => {
						const value = self.getState(path)
						self.setVariableValues({ [variable]: value })
					},
				})

				// init variable value
				const value = self.getState(path)
				self.setVariableValues({ [variable]: value })
			},
			unsubscribe: (feedback) => {
				const variable = `${feedback.options.variable}`
				// remove from variable definitions
				const varDef = self.variablesTable.get(variable)
				if (varDef === undefined) return
				varDef.publishers.delete(feedback.id)
				if (varDef.publishers.size === 0) {
					self.variablesTable.delete(variable)
					self.updateVariableDefinitions()
				}

				// remove from subscriptions
				self.subscriptions.delete(feedback.id)
			},
			learn: (event, _context) => {
				if (event.options.variable === '' && self.lastChange.path.startsWith('/'))
					return { path: self.lastChange.path, variable: `${self.lastChange.path.substring(1).replaceAll('/', '_')}` }
				return { ...event.options, path: self.lastChange.path }
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

	feedbacks['routing_standard'] = {
		name: 'Routing: Check patch',
		type: 'boolean',
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
				choices: sourceChoices,
				default: self.choices.unassigned[0].id,
			},
		],
		defaultStyle: self.defaultDefaultStyle,
		callback: (event, _context) => {
			const rawsource = event.options.source
			const rawsink = `${event.options.sink}`
			let sinkPath = '/settings/easy_routing/*'
			let sinkTranslation: string | undefined = 'output'

			if (self.devicetype === 'MAVEN.A' || self.devicetype == 'PRODIGY.MC') {
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

			const currentvalue = self.getState(path, 'input')

			if (currentvalue == rawsource) {
				return true
			}
			return false
		},
		learn: (event, _context) => {
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

			// self.log('debug', `learn called. path: ${path}, translation: ${sinkTranslation}, value: ${value}`)

			return { ...event.options, source: value }
		},
	}

	feedbacks['routing_selectedSorce'] = {
		name: 'Routing: Check selected source',
		type: 'boolean',
		options: [
			{
				id: 'source',
				type: 'dropdown',
				label: 'Source',
				choices: sourceSelectionChoices,
				default: self.choices.unassigned[0].id,
			},
		],
		defaultStyle: self.defaultDefaultStyle,
		callback: (event, _context) => {
			if (self.routingSelectedSource == event.options.source) {
				return true
			}
			return false
		},
		learn: (_event, _context) => {
			return { source: self.routingSelectedSource }
		},
	}

	feedbacks['routing_selectedSink'] = {
		name: 'Routing: Check selected destination',
		type: 'boolean',
		options: [
			{
				id: 'sink',
				type: 'dropdown',
				label: 'Destination',
				choices: destinationSelectionChoices,
				default: destinationChoices[0].id,
			},
		],
		defaultStyle: self.defaultDefaultStyle,
		callback: (event, _context) => {
			if (self.routingSelectedSink == event.options.sink) {
				return true
			}
			return false
		},
		learn: (_event, _context) => {
			return { sink: self.routingSelectedSink }
		},
	}

	feedbacks['routing_sumbus'] = {
		name: 'Routing: Check Sum Bus Assign',
		type: 'boolean',
		defaultStyle: self.defaultDefaultStyle,
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
		],
		callback: (event, _context) => {
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
				return false
			}

			path = path.replace('#', `${sinkOpt.segment}`)
			path = path.replace('*', `${sink}`)

			const getBit = (byte: number, pos: number) => (byte >> pos) & 1
			const byte = Number(self.getState(path))
			const bitNum = sinkOpt.bit

			const value = getBit(byte, bitNum)

			if (value === 1) return true
			else return false
		},
	}

	return feedbacks
}
