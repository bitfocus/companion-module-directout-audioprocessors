import { Subscription } from './types.js'
import { DirectoutInstance } from './main.js'
import { CompanionRecordedAction } from '@companion-module/base'
import { stringToNum } from './utils.js'

export function returnStaticSubscriptions(self: DirectoutInstance): Map<string, Subscription> {
	/**
	 * This array holds all subscriptions, we need to act on.
	 *
	 * Each subscription has the following properties:
	 * @property check - A regex to check the message string against
	 * @property init (optional) - an array of paths to run against when initializing the module
	 * @property feedback - An array with feedbacks to call when the check matches
	 * @property fun (optional) - a function that gets executed with the path to check. It can update variables, etc. If it returns true, the actions presets and so on will be updated.
	 * @property listeners - (optinal) a set with some IDs of feedbacks that listen to this subscription. The subscription may only be removed if listeners is empty.
	 */
	const staticSubscriptions: [string, Subscription][] = [
		[
			'some_label',
			{
				check: /(label)|(name)/,
				feedback: [],
				fun: (_path) => {
					return true
				},
			},
		],
		[
			'routing_standard',
			{
				check:
					/^\/settings\/((easy_)?routing\/\d+)|(flex_channel\/\d+\/source_routing)|(mixer\/\d+)|(mixer64x64\/source_routing\/\d+)|(compressor\/\d+\/side_chain_key)/,
				init: ['/settings/routing/1/1'],
				feedback: ['routing_standard'],
				fun: (path) => {
					const pathParts = path.substring(1).split('/')
					let sinkTranslation = 'output'
					let optPos = 2
					if (pathParts[1] === 'flex_channel') sinkTranslation = 'sinkFlex'
					else if (pathParts[1] === 'mixer64x64') {
						sinkTranslation = 'sinkMixer'
						optPos = 3
					} else if (pathParts[1] === 'mixer') sinkTranslation = 'sinkMixer'
					else if (pathParts[1] === 'compressor') sinkTranslation = 'sinkSidechain'

					const optionValue = self.translate('incoming', sinkTranslation, stringToNum(pathParts[optPos]))
					const value = self.getState(path, 'input')
					// self.log(
					// 	'debug',
					// 	`Rec Routing standard at ${path} set to source ${value} sink ${optionValue} translation ${sinkTranslation}`,
					// )

					// update routing_source_of_selected_destination variable
					if (self.routingSelectedSink == optionValue) {
						self.setVariableValues({
							routing_source_of_selected_destination: value,
						})
					}

					// record action if needed
					if (self.isRecording) {
						const action: CompanionRecordedAction = {
							actionId: 'routing_standard',
							options: {
								sink: optionValue,
								source: value,
							},
						}
						self.recordAction(action)
						self.inhibitNextGenericRecord = true
					}
				},
			},
		],
		[
			'routing_sumbus',
			{
				check: /^\/settings\/sum_bus_assign_(io|dsp)\/\d+\/segment\/\d+/,
				feedback: ['routing_sumbus'],
			},
		],
		[
			'device_samplerate',
			{
				check: /^\/status\/ref_frequency/,
				init: ['/status/ref_frequency'],
				fun: (_path) => {
					const freq = self.getState('/status/ref_frequency')
					if (typeof freq !== 'number') return false

					const samplerate = Math.round(freq * 100) / 100
					self.setVariableValues({ device_samplerate: samplerate })
					return false
				},
			},
		],
		[
			'snapshots',
			{
				check: /^\/snapshots/,
				init: ['/snapshots'],
				fun: (_path) => {
					const snapshots = self.getState('/snapshots')
					if (snapshots == undefined || typeof snapshots !== 'object') return false

					self.setVariableValues({ snapshots })
					return false
				},
			},
		],
	]

	return new Map(staticSubscriptions)
}
