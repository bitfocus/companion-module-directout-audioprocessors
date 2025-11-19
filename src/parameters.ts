import { CompanionActionEvent, CompanionFeedbackInfo } from '@companion-module/base'
import { deviceTables } from './capabilities.js'
import { DirectoutInstance } from './main.js'
import { DeviceType, Subscription } from './types.js'

export type Option = {
	/** optional ID to override the option id, should not be omitted */
	id?: string
	/** label for the option */
	label: string
	/** type of the option */
	type: 'string' | 'number' | 'boolean' | 'dropdown'
	/** choices only relevant for dropdown, optional for boolean (values: %%true%%, %%false%%) */
	choices?: { label: string; id: string | number | boolean }[]
	/** name of a translation table to use for the option value */
	translation?: string
	/** default value for the option, if omitted, defaults to first choice, toggle, 0 or empty string */
	default?: string | number | boolean
	/** optional tooltip, will be automatically filled for number options with range hint */
	tooltip?: string
	/** optional regex for string */
	regex?: string
	/** optional minimum for number, 0 if omitted */
	min?: number
	/** optional maximum for number, 1024 if omitted */
	max?: number
	/** optional step for number, 1 if omitted */
	step?: number
	/** make incremental rather than absolute */
	incremental?: boolean
}

export type ParameterOption = Option & {
	/** path for parameters, can contain * placeholders for option values in order of appearance */
	path: string
}

export type Parameters = {
	[key: string]: {
		/** optional ID to override the action/feedback id */
		id?: string
		/** Name used for the action and feedback, will be prefixed with "Set " and "Get " */
		name: string
		/** The types of things to generate */
		provide: Array<'action' | 'feedback' | 'preset' | 'variable'>
		/** Array of options, an option will not be learned and does not produce set commands */
		options?: Option[]
		/** Array of parameters, a parameter is learned and produces a command. Option values will be applied to parameter path */
		parameters?: ParameterOption[]
		/** optional list of device names where this parameter is available, defaults to all */
		device?: DeviceType[]
		/** override some action definition properties */
		action?: any
		/** override some feedback definition properties */
		feedback?: any
		/** override some preset definition properties */
		preset?: any
		/** override some subscription definition properties */
		subscription?: Subscription
	}
}

export function returnParameters(self: DirectoutInstance): Parameters {
	/**
	 * This object declares the parameters of the Directout device.
	 * A parameter is an API endpoint/leaf in the device's object tree.
	 * With this object we can generate an action, feedback, preset, variable for a parameter
	 *
	 * Each parameter has the following properties:
	 * @property name - human friendly name
	 * @property path - path in the device object
	 * @property provide - array with elements to generate
	 * @property options - array with description of the parameter options
	 * 		@property id - the id needs to start with `param` for the parameter and `opt1` to `optX` for options
	 * 										if after that follows a `_translation_translationID_` values will be translated
	 * @property device - (optional) array with device ids to restrict the parameter to, all devices if omitted
	 * @property action - action definition or partial action definition to override atomatic generated
	 * @property feedback - feedback definition or partial feedback definition to override atomatic generated
	 * @property preset - preset definition or partial preset definition to override atomatic generated
	 * @property
	 *
	 */
	const parameters: Parameters = {
		ltc_source: {
			name: 'Settings: LTC Source',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'ltc_source',
					path: '/settings/ltc_source',
					translation: 'input',
					label: 'LTC Source',
					type: 'dropdown',
					choices: [
						...self.choices.unassigned,
						...self.choices.inputChoices,
						...self.choices.inputDspChoices,
						...self.choices.generatorSources,
					],
				},
			],
		},

		device_name: {
			name: 'Settings: Device Name',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'device_name',
					path: '/device_info/name',
					label: 'Device Name',
					type: 'string',
				},
			],
		},

		mute_input: {
			name: 'Input: Mute',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'input_mute',
					path: '/settings/input_mute/*',
					label: 'Mute',
					type: 'dropdown',
					choices: [
						{ label: 'Mute', id: 1 },
						{ label: 'Unmute', id: 0 },
					],
				},
			],
			options: [
				{
					id: 'input',
					translation: 'input',
					label: 'Input',
					type: 'dropdown',
					choices: self.choices.inputChoices,
				},
			],
		},

		mute_output: {
			id: 'mute_output',
			device: ['PRODIGY.MC', 'PRODIGY.MP', 'PRODIGY.MX'],
			name: 'Output: Mute',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'output_mute',
					path: '/settings/mute/*',
					label: 'Mute',
					type: 'dropdown',
					choices: [
						{ label: 'Mute', id: 1 },
						{ label: 'Unmute', id: 0 },
					],
				},
			],
			options: [
				{
					id: 'output', // opt1
					translation: 'output',
					label: 'Output',
					type: 'dropdown',
					choices: self.choices.outputChoices,
				},
			],
		},

		mute_output_maven: {
			id: 'mute_output',
			device: ['MAVEN.A'],
			name: 'Output: Mute',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'output_mute',
					path: '/settings/output_mute/*',
					label: 'Mute',
					type: 'dropdown',
					choices: [
						{ label: 'Mute', id: 1 },
						{ label: 'Unmute', id: 0 },
					],
				},
			],
			options: [
				{
					id: 'output', // opt1
					translation: 'output',
					label: 'Output',
					type: 'dropdown',
					choices: self.choices.outputChoices,
				},
			],
		},

		mute_group_generic: {
			id: 'mute_group',
			name: 'Output Group Mute',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MC', 'PRODIGY.MP', 'MAVEN.A'],
			parameters: [
				{
					id: 'mute_group',
					path: '/settings/mute_group/*',
					label: 'Mute',
					type: 'dropdown',
					choices: [
						{ label: 'Mute', id: 1 },
						{ label: 'Unmute', id: 0 },
					],
				},
			],
			options: [
				{
					id: 'mutegroup', // opt1
					translation: 'groupMute',
					label: 'Group',
					type: 'dropdown',
					choices: self.choices.groupMuteChoices,
				},
			],
		},

		mute_group_mx: {
			id: 'mute_group',
			name: 'Output Group Mute',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MX'],
			parameters: [
				{
					id: 'mute_group',
					path: '/settings/mute_group/*',
					label: 'Mute',
					type: 'dropdown',
					choices: [
						{ label: 'Mute', id: 1 },
						{ label: 'Unmute', id: 0 },
					],
				},
			],
			options: [
				{
					id: 'mutegroup', // opt1
					translation: 'groupMute',
					label: 'Group',
					type: 'dropdown',
					choices: self.choices.groupMuteChoices,
				},
			],
			action: {
				callback: async (event: CompanionActionEvent): Promise<void> => {
					const options = event.options

					const groupNum = self.translate('outgoing', 'groupMute', options.mutegroup)
					let groups: any[] = []
					if (groupNum < 1000) {
						groups = [
							{
								path: `/settings/mute_group/${groupNum}`,
							},
						]
					} else if (groupNum == 1001) {
						groups = [
							{
								path: `/settings/dsp_mute_group/0`,
							},
						]
					} else if (groupNum == 1002) {
						groups = [
							{ path: `/settings/mute_group/0` },
							{ path: `/settings/mute_group/1` },
							{ path: `/settings/mute_group/2` },
							{ path: `/settings/mute_group/3` },
							{ path: `/settings/mute_group/4` },
							{ path: `/settings/mute_group/5` },
							{ path: `/settings/mute_group/6` },
							{ path: `/settings/mute_group/7` },
							{ path: `/settings/dsp_mute_group/0` },
						]
					}

					if (groups.length < 1) return

					let value = options.mute_group
					if (value == '%%toggle%%') {
						value = groups.map((group) => self.getState(group.path)).includes(0) ? 1 : 0
					}

					groups.forEach((group) => {
						self.sendSetCmd(group.path, value)
					})
				},
				learn: (event: CompanionActionEvent) => {
					const options = event.options

					const groupNum = self.translate('outgoing', 'groupMute', options.mutegroup)
					let groups: any[] = []
					if (groupNum < 1000) {
						groups = [
							{
								path: `/settings/mute_group/${groupNum}`,
							},
						]
					} else if (groupNum == 1001) {
						groups = [
							{
								path: `/settings/dsp_mute_group/0`,
							},
						]
					} else if (groupNum == 1002) {
						groups = [
							{ path: `/settings/mute_group/0` },
							{ path: `/settings/mute_group/1` },
							{ path: `/settings/mute_group/2` },
							{ path: `/settings/mute_group/3` },
							{ path: `/settings/mute_group/4` },
							{ path: `/settings/mute_group/5` },
							{ path: `/settings/mute_group/6` },
							{ path: `/settings/mute_group/7` },
							{ path: `/settings/dsp_mute_group/0` },
						]
					}

					if (groups.length < 1) return {}
					const value = groups.map((group) => self.getState(group.path)).includes(0) ? 0 : 1
					return { ...options, mute_group: value }
				},
			},
			feedback: {
				callback: async (event: CompanionFeedbackInfo): Promise<boolean> => {
					const options = event.options

					const groupNum = self.translate('outgoing', 'groupMute', options.mutegroup)
					let groups: any[] = []
					if (groupNum < 1000) {
						groups = [
							{
								path: `/settings/mute_group/${groupNum}`,
							},
						]
					} else if (groupNum == 1001) {
						groups = [
							{
								path: `/settings/dsp_mute_group/0`,
							},
						]
					} else if (groupNum == 1002) {
						groups = [
							{ path: `/settings/mute_group/0` },
							{ path: `/settings/mute_group/1` },
							{ path: `/settings/mute_group/2` },
							{ path: `/settings/mute_group/3` },
							{ path: `/settings/mute_group/4` },
							{ path: `/settings/mute_group/5` },
							{ path: `/settings/mute_group/6` },
							{ path: `/settings/mute_group/7` },
							{ path: `/settings/dsp_mute_group/0` },
						]
					}

					if (groups.length < 1) return false
					const value = groups.map((group) => self.getState(group.path)).includes(0) ? false : true
					return value
				},
				learn: (event: CompanionActionEvent) => {
					const options = event.options

					const groupNum = self.translate('outgoing', 'groupMute', options.mutegroup)
					let groups: any[] = []
					if (groupNum < 1000) {
						groups = [
							{
								path: `/settings/mute_group/${groupNum}`,
							},
						]
					} else if (groupNum == 1001) {
						groups = [
							{
								path: `/settings/dsp_mute_group/0`,
							},
						]
					} else if (groupNum == 1002) {
						groups = [
							{ path: `/settings/mute_group/0` },
							{ path: `/settings/mute_group/1` },
							{ path: `/settings/mute_group/2` },
							{ path: `/settings/mute_group/3` },
							{ path: `/settings/mute_group/4` },
							{ path: `/settings/mute_group/5` },
							{ path: `/settings/mute_group/6` },
							{ path: `/settings/mute_group/7` },
							{ path: `/settings/dsp_mute_group/0` },
						]
					}

					if (groups.length < 1) return {}
					const value = groups.map((group) => self.getState(group.path)).includes(0) ? 0 : 1
					return { ...options, mute_group: value }
				},
			},
		},

		input_polarity: {
			name: 'Input: Polarity',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'input_polarity',
					path: '/settings/input_polarity/*',
					label: 'Polarity',
					type: 'dropdown',
					choices: [
						{ label: 'Normal', id: 0 },
						{ label: 'Inverted', id: 1 },
					],
				},
			],
			options: [
				{
					id: 'input', // opt1
					translation: 'input',
					label: 'Input',
					type: 'dropdown',
					choices: self.choices.inputChoices,
				},
			],
		},

		output_polarity: {
			name: 'Output: Polarity',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'output_polarity',
					path: '/settings/output_polarity/*',
					label: 'Polarity',
					type: 'dropdown',
					choices: [
						{ label: 'Normal', id: 0 },
						{ label: 'Inverted', id: 1 },
					],
				},
			],
			options: [
				{
					id: 'output', // opt1
					translation: 'output',
					label: 'Output',
					type: 'dropdown',
					choices: self.choices.outputChoices,
				},
			],
		},

		output_gain: {
			name: 'Output: Gain',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'output_gain',
					path: '/settings/output_gain/*',
					label: 'Gain',
					type: 'number',
					min: -144,
					max: 18,
					step: 0.1,
					default: 0,
					incremental: true,
				},
			],
			options: [
				{
					id: 'output', // opt1
					translation: 'output',
					label: 'Output',
					type: 'dropdown',
					choices: self.choices.outputChoices,
				},
			],
		},

		input_trim: {
			name: 'Input: Trim',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'input_trim',
					path: '/settings/input_trim/*',
					label: 'Trim',
					type: 'number',
					min: -24,
					max: 24,
					step: 0.1,
					default: 0,
					incremental: true,
				},
			],
			options: [
				{
					id: 'input', // opt1
					translation: 'input',
					label: 'Input',
					type: 'dropdown',
					choices: self.choices.inputChoices,
				},
			],
		},

		output_trim: {
			name: 'Output: Trim',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'output_trim',
					path: '/settings/output_trim/*',
					label: 'Trim',
					type: 'number',
					min: -24,
					max: 24,
					step: 0.1,
					default: 0,
					incremental: true,
				},
			],
			options: [
				{
					id: 'output', // opt1
					translation: 'output',
					label: 'Output',
					type: 'dropdown',
					choices: self.choices.outputChoices,
				},
			],
		},

		input_label: {
			name: 'Input Label',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'label',
					path: '/settings/input_labels/*',
					label: 'Label',
					type: 'string',
				},
			],
			options: [
				{
					id: 'input', // opt1
					translation: 'input',
					label: 'Input',
					type: 'dropdown',
					choices: self.choices.inputChoices,
				},
			],
		},

		output_label: {
			name: 'Output Label',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'label',
					path: '/settings/output_labels/*',
					label: 'Label',
					type: 'string',
				},
			],
			options: [
				{
					id: 'output', // opt1
					translation: 'output',
					label: 'Output',
					type: 'dropdown',
					choices: self.choices.outputChoices,
				},
			],
		},

		ears_priority: {
			name: 'EARS: Priority',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'priority',
					path: '/settings/ears/*/priority',
					label: 'Priority',
					type: 'dropdown',
					choices: [
						{ label: 'Off', id: 0 },
						{ label: 'Main', id: 1 },
						{ label: 'Backup', id: 2 },
						{ label: 'Auto', id: 3 },
					],
				},
			],
			options: [
				{
					id: 'ears', // opt1
					translation: 'ears',
					label: 'EARS on',
					type: 'dropdown',
					choices: self.choices.earsChoices,
				},
			],
		},

		ears_force: {
			name: 'EARS: Force',
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'force',
					path: '/settings/ears/*/force',
					label: 'Force to',
					type: 'dropdown',
					choices: [
						{ label: 'Off', id: 0 },
						{ label: 'Main', id: 1 },
						{ label: 'Backup', id: 2 },
						{ label: 'Disaster Recovery', id: 3 },
					],
				},
			],
			options: [
				{
					id: 'ears', // opt1
					translation: 'ears',
					label: 'EARS on',
					type: 'dropdown',
					choices: self.choices.earsChoices,
				},
			],
		},

		sum_bus_mute: {
			name: 'Sum Bus: Mute',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'sink', // opt1
					translation: 'sinkSumbus',
					label: 'Sum Bus',
					type: 'dropdown',
					choices: self.choices.sumbusSinkChoices,
				},
			],
			parameters: [
				{
					id: 'mute_master',
					path: '/settings/sum_bus_master/*/mute',
					label: 'Mute Master',
					type: 'boolean',
				},
			],
		},

		sum_bus_polarity: {
			name: 'Sum Bus: Polarity',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'sink', // opt1
					translation: 'sinkSumbus',
					label: 'Sum Bus',
					type: 'dropdown',
					choices: self.choices.sumbusSinkChoices,
				},
			],
			parameters: [
				{
					id: 'polarity',
					path: '/settings/sum_bus_master/*/polarity',
					label: 'Polarity',
					type: 'dropdown',
					choices: [
						{ label: 'Off / normal', id: 0 },
						{ label: 'On / reversed', id: 1 },
					],
				},
			],
		},

		sum_bus_gain: {
			name: 'Sum Bus: Gain',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'sink', // opt1
					translation: 'sinkSumbus',
					label: 'Sum Bus',
					type: 'dropdown',
					choices: self.choices.sumbusSinkChoices,
				},
			],
			parameters: [
				{
					id: 'gain',
					path: '/settings/sum_bus_master/*/gain',
					label: 'Gain',
					type: 'number',
					min: -144,
					max: 18,
					step: 0.1,
					default: 0,
					incremental: true,
				},
			],
		},

		sum_bus_label: {
			name: 'Sum Bus Label',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'sink', // opt1
					translation: 'sinkSumbus',
					label: 'Sum Bus',
					type: 'dropdown',
					choices: self.choices.sumbusSinkChoices,
				},
			],
			parameters: [
				{
					id: 'label',
					path: '/settings/sum_bus_master/*/label',
					label: 'Label',
					type: 'string',
				},
			],
		},

		inmng_label: {
			name: 'Input Manager Label',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'inmng', // opt1
					translation: 'inmng',
					label: 'Input Manager',
					type: 'dropdown',
					choices: self.choices.inmngChoices,
				},
			],
			parameters: [
				{
					id: 'label',
					path: '/settings/input_manager/*/label',
					label: 'Label',
					type: 'string',
				},
			],
		},

		inmng_manual: {
			name: 'Input Manager Manual Selection',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'inmng', // opt1
					translation: 'inmng',
					label: 'Input Manager',
					type: 'dropdown',
					choices: self.choices.inmngChoices,
				},
			],
			parameters: [
				{
					id: 'manual',
					path: '/settings/input_manager/*/manual',
					label: 'Manual Selection',
					type: 'dropdown',
					translation: 'genericIn',
					choices: [
						{ label: 'No manual selection', id: 'none' },
						{ label: 'Select input 1', id: 'in1' },
						{ label: 'Select input 2', id: 'in2' },
						{ label: 'Select input 3', id: 'in3' },
						{ label: 'Select input 4', id: 'in4' },
						{ label: 'Select input 5', id: 'in5' },
						{ label: 'Select input 6', id: 'in6' },
					],
				},
			],
		},

		inmng_coherency: {
			name: 'Input Manager Coherency Detection',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'inmng', // opt1
					translation: 'inmng',
					label: 'Input Manager',
					type: 'dropdown',
					choices: self.choices.inmngChoices,
				},
			],
			parameters: [
				{
					id: 'coherency_detection',
					path: '/settings/input_manager/*/coherency_detection',
					label: 'Coherency Detection',
					type: 'boolean',
				},
			],
		},

		inmng_autoresume: {
			name: 'Input Manager Input Auto Resume',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'inmng', // opt1
					translation: 'inmng',
					label: 'Input Manager',
					type: 'dropdown',
					choices: self.choices.inmngChoices,
				},
				{
					id: 'channel', // opt2
					label: 'Input',
					type: 'dropdown',
					translation: 'genericIn',
					choices: [
						{ label: 'Input 1', id: 'in1' },
						{ label: 'Input 2', id: 'in2' },
						{ label: 'Input 3', id: 'in3' },
						{ label: 'Input 4', id: 'in4' },
						{ label: 'Input 5', id: 'in5' },
						{ label: 'Input 6', id: 'in6' },
					],
				},
			],
			parameters: [
				{
					id: 'auto_resume',
					path: '/settings/input_manager/*/entries/*/auto_resume',
					label: 'Auto Resume',
					type: 'boolean',
				},
			],
		},

		inmng_status_active: {
			name: 'Input Manager Active Signal',
			provide: ['feedback', 'preset', 'variable'],
			options: [
				{
					id: 'inmng', // opt1
					translation: 'inmng',
					label: 'Input Manager',
					type: 'dropdown',
					choices: self.choices.inmngChoices,
				},
			],
			parameters: [
				{
					id: 'channel',
					label: 'Input',
					path: '/status/input_manager/*/current',
					type: 'dropdown',
					translation: 'genericIn',
					choices: [
						{ label: 'Input 1', id: 'in1' },
						{ label: 'Input 2', id: 'in2' },
						{ label: 'Input 3', id: 'in3' },
						{ label: 'Input 4', id: 'in4' },
						{ label: 'Input 5', id: 'in5' },
						{ label: 'Input 6', id: 'in6' },
					],
				},
			],
		},

		inmng_status_coherency: {
			name: 'Input Manager Coherency',
			provide: ['feedback', 'preset', 'variable'],
			options: [
				{
					id: 'inmng', // opt1
					translation: 'inmng',
					label: 'Input Manager',
					type: 'dropdown',
					choices: self.choices.inmngChoices,
				},
				{
					id: 'channel', // opt2
					label: 'Input',
					type: 'dropdown',
					translation: 'genericIn',
					choices: [
						{ label: 'Input 1', id: 'in1' },
						{ label: 'Input 2', id: 'in2' },
						{ label: 'Input 3', id: 'in3' },
						{ label: 'Input 4', id: 'in4' },
						{ label: 'Input 5', id: 'in5' },
						{ label: 'Input 6', id: 'in6' },
					],
				},
			],
			parameters: [
				{
					id: 'coherency',
					path: '/status/input_manager/*/signals/*/coherency',
					label: 'Coherent',
					type: 'boolean',
				},
			],
		},

		inmng_status_locked: {
			name: 'Input Manager Locked',
			provide: ['feedback', 'preset', 'variable'],
			options: [
				{
					id: 'inmng', // opt1
					translation: 'inmng',
					label: 'Input Manager',
					type: 'dropdown',
					choices: self.choices.inmngChoices,
				},
				{
					id: 'channel', // opt2
					label: 'Input',
					type: 'dropdown',
					translation: 'genericIn',
					choices: [
						{ label: 'Input 1', id: 'in1' },
						{ label: 'Input 2', id: 'in2' },
						{ label: 'Input 3', id: 'in3' },
						{ label: 'Input 4', id: 'in4' },
						{ label: 'Input 5', id: 'in5' },
						{ label: 'Input 6', id: 'in6' },
					],
				},
			],
			parameters: [
				{
					id: 'trigger',
					path: '/status/input_manager/*/signals/*/trigger',
					label: 'Locked',
					type: 'boolean',
				},
			],
		},

		inmng_status_silence: {
			name: 'Input Manager Silence',
			provide: ['feedback', 'preset', 'variable'],
			options: [
				{
					id: 'inmng', // opt1
					translation: 'inmng',
					label: 'Input Manager',
					type: 'dropdown',
					choices: self.choices.inmngChoices,
				},
				{
					id: 'channel', // opt2
					label: 'Input',
					type: 'dropdown',
					translation: 'genericIn',
					choices: [
						{ label: 'Input 1', id: 'in1' },
						{ label: 'Input 2', id: 'in2' },
						{ label: 'Input 3', id: 'in3' },
						{ label: 'Input 4', id: 'in4' },
						{ label: 'Input 5', id: 'in5' },
						{ label: 'Input 6', id: 'in6' },
					],
				},
			],
			parameters: [
				{
					id: 'silence',
					path: '/status/input_manager/*/signals/*/silence',
					label: 'Silence Detected',
					type: 'boolean',
				},
			],
		},

		solo_bus_enabled: {
			name: 'Settings: Solo Bus Enabled',
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			provide: ['action', 'feedback', 'preset', 'variable'],
			parameters: [
				{
					id: 'solo_bus_enabled',
					path: '/settings/monitoring/solo_bus_enabled',
					label: 'Solo Bus Enabled',
					type: 'boolean',
				},
			],
		},

		monitoring_routing: {
			name: 'Routing: Patch Monitoring Route',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'sink',
					label: 'Destination',
					type: 'dropdown',
					translation: 'monitoringSnk',
					choices: self.choices.monitoringSnkChoices,
				},
			],
			parameters: [
				{
					id: 'source',
					path: '/settings/monitoring/routing/*',
					label: 'Source',
					type: 'dropdown',
					translation: 'monitoringSrc',
					choices: self.choices.monitoringSrcChoices,
				},
			],
		},

		monitoring_source1: {
			name: 'Settings: Monitoring Source 1',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'channel', // opt1
					label: 'Monitor 1 Channel',
					type: 'dropdown',
					choices: [
						{ label: 'Left', id: 0 },
						{ label: 'Right', id: 1 },
					],
				},
			],
			parameters: [
				{
					id: 'input',
					path: '/settings/monitoring/monitor_1/*',
					translation: 'input',
					label: 'Input',
					type: 'dropdown',
					choices: [...self.choices.unassigned, ...self.choices.inputChoices, ...self.choices.generatorSources],
				},
			],
		},

		monitoring_source2: {
			name: 'Settings: Monitoring Source 2',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'channel', // opt1
					label: 'Monitor 2 Channel',
					type: 'dropdown',
					choices: [
						{ label: 'Left', id: 0 },
						{ label: 'Right', id: 1 },
					],
				},
			],
			parameters: [
				{
					id: 'input',
					path: '/settings/monitoring/monitor_2/*',
					translation: 'input',
					label: 'Input',
					type: 'dropdown',
					choices: [...self.choices.unassigned, ...self.choices.inputChoices, ...self.choices.generatorSources],
				},
			],
		},

		monitoring_label: {
			name: 'Monitoring Label',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'channel', // opt1
					translation: 'monitoringSnk',
					label: 'Monitoring Channel',
					type: 'dropdown',
					choices: self.choices.monitoringSnkChoices,
				},
			],
			parameters: [
				{
					id: 'label',
					path: '/settings/monitoring/label/*',
					label: 'Label',
					type: 'string',
				},
			],
		},

		gpio_polarity: {
			name: 'Settings: GPIO Polarity',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'gpio', // opt1
					label: 'GPIO',
					type: 'dropdown',
					choices: [
						{ label: 'GP Input #1', id: 0 },
						{ label: 'GP Input #2', id: 1 },
						{ label: 'GP Output #1', id: 2 },
						{ label: 'GP Output #2', id: 3 },
					],
				},
			],
			parameters: [
				{
					id: 'polarity',
					path: '/settings/gpio_polarity/*',
					label: 'Polarity',
					type: 'boolean',
					choices: [
						{ label: 'Off / normal', id: '%%false%%' },
						{ label: 'On / reversed', id: '%%true%%' },
					],
				},
			],
		},

		gpo_set: {
			name: 'Settings: GPO',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'gpo', // opt1
					label: 'GPO',
					type: 'dropdown',
					choices: [
						{ label: 'GP Output #1', id: 0 },
						{ label: 'GP Output #2', id: 1 },
					],
				},
			],
			parameters: [
				{
					id: 'state',
					path: '/settings/gpo/*',
					label: 'On/Off',
					type: 'boolean',
				},
			],
		},

		// settings, slot_settings, <0..7>, channels, <0..7>
		slot_analog_gain: {
			name: 'Settings: Slot, Analog Gain',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MC', 'PRODIGY.MP', 'MAVEN.A'],
			options: [
				{
					id: 'slot', // opt1
					label: 'Slot',
					type: 'dropdown',
					choices: Array.from({ length: Number(deviceTables.numSlots[self.devicetype]) }, (_, i) => ({
						label: `Slot #${i + 1}`,
						id: i,
					})),
				},
				{
					id: 'channel', // opt2
					label: 'Channel',
					type: 'dropdown',
					choices: Array.from({ length: 8 }, (_, i) => ({
						label: `Channel ${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'analog_gain',
					path: '/settings/slot_settings/*/channels/*/analog_gain',
					label: 'Analog Gain',
					type: 'number',
					min: 5,
					max: 75,
					step: 1,
					tooltip: `Values range from 5 to 75, incrementing by 1.`,
					incremental: true,
				},
			],
		},

		slot_analog_phantom: {
			name: 'Settings: Slot, Phantom Power',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MC', 'PRODIGY.MP', 'MAVEN.A'],
			options: [
				{
					id: 'slot', // opt1
					label: 'Slot',
					type: 'dropdown',
					choices: Array.from({ length: Number(deviceTables.numSlots[self.devicetype]) }, (_, i) => ({
						label: `Slot #${i + 1}`,
						id: i,
					})),
				},
				{
					id: 'channel', // opt2
					label: 'Channel',
					type: 'dropdown',
					choices: Array.from({ length: 8 }, (_, i) => ({
						label: `Channel ${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'phantom_power',
					path: '/settings/slot_settings/*/channels/*/p48',
					label: 'Phantom Power',
					type: 'boolean',
				},
			],
		},

		slot_analog_pad: {
			name: 'Settings: Slot, Pad',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MC', 'PRODIGY.MP', 'MAVEN.A'],
			options: [
				{
					id: 'slot', // opt1
					label: 'Slot',
					type: 'dropdown',
					choices: Array.from({ length: Number(deviceTables.numSlots[self.devicetype]) }, (_, i) => ({
						label: `Slot #${i + 1}`,
						id: i,
					})),
				},
				{
					id: 'channel', // opt2
					label: 'Channel',
					type: 'dropdown',
					choices: Array.from({ length: 8 }, (_, i) => ({
						label: `Channel ${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'pad',
					path: '/settings/slot_settings/*/channels/*/pad',
					label: 'Pad',
					type: 'boolean',
				},
			],
		},

		slot_aes_src: {
			name: 'Settings: Slot, AES SRC',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MC', 'PRODIGY.MP', 'MAVEN.A'],
			options: [
				{
					id: 'slot', // opt1
					label: 'Slot',
					type: 'dropdown',
					choices: Array.from({ length: Number(deviceTables.numSlots[self.devicetype]) }, (_, i) => ({
						label: `Slot #${i + 1}`,
						id: i,
					})),
				},
				{
					id: 'channel', // opt2
					label: 'Channel',
					type: 'dropdown',
					choices: Array.from({ length: 4 }, (_, i) => ({
						label: `Channel ${i * 2 + 1}/${i * 2 + 2}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'src',
					path: '/settings/slot_settings/*/src/*',
					label: 'AES SRC',
					type: 'boolean',
				},
			],
		},

		slot_label_input: {
			name: 'Slot Label Input',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MC', 'PRODIGY.MP', 'MAVEN.A'],
			options: [
				{
					id: 'slot', // opt1
					label: 'Slot',
					type: 'dropdown',
					choices: Array.from({ length: Number(deviceTables.numSlots[self.devicetype]) }, (_, i) => ({
						label: `Slot #${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'label',
					path: '/settings/input_slot_name/*',
					label: 'Label',
					type: 'string',
				},
			],
		},

		slot_label_output: {
			name: 'Slot Label Output',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MC', 'PRODIGY.MP', 'MAVEN.A'],
			options: [
				{
					id: 'slot', // opt1
					label: 'Slot',
					type: 'dropdown',
					choices: Array.from({ length: Number(deviceTables.numSlots[self.devicetype]) }, (_, i) => ({
						label: `Slot #${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'label',
					path: '/settings/slot_name/*',
					label: 'Label',
					type: 'string',
				},
			],
		},

		flex_mute: {
			name: 'Flex Channel: Mute',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'flexchannel', // opt1
					translation: 'sinkFlex',
					label: 'Flex Channel',
					type: 'dropdown',
					choices: self.choices.outputFlexChoices,
				},
			],
			parameters: [
				{
					id: 'mute',
					path: '/settings/flex_channel/*/mute',
					label: 'Mute',
					type: 'boolean',
				},
			],
		},

		flex_polarity: {
			name: 'Flex Channel: Polarity',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'flexchannel', // opt1
					translation: 'sinkFlex',
					label: 'Flex Channel',
					type: 'dropdown',
					choices: self.choices.outputFlexChoices,
				},
			],
			parameters: [
				{
					id: 'polarity',
					path: '/settings/flex_channel/*/polarity',
					label: 'Polarity',
					type: 'dropdown',
					choices: [
						{ label: 'Off / normal', id: 0 },
						{ label: 'On / reversed', id: 1 },
					],
				},
			],
		},

		flex_gain: {
			name: 'Flex Channel: Gain',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'flexchannel', // opt1
					translation: 'sinkFlex',
					label: 'Flex Channel',
					type: 'dropdown',
					choices: self.choices.outputFlexChoices,
				},
			],
			parameters: [
				{
					id: 'gain',
					path: '/settings/flex_channel/*/gain',
					label: 'Gain',
					type: 'number',
					min: -144,
					max: 18,
					step: 0.1,
					default: 0,
					incremental: true,
				},
			],
		},

		flex_label: {
			name: 'Flex Channel Label',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'flexchannel', // opt1
					translation: 'sinkFlex',
					label: 'Flex Channel',
					type: 'dropdown',
					choices: self.choices.outputFlexChoices,
				},
			],
			parameters: [
				{
					id: 'label',
					path: '/settings/flex_channel/*/label',
					label: 'Label',
					type: 'string',
				},
			],
		},

		flex_time_adj: {
			name: 'Flex Channel: Time Adjust',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'flexchannel', // opt1
					translation: 'sinkFlex',
					label: 'Flex Channel',
					type: 'dropdown',
					choices: self.choices.outputFlexChoices,
				},
			],
			parameters: [
				{
					id: 'time_adj',
					path: '/settings/flex_channel/*/time_adj',
					label: 'Samples',
					type: 'number',
					min: 0,
					max: 511,
					step: 1,
					default: 0,
				},
			],
		},

		flex_automix_contrib: {
			name: 'Flex Channel: Automix Contribution',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'flexchannel', // opt1
					translation: 'sinkFlex',
					label: 'Flex Channel',
					type: 'dropdown',
					choices: self.choices.outputFlexChoices,
				},
			],
			parameters: [
				{
					id: 'automix_contrib',
					path: '/settings/flex_channel/*/automix_contrib',
					label: 'Percent',
					type: 'number',
					min: 0,
					max: 100,
					step: 1,
					default: 100,
				},
			],
		},

		flex_automix_priority: {
			name: 'Flex Channel: Automix Priority',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'flexchannel', // opt1
					translation: 'sinkFlex',
					label: 'Flex Channel',
					type: 'dropdown',
					choices: self.choices.outputFlexChoices,
				},
			],
			parameters: [
				{
					id: 'automix_priority',
					path: '/settings/flex_channel/*/automix_priority',
					label: 'Priority',
					type: 'number',
					min: 0,
					max: 18,
					step: 0.1,
					tooltip: `Values range from 0.0 to 18.0.`,
				},
			],
		},

		eq_fir_enable: {
			name: 'EQ FIR Enable',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'MAVEN.A'],
			options: [
				{
					id: 'eqfir', // opt1
					label: 'FIR Equalizer',
					type: 'dropdown',
					choices: Array.from({ length: Number(deviceTables.numEqFIR[self.devicetype]) }, (_, i) => ({
						label: `FIR EQ ${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'eq_enabled',
					path: '/settings/eq/*/enabled',
					label: 'Enable',
					type: 'boolean',
				},
			],
		},

		eq_iir_enable: {
			name: 'EQ IIR Enable',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'eqiir', // opt1
					label: 'IIR Equalizer',
					type: 'dropdown',
					choices: Array.from({ length: Number(deviceTables.numEqIIR[self.devicetype]) }, (_, i) => ({
						label: `IIR EQ ${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'eq_enabled',
					path: '/settings/iir_eq/*/enabled',
					label: 'Enable',
					type: 'boolean',
				},
			],
		},

		// TODO: Comes to halt because of option dependencies: the number of masters depends on the mixer
		// mtx_master_mute: {
		// 	name: 'Matrix Mixer Master Mute',
		// 	provide: ['action', 'feedback', 'preset', 'variable'],
		// 	device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
		// 	options: [
		// 		{
		// 			id: 'mixer', // opt1
		// 			label: 'Matrix Mixer',
		// 			type: 'dropdown',
		// 			choices: deviceTables.matMixer.map((mtx, i) => ({id: i, label: `${mtx.label} (${mtx.in}x${mtx.out})` })),
		// 		},
		// 		{
		// 			id: '',
		// 			label: 'Matrix Mixer',
		// 			type: 'dropdown',
		// 			choices: deviceTables.matMixer.map((mtx, i) => ({id: i, label: `${mtx.label} (${mtx.in}x${mtx.out})` })),
		// 		}
		// 	]
		// },

		mtx_label: {
			name: 'Matrix Mixer Label',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP'],
			options: [
				{
					id: 'mixer', // opt1
					translation: 'mtxNum',
					label: 'Mixer',
					type: 'dropdown',
					choices: (deviceTables.matMixer[self.devicetype] as Record<string, unknown>[]).map((mtx) => ({
						id: `${mtx.id}`,
						label: `${mtx.label} (${mtx.in}x${mtx.out})`,
					})),
				},
			],
			parameters: [
				{
					id: 'label',
					path: '/settings/mixer/*/label',
					label: 'Label',
					type: 'string',
				},
			],
		},

		automix_label: {
			name: 'Automix Label',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'automix', // opt1
					label: 'Automix',
					type: 'dropdown',
					choices: Array.from({ length: 16 }, (_, i) => ({
						label: `Automix ${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'label',
					path: '/settings/automix/*/label',
					label: 'Label',
					type: 'string',
				},
			],
		},

		automix_speed: {
			name: 'Automix Speed',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'automix', // opt1
					label: 'Automix',
					type: 'dropdown',
					choices: Array.from({ length: 16 }, (_, i) => ({
						label: `Automix ${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'speed',
					path: '/settings/automix/*/speed',
					label: 'Speed',
					type: 'dropdown',
					choices: [
						{ label: '1 - Fast', id: 0 },
						{ label: '2', id: 1 },
						{ label: '3', id: 2 },
						{ label: '4', id: 3 },
						{ label: '5', id: 4 },
						{ label: '6', id: 5 },
						{ label: '7', id: 6 },
						{ label: '8 - Slow', id: 7 },
					],
				},
			],
		},

		automix_bias: {
			name: 'Automix Hush Wizard',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'automix', // opt1
					label: 'Automix',
					type: 'dropdown',
					choices: Array.from({ length: 16 }, (_, i) => ({
						label: `Automix ${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'bias',
					path: '/settings/automix/*/bias',
					label: 'Hush Wizard',
					type: 'number',
					min: -104,
					max: 0,
					step: 0.1,
					default: -104,
				},
			],
		},

		group_gain: {
			name: 'Group Gain',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'group', // opt1
					translation: 'groups',
					label: 'Group',
					type: 'dropdown',
					choices: self.choices.groupsChoices,
				},
			],
			parameters: [
				{
					id: 'gain',
					path: '/settings/group/channel/*/gain',
					label: 'Gain',
					type: 'number',
					min: -144,
					max: 18,
					step: 0.1,
					incremental: true,
				},
			],
		},

		group_label: {
			name: 'Group Label',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'group', // opt1
					translation: 'groups',
					label: 'Group',
					type: 'dropdown',
					choices: self.choices.groupsChoices,
				},
			],
			parameters: [
				{
					id: 'label',
					path: '/settings/group/channel/*/label',
					label: 'Label',
					type: 'string',
				},
			],
		},

		group_mute: {
			name: 'Group Mute',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'group', // opt1
					translation: 'groups',
					label: 'Group',
					type: 'dropdown',
					choices: self.choices.groupsChoices,
				},
			],
			parameters: [
				{
					id: 'mute',
					path: '/settings/group/channel/*/mute',
					label: 'Mute',
					type: 'boolean',
					choices: self.choices.muteChoices,
				},
			],
		},

		group_fadeout: {
			name: 'Group Fade Out',
			provide: ['action', 'feedback', 'preset', 'variable'],
			options: [
				{
					id: 'group', // opt1
					translation: 'groups',
					label: 'Group',
					type: 'dropdown',
					choices: self.choices.groupsChoices,
				},
			],
			parameters: [
				{
					id: 'fade_out',
					path: '/settings/group/channel/*/fade_out',
					label: 'Fade Out',
					type: 'boolean',
					choices: [
						{ label: `Fade in`, id: '%%false%%' },
						{ label: `Fade out`, id: '%%true%%' },
					],
				},
			],
		},

		group_fadingstate: {
			name: 'Group Fading State',
			provide: ['feedback', 'variable'],
			options: [
				{
					id: 'group', // opt1
					translation: 'groups',
					label: 'Group',
					type: 'dropdown',
					choices: self.choices.groupsChoices,
				},
			],
			parameters: [
				{
					id: 'fading_state',
					path: '/settings/group/channel/*/fading_state',
					translation: 'fadingStates',
					label: 'Fading State',
					type: 'dropdown',
					choices: [
						{ label: `Faded in`, id: 'faded_in' },
						{ label: `Fading in`, id: 'fading_in' },
						{ label: `Fading out`, id: 'fading_out' },
						{ label: `Faded out`, id: 'faded_out' },
					],
				},
			],
		},

		delay_enable: {
			name: 'Delay Enable',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'delay', // opt1
					label: 'Delay',
					type: 'dropdown',
					choices: Array.from({ length: Number(deviceTables.numDelay[self.devicetype]) }, (_, i) => ({
						label: `Delay ${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'delay_enabled',
					path: '/settings/delay/*/enabled',
					label: 'Enable',
					type: 'boolean',
				},
			],
		},

		delay_samples: {
			name: 'Delay Samples',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'delay', // opt1
					label: 'Delay',
					type: 'dropdown',
					choices: Array.from({ length: Number(deviceTables.numDelay[self.devicetype]) }, (_, i) => ({
						label: `Delay ${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'samples',
					path: '/settings/delay/*/samples',
					label: 'Samples',
					type: 'number',
					min: 0,
					max: 65535,
					step: 1,
					default: 0,
					incremental: true,
				},
			],
		},

		compressor_enable: {
			name: 'Compressor Enable',
			provide: ['action', 'feedback', 'preset', 'variable'],
			device: ['PRODIGY.MP', 'PRODIGY.MX', 'MAVEN.A'],
			options: [
				{
					id: 'compressor', // opt1
					label: 'Compressor',
					type: 'dropdown',
					choices: Array.from({ length: Number(deviceTables.numCompressor[self.devicetype]) }, (_, i) => ({
						label: `Compressor ${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'compressor_enabled',
					path: '/settings/compressor/*/enabled',
					label: 'Enable',
					type: 'boolean',
				},
			],
		},

		/* ===============
		   			STATUS
			 =============== */

		status_gpi: {
			name: 'GPI Status',
			provide: ['feedback', 'variable'],
			options: [
				{
					id: 'gpi', // opt1
					label: 'GPI Number',
					type: 'dropdown',
					choices: Array.from({ length: 2 }, (_, i) => ({
						label: `GPI ${i + 1}`,
						id: i,
					})),
				},
			],
			parameters: [
				{
					id: 'state',
					path: '/status/gpi/*',
					label: 'GPI State',
					type: 'boolean',
				},
			],
		},

		status_ears_active: {
			name: 'EARS Active Status',
			provide: ['feedback', 'variable'],
			parameters: [
				{
					id: 'active',
					path: '/status/ears_status/*/active',
					label: 'Now active',
					type: 'dropdown',
					choices: [
						{ label: 'Main', id: 0 },
						{ label: 'Backup', id: 1 },
						{ label: 'Recovery', id: 2 },
					],
				},
			],
			options: [
				{
					id: 'ears', // opt1
					translation: 'ears',
					label: 'EARS on',
					type: 'dropdown',
					choices: self.choices.earsChoices,
				},
			],
		},

		status_ears_pilot: {
			name: 'EARS Pilot Status',
			provide: ['feedback', 'variable'],
			parameters: [
				{
					id: 'audio_pilot',
					path: '/status/ears_status/*/audio_pilot',
					label: 'Pilot sound',
					type: 'boolean',
					choices: [
						{ label: 'present', id: '%%true%%' },
						{ label: 'not present', id: '%%false%%' },
					],
				},
			],
			options: [
				{
					id: 'ears', // opt1
					translation: 'ears',
					label: 'EARS on',
					type: 'dropdown',
					choices: self.choices.earsChoices,
				},
			],
		},

		status_ears_blds: {
			name: 'EARS BLDS Status',
			provide: ['feedback', 'variable'],
			parameters: [
				{
					id: 'blds_present',
					path: '/status/ears_status/*/blds',
					label: 'BLDS',
					type: 'boolean',
					choices: [
						{ label: 'present', id: '%%true%%' },
						{ label: 'not present', id: '%%false%%' },
					],
				},
			],
			options: [
				{
					id: 'ears', // opt1
					translation: 'ears',
					label: 'EARS on',
					type: 'dropdown',
					choices: self.choices.earsChoices,
				},
			],
		},

		status_warnings_active: {
			name: 'Warnings Active Status',
			device: ['PRODIGY.MC', 'PRODIGY.MP', 'PRODIGY.MX'],
			provide: ['feedback', 'variable'],
			parameters: [
				{
					id: 'active',
					path: '/status/warnings/active',
					label: 'Warnings',
					type: 'boolean',
				},
			],
		},

		status_warnings_message: {
			name: 'Warnings Message',
			device: ['PRODIGY.MC', 'PRODIGY.MP', 'PRODIGY.MX'],
			provide: ['feedback', 'variable'],
			parameters: [
				{
					id: 'message',
					path: '/status/warnings/message',
					label: 'Warnings Message',
					type: 'string',
				},
			],
		},

		snapshot_last_id: {
			name: 'Last Recalled Snapshot ID',
			provide: ['feedback', 'variable'],
			parameters: [
				{
					id: 'last_snapshot_recalled',
					path: '/last_snapshot_recalled',
					label: 'ID',
					type: 'number',
				},
			],
		},

		snapshot_last_pos: {
			name: 'Last Recalled Snapshot Position',
			provide: ['feedback', 'variable'],
			parameters: [
				{
					id: 'last_snapshot_recalled_pos',
					path: '/last_snapshot_recalled_pos',
					label: 'Position',
					type: 'number',
				},
			],
		},

		snapshot_last_name: {
			name: 'Last Recalled Snapshot Name',
			provide: ['feedback', 'variable'],
			parameters: [
				{
					id: 'last_snapshot_recalled_name',
					path: '/last_snapshot_recalled_name',
					label: 'Snapshot Name',
					type: 'string',
				},
			],
		},
	}
	return parameters
}
