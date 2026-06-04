import { CompanionPresetDefinition, CompanionPresetDefinitions, CompanionTextSize } from '@companion-module/base'
import { DirectoutInstance } from './main.js'
import { contrastcolor } from './utils.js'

export function returnPresetDefinitions(self: DirectoutInstance): CompanionPresetDefinitions {
	const defaultcolor_bg = self.config.defaultcolor_bg
	const defaultcolor_inactive = self.config.defaultcolor_inactive
	const defaultcolor_active = self.config.defaultcolor_active
	const defaultcolor_ok = self.config.defaultcolor_ok
	const defaultcolor_warn = self.config.defaultcolor_warn
	const defaultcolor_bad = self.config.defaultcolor_bad
	const circulararrow =
		'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgd2lkdGg9IjUwLjMwNjk2MSIKICAgaGVpZ2h0PSI1Mi45MjAxODUiCiAgIHZpZXdCb3g9IjAgMCA1MC4zMDY5NjEgNTIuOTIwMTg1IgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmcxIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIxLjMuMiAoMDkxZTIwZSwgMjAyMy0xMS0yNSwgY3VzdG9tKSIKICAgc29kaXBvZGk6ZG9jbmFtZT0icm90YXRlLWxyLnN2ZyIKICAgeG1sbnM6aW5rc2NhcGU9Imh0dHA6Ly93d3cuaW5rc2NhcGUub3JnL25hbWVzcGFjZXMvaW5rc2NhcGUiCiAgIHhtbG5zOnNvZGlwb2RpPSJodHRwOi8vc29kaXBvZGkuc291cmNlZm9yZ2UubmV0L0RURC9zb2RpcG9kaS0wLmR0ZCIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9Im5hbWVkdmlldzEiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjMDAwMDAwIgogICAgIGJvcmRlcm9wYWNpdHk9IjAuMjUiCiAgICAgaW5rc2NhcGU6c2hvd3BhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAuMCIKICAgICBpbmtzY2FwZTpwYWdlY2hlY2tlcmJvYXJkPSJ0cnVlIgogICAgIGlua3NjYXBlOmRlc2tjb2xvcj0iI2QxZDFkMSIKICAgICBpbmtzY2FwZTpkb2N1bWVudC11bml0cz0icHgiCiAgICAgaW5rc2NhcGU6em9vbT0iMTIuNDA5NzI0IgogICAgIGlua3NjYXBlOmN4PSIyNy40Nzg0NTIiCiAgICAgaW5rc2NhcGU6Y3k9IjMxLjE0NDkzMSIKICAgICBpbmtzY2FwZTp3aW5kb3ctd2lkdGg9IjIwNjQiCiAgICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iMTIyMyIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMzA2IgogICAgIGlua3NjYXBlOndpbmRvdy15PSIyMzYiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMCIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJsYXllcjEiPgogICAgPGlua3NjYXBlOnBhZ2UKICAgICAgIHg9IjAiCiAgICAgICB5PSIwIgogICAgICAgd2lkdGg9IjUwLjMwNjk2MSIKICAgICAgIGhlaWdodD0iNTIuOTIwMTg1IgogICAgICAgaWQ9InBhZ2UyIgogICAgICAgbWFyZ2luPSIwIDUwIDQ2LjYwOTY4OCAwIgogICAgICAgYmxlZWQ9IjAiIC8+CiAgPC9zb2RpcG9kaTpuYW1lZHZpZXc+CiAgPGRlZnMKICAgICBpZD0iZGVmczEiIC8+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iRWJlbmUgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiPgogICAgPHBhdGgKICAgICAgIGlkPSJwYXRoMTQiCiAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eTowLjQwMDAwMDAxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDowO3N0cm9rZS1vcGFjaXR5OjAiCiAgICAgICBkPSJtIDI1LjE1NDI4LDMuNjI2MTg4NiBjIC05LjY5MjQwNywtMmUtNyAtMTguMTIyNDU0Nyw2Ljc5OTM0MzQgLTIwLjIxNTcyMTcsMTYuMjc4NjgxNCAtMS44MTE3NTEsOC4yMDQ1MDIgMS41MjIxODUsMTYuNTg3NzM2IDguMTQ0MTY5NywyMS4zNjAzNDcgbCAtMi43Njk5MjEsNS45MTc2MjMgMTQuMzMzNDczLC00LjU2ODgzMyAtNS42NzE2NTUsLTEzLjkzNDc4NiAtMi4zNjE1ODgsNS4wNDMwOCBjIC0zLjI0NTk3MSwtMi45OTIwNTggLTQuNzc0MjYsLTcuNTQ2NTMyIC0zLjc3NDY3MSwtMTIuMDczMTY5IDEuMjg4MTcyLC01LjgzMzQ2IDYuMzg1MzMzLC05LjkzMzQzOCAxMi4zMTU5MTQsLTkuOTMzNDM4IDUuOTMwNTksMCAxMS4wMjYxNDgsNC4wOTk5NzggMTIuMzE0MzEyLDkuOTMzNDM4IDAuOTk5NTg5LDQuNTI2NjM3IC0wLjUyODY5Niw5LjA4MTExMSAtMy43NzQ2NjcsMTIuMDczMTY5IGwgLTIuMzYxNTg5LC01LjA0MzA4IC01LjY3MTY1OCwxMy45MzQ3ODYgMTQuMzMzNDc3LDQuNTY4ODMzIC0yLjc2OTkxNywtNS45MTc2MjMgQyA0My44NDYyMiwzNi40OTI2MDUgNDcuMTgwMTU1LDI4LjEwOTM3MiA0NS4zNjg0MDEsMTkuOTA0ODcgNDMuMjc1MTM1LDEwLjQyNTUzMiAzNC44NDY2OTksMy42MjYxODkgMjUuMTU0MjgsMy42MjYxODg2IFoiIC8+CiAgPC9nPgo8L3N2Zz4KPCEtLSBDcmVhdGVkIHdpdGggSW5rc2NhcGUgKGh0dHA6Ly93d3cuaW5rc2NhcGUub3JnLykgLS0+Cgo='

	// const contrastcolor = (color: number | string) => {
	// 	const hsl = splitHsl(color)
	// 	if (hsl.l > 0.5) return 0
	// 	else return 0xffffff
	// }

	const presets: CompanionPresetDefinition[] = [
		{
			type: 'button',
			category: 'Input',
			style: {
				text: '`${$(DO:input_label)["src_slot2_1"]}\\nMute\\n ${toFixed($(DO:input_trim)["src_madi1_1"],1)} dB Trim`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'mute_input',
					options: {
						input: 'src_slot2_1',
						input_mute: 1,
					},
					style: {
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
					},
					isInverted: false,
					headline: 'Change background when input is muted',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'mute_input',
							options: {
								input: 'src_slot2_1',
								input_mute: '%%toggle%%',
							},
							headline: 'Toggle Input Mute',
						},
					],
					up: [],
				},
			],
			name: 'Input Mute and Trim',
		},
		{
			type: 'button',
			category: 'Input',
			style: {
				text: '`${$(DO:input_label)["src_slot2_1"]}\\nMute\\n ${$(DO:settings_slot_pad)["1"]["0"]?$(DO:settings_slot_analog_gain)["1"]["0"]-9:$(DO:settings_slot_analog_gain)["1"]["0"]+0} dB`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'mute_input',
					options: {
						input: 'src_slot2_1',
						input_mute: 1,
					},
					style: {
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
					},
					isInverted: false,
					headline: 'Change background when input is muted',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'mute_input',
							options: {
								input: 'src_slot2_1',
								input_mute: '%%toggle%%',
							},
							headline: 'Toggle input mute',
						},
					],
					up: [],
				},
			],
			name: 'Input Mute and Gain',
		},
		{
			type: 'button',
			category: 'Input',
			style: {
				text: 'PAD',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'slot_analog_pad',
					options: {
						slot: 1,
						channel: 0,
						pad: true,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when pad is enabled',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'slot_analog_pad',
							options: {
								slot: 1,
								channel: 0,
								pad: '%%toggle%%',
							},
							headline: 'Toggle input pad',
						},
					],
					up: [],
				},
			],
			name: 'PAD',
		},
		{
			type: 'button',
			category: 'Input',
			style: {
				text: 'Input Polarity',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'input_polarity',
					options: {
						input: 'src_slot2_1',
						input_polarity: 1,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when input polarity is inverted',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'input_polarity',
							options: {
								input: 'src_slot2_1',
								input_polarity: '%%toggle%%',
							},
							headline: 'Toggle input polarity',
						},
					],
					up: [],
				},
			],
			name: 'Input Polarity',
		},
		{
			type: 'button',
			category: 'Input',
			style: {
				text: '48 V',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'slot_analog_phantom',
					options: {
						slot: 1,
						channel: 0,
						phantom_power: true,
					},
					style: {
						color: contrastcolor(16744448),
						bgcolor: 16744448,
					},
					isInverted: false,
					headline: 'Change background when phantom power is enabled',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'slot_analog_phantom',
							options: {
								slot: 1,
								channel: 0,
								phantom_power: '%%toggle%%',
							},
							headline: 'Toggle phantom power',
						},
					],
					up: [],
				},
			],
			name: 'Phantom Power',
		},
		{
			type: 'button',
			category: 'Input',
			style: {
				text: 'AES SRC',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'slot_aes_src',
					options: {
						slot: 0,
						channel: 0,
						src: true,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when AES input SRC is enabled',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'slot_aes_src',
							options: {
								slot: 0,
								channel: 0,
								src: '%%toggle%%',
							},
							headline: 'Toggle AES input SRC',
						},
					],
					up: [],
				},
			],
			name: 'AES SRC',
		},
		{
			type: 'button',
			category: 'Output',
			style: {
				text: '`${$(DO:output_label)["snk_madi1_1"]}\\nMute\\n ${toFixed($(DO:output_trim)["snk_madi1_1"],1)} dB Trim`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'mute_output',
					options: {
						output: 'snk_madi1_1',
						output_mute: 1,
					},
					style: {
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
					},
					isInverted: false,
					headline: 'Change background when output is muted',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'mute_output',
							options: {
								output: 'snk_madi1_1',
								output_mute: '%%toggle%%',
							},
							headline: 'Toggle output mute',
						},
					],
					up: [],
				},
			],
			name: 'Output Mute and Trim',
		},
		{
			type: 'button',
			category: 'Output',
			style: {
				text: '`${$(DO:output_label)["snk_madi1_1"]}\\nMute\\n ${toFixed($(DO:output_gain)["snk_madi1_1"],1)} dB`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'mute_output',
					options: {
						output: 'snk_madi1_1',
						output_mute: 1,
					},
					style: {
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
					},
					isInverted: false,
					headline: 'Change background when output is muted',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'mute_output',
							options: {
								output: 'snk_madi1_1',
								output_mute: '%%toggle%%',
							},
							headline: 'Toggle output mute',
						},
					],
					up: [],
				},
			],
			name: 'Output Mute and Gain',
		},
		{
			type: 'button',
			category: 'Output',
			style: {
				text: 'Output Polarity',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'output_polarity',
					options: {
						output: 'snk_madi1_1',
						output_polarity: 1,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when output polarity is enabled',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'output_polarity',
							options: {
								output: 'snk_madi1_1',
								output_polarity: '%%toggle%%',
							},
							headline: 'Toggle output polarity',
						},
					],
					up: [],
				},
			],
			name: 'Output Polarity',
		},
		{
			type: 'button',
			category: 'Output',
			style: {
				text: 'LV Coherence',
				textExpression: false,
				size: '12' as CompanionTextSize,
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'inmng_coherency',
					options: {
						inmng: 'srcdsp_inmng1_1',
						coherency_detection: true,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when coherency detection is enabled',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'inmng_coherency',
							options: {
								inmng: 'srcdsp_inmng1_1',
								coherency_detection: '%%toggle%%',
							},
							headline: 'Toggle In Mng coherency detection',
						},
					],
					up: [],
				},
			],
			name: 'In Mng Coherence Detection',
		},
		{
			type: 'button',
			category: 'Output',
			style: {
				text: 'Force\\nAuto',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'inmng_manual',
					options: {
						inmng: 'srcdsp_inmng1_1',
						manual: 'none',
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
						text: 'Auto',
						textExpression: false,
					},
					isInverted: false,
					headline: 'Change background when In Mng manual mode is disabled',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'inmng_manual',
							options: {
								inmng: 'srcdsp_inmng1_1',
								manual: 'none',
							},
							headline: 'Disable In Mng manual mode',
						},
					],
					up: [],
				},
			],
			name: 'In Mng Force Auto',
		},
		{
			type: 'button',
			category: 'Output',
			style: {
				text: '`${$(DO:input_manager_label)["srcdsp_inmng1_1"]}\\n#1`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'inmng_status_active',
					options: {
						inmng: 'srcdsp_inmng1_1',
						channel: 'in1',
					},
					style: {
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change background and text color when In Mng slot is active',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'In Mng Active #1 ',
		},
		{
			type: 'button',
			category: 'Output',
			style: {
				text: 'Lock\\n#1',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'inmng_status_locked',
					options: {
						inmng: 'srcdsp_inmng1_1',
						channel: 'in1',
						trigger: true,
					},
					style: {
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change background and text color when In Mng slot is locked',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'In Mng Lock Status',
		},
		{
			type: 'button',
			category: 'Output',
			style: {
				text: 'Coherence\\n#1',
				textExpression: false,
				size: '12' as CompanionTextSize,
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'inmng_status_coherency',
					options: {
						inmng: 'srcdsp_inmng1_1',
						channel: 'in1',
						coherency: true,
					},
					style: {
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change background and text color when In Mng slot coherence is detected',
				},
				{
					feedbackId: 'inmng_coherency',
					options: {
						inmng: 'srcdsp_inmng1_1',
						coherency_detection: false,
					},
					style: {
						text: '',
						textExpression: false,
						color: contrastcolor(defaultcolor_bg),
						bgcolor: defaultcolor_bg as any,
					},
					isInverted: false,
					headline: 'Change background and text when In Mng coherence detection is disabled',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'In Mng Coherence Status',
		},
		{
			type: 'button',
			category: 'Output',
			style: {
				text: 'Force\\nManual\\n#1',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'inmng_manual',
					options: {
						inmng: 'srcdsp_inmng1_1',
						manual: 'in1',
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
						text: 'Manual\\n#1',
						textExpression: false,
					},
					isInverted: false,
					headline: 'Change background and text when In Mng slot is set to manual',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'inmng_manual',
							options: {
								inmng: 'srcdsp_inmng1_1',
								manual: 'in1',
							},
							headline: 'Set In Mng slot to manual',
						},
					],
					up: [],
				},
			],
			name: 'In Mng Force Manual ',
		},
		{
			type: 'button',
			category: 'EARS',
			style: {
				text: 'Ears Active Status',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'status_ears_active',
					options: {
						ears: 'ears_madi_1',
						active: 0,
					},
					style: {
						text: 'Main',
						textExpression: false,
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change background and text when EARS Main is active',
				},
				{
					feedbackId: 'status_ears_active',
					options: {
						ears: 'ears_madi_1',
						active: 1,
					},
					style: {
						text: 'Backup',
						textExpression: false,
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
					},
					isInverted: false,
					headline: 'Change background and text when EARS Backup is active',
				},
				{
					feedbackId: 'status_ears_active',
					options: {
						ears: 'ears_madi_1',
						active: 2,
					},
					style: {
						text: 'Recovery',
						textExpression: false,
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
					},
					isInverted: false,
					headline: 'Change background and text when EARS recovery is active',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'Ears Active Status',
		},
		{
			type: 'button',
			category: 'EARS',
			style: {
				text: 'Auto\\nPriority',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'ears_priority',
					options: {
						ears: 'ears_madi_1',
						priority: 3,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when priority is set to Auto',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'ears_priority',
							options: {
								ears: 'ears_madi_1',
								priority: 3,
							},
							headline: 'Set EARS priority to Auto',
						},
					],
					up: [],
				},
			],
			name: 'Ears Priority Auto',
		},
		{
			type: 'button',
			category: 'EARS',
			style: {
				text: 'Main\\nPriority',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'ears_priority',
					options: {
						ears: 'ears_madi_1',
						priority: 1,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
						text: 'Main\\nPriority',
						textExpression: false,
					},
					isInverted: false,
					headline: 'Change background when priority is set to Main',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'ears_priority',
							options: {
								ears: 'ears_madi_1',
								priority: 1,
							},
							headline: 'Set EARS priority to Main',
						},
					],
					up: [],
				},
			],
			name: 'Ears Priority Main',
		},
		{
			type: 'button',
			category: 'EARS',
			style: {
				text: 'Backup\\nPriority',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'ears_priority',
					options: {
						ears: 'ears_madi_1',
						priority: 2,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when priority is set to Backup',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'ears_priority',
							options: {
								ears: 'ears_madi_1',
								priority: 2,
							},
							headline: 'Set EARS priority to Backup',
						},
					],
					up: [],
				},
			],
			name: 'Ears Priority Backup',
		},
		{
			type: 'button',
			category: 'EARS',
			style: {
				text: 'Main\\nN/A',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'status_ears_blds',
					options: {
						ears: 'ears_madi_1',
						blds_present: true,
					},
					style: {
						text: 'Main\\nBLDS',
						textExpression: false,
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change background and text when BLDS is detected',
				},
				{
					feedbackId: 'status_ears_pilot',
					options: {
						ears: 'ears_madi_1',
						audio_pilot: true,
					},
					style: {
						text: 'Main\\nPilot',
						textExpression: false,
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background and text when Pilot is detected',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'Ears Main Trigger ',
		},
		{
			type: 'button',
			category: 'EARS',
			style: {
				text: 'Backup\\nN/A',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'status_ears_blds',
					options: {
						ears: 'ears_madi_2',
						blds_present: true,
					},
					style: {
						text: 'Backup\\nBLDS',
						textExpression: false,
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change background and text when BLDS is detected',
				},
				{
					feedbackId: 'status_ears_pilot',
					options: {
						ears: 'ears_madi_2',
						audio_pilot: true,
					},
					style: {
						text: 'Backup\\nPilot',
						textExpression: false,
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background and text when Pilot is detected',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'Ears Backup Trigger ',
		},
		{
			type: 'button',
			category: 'EARS',
			style: {
				text: 'Recovery\\nN/A',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'status_ears_blds',
					options: {
						ears: 'ears_net_1a',
						blds_present: true,
					},
					style: {
						text: 'Recovery\\nBLDS',
						textExpression: false,
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change background and text when BLDS is detected',
				},
				{
					feedbackId: 'status_ears_pilot',
					options: {
						ears: 'ears_net_1a',
						audio_pilot: true,
					},
					style: {
						text: 'Recovery\\nPilot',
						textExpression: false,
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background and text when Pilot is detected',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'Ears Recovery Trigger ',
		},
		{
			type: 'button',
			category: 'EARS',
			style: {
				text: 'Force\\nOff',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'ears_force',
					options: {
						ears: 'ears_madi_1',
						force: 0,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when manual mode is disabled',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'ears_force',
							options: {
								ears: 'ears_madi_1',
								force: 0,
							},
							headline: 'Disable EARS manual mode',
						},
					],
					up: [],
				},
			],
			name: 'Force Off',
		},
		{
			type: 'button',
			category: 'EARS',
			style: {
				text: 'Force\\nMain',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'ears_force',
					options: {
						ears: 'ears_madi_1',
						force: 1,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when manual mode is forced',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'ears_force',
							options: {
								ears: 'ears_madi_1',
								force: 1,
							},
							headline: 'Force Main to manual',
						},
					],
					up: [],
				},
			],
			name: 'Force Main',
		},
		{
			type: 'button',
			category: 'EARS',
			style: {
				text: 'Force\\nBackup',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'ears_force',
					options: {
						ears: 'ears_madi_1',
						force: 2,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when manual mode is forced',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'ears_force',
							options: {
								ears: 'ears_madi_1',
								force: 2,
							},
							headline: 'Force Backup to manual',
						},
					],
					up: [],
				},
			],
			name: 'Force Backup',
		},
		{
			type: 'button',
			category: 'EARS',
			style: {
				text: 'Force\\nRecovery',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'ears_force',
					options: {
						ears: 'ears_madi_1',
						force: 3,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when manual mode is forced',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'ears_force',
							options: {
								ears: 'ears_madi_1',
								force: 3,
							},
							headline: 'Force Disaster Recovery to manual',
						},
					],
					up: [],
				},
			],
			name: 'Force Recovery',
		},
		{
			type: 'button',
			category: 'Flex Channel',
			style: {
				text: '`${$(DO:flex_channel_label)["snkdsp_flex1_1"]}\\n${$(DO:flex_channel_gain)["snkdsp_flex1_1"]} dB`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'flex_mute',
					options: {
						flexchannel: 'snkdsp_flex1_1',
						mute: true,
					},
					style: {
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
					},
					isInverted: false,
					headline: 'Change background when Flex Channel is muted',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'flex_mute',
							options: {
								flexchannel: 'snkdsp_flex1_1',
								mute: '%%toggle%%',
							},
							headline: 'Toggle Flex Channel mute',
						},
					],
					up: [],
				},
			],
			name: 'Flex Channel Mute,  Label and Gain',
		},
		{
			type: 'button',
			category: 'Flex Channel',
			options: {
				rotaryActions: true,
			},
			style: {
				text: '`${$(DO:flex_channel_label)["snkdsp_flex1_1"]}\\n${$(DO:flex_channel_gain)["snkdsp_flex1_1"]} dB`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
				png64: circulararrow,
			},
			feedbacks: [
				{
					feedbackId: 'flex_mute',
					options: {
						flexchannel: 'snkdsp_flex1_1',
						mute: true,
					},
					style: {
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
					},
					isInverted: false,
					headline: 'Change background when Flex Channel is muted',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'flex_mute',
							options: {
								flexchannel: 'snkdsp_flex1_1',
								mute: '%%toggle%%',
							},
							headline: 'Toggle Flex Channel mute',
						},
					],
					up: [],
					rotate_left: [
						{
							actionId: 'flex_gain',
							options: {
								flexchannel: 'snkdsp_flex1_1',
								gain: 0,
								gain_incrementalValue: -0.2,
								gain_incrementalToggle: true,
							},
							headline: 'Decrease gain at left turn',
						},
					],
					rotate_right: [
						{
							actionId: 'flex_gain',
							options: {
								flexchannel: 'snkdsp_flex1_1',
								gain: 0,
								gain_incrementalValue: 0.2,
								gain_incrementalToggle: true,
							},
							headline: 'Increase gain at right turn',
						},
					],
				},
			],
			name: 'Flex Channel Gain on rotation, Mute on press, Label and Gain on Display',
		},
		{
			type: 'button',
			category: 'Flex Channel',
			style: {
				text: 'Flex Channel Polarity',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'flex_polarity',
					options: {
						flexchannel: 'snkdsp_flex1_1',
						polarity: 1,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
						text: 'Polarity',
						textExpression: false,
					},
					isInverted: false,
				},
				{
					feedbackId: 'flex_polarity',
					options: {
						flexchannel: 'snkdsp_flex1_1',
						polarity: 0,
					},
					style: {
						color: contrastcolor(defaultcolor_inactive),
						bgcolor: defaultcolor_inactive as any,
						text: 'Polarity',
						textExpression: false,
					},
					isInverted: false,
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'flex_polarity',
							options: {
								flexchannel: 'snkdsp_flex1_1',
								polarity: '%%toggle%%',
							},
							headline: 'Toggel Flex Channel polarity',
						},
					],
					up: [],
				},
			],
			name: 'Flex Channel Polarity',
		},
		{
			type: 'button',
			category: 'Flex Channel',
			style: {
				text: '`Time Adjust\\n${$(DO:flex_channel_time_adjust)["snkdsp_flex1_1"]} smp`',
				textExpression: true,
				size: '14',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'flex_time_adj',
					options: {
						operation: 'gt',
						flexchannel: 'snkdsp_flex1_1',
						time_adj: 0,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when time adjust is enabled',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'Flex Channel Time Adjust',
		},
		{
			type: 'button',
			category: 'Flex Channel',
			style: {
				text: '`Contribution\\n${$(DO:flex_channel_automix_contribution)["snkdsp_flex1_1"]}`',
				textExpression: true,
				size: '12' as CompanionTextSize,
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'flex_automix_contrib',
					options: {
						operation: 'lt',
						flexchannel: 'snkdsp_flex1_1',
						automix_contrib: 100,
					},
					style: {
						color: contrastcolor(defaultcolor_warn),
						bgcolor: defaultcolor_warn as any,
					},
					isInverted: false,
					headline: 'Change background when contribution is below the default value',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'AutoMix Contribution',
		},
		{
			type: 'button',
			category: 'Flex Channel',
			style: {
				text: '`Priority\\n${$(DO:flex_channel_automix_priority)["snkdsp_flex1_1"]}`',
				textExpression: true,
				size: '12' as CompanionTextSize,
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'flex_automix_priority',
					options: {
						operation: 'gt',
						flexchannel: 'snkdsp_flex1_1',
						automix_priority: 0,
					},
					style: {
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change background when priority is enabled',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'AutoMix Priority',
		},
		{
			type: 'button',
			category: 'Flex Channel',
			style: {
				text: '`Hush\\nWizard\\n${$(DO:automix_hush_wizard)["0"]}`',
				textExpression: true,
				size: '14',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'automix_bias',
					options: {
						operation: 'gt',
						automix: 0,
						bias: -104,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change Background when hush wizard is enabled',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'Hush Wizard',
		},
		{
			type: 'button',
			category: 'Flex Channel',
			style: {
				text: '`${$(DO:automix_label)["0"]}\\nSpeed \\n${$(DO:automix_speed)\n["0"]+1}`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [],
			steps: [
				{
					down: [
						{
							actionId: 'automix_speed',
							options: {
								automix: 0,
								speed: '%%next%%',
							},
							headline: 'Select AutoMix speed',
						},
					],
					up: [],
				},
			],
			name: 'Automix Speed',
		},
		{
			type: 'button',
			category: 'Sum Bus',
			style: {
				text: '`${$(DO:sum_bus_label)["srcdsp_sumbus1_1"]}\\nMute\\n${toFixed($(DO:sum_bus_gain)["srcdsp_sumbus1_1"],1)} dB`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'sum_bus_mute',
					options: {
						sink: 'srcdsp_sumbus1_1',
						mute_master: true,
					},
					style: {
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
						text: '`${$(DO:Sum_Bus_Label)["srcdsp_sumbus1_1"]}\\nMute\\n${toFixed($(DO:Sum_Bus_Gain)["srcdsp_sumbus1_1"],1)} dB`',
						textExpression: true,
					},
					isInverted: false,
					headline: 'Change background when Sum Bus is muted',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'sum_bus_mute',
							options: {
								sink: 'srcdsp_sumbus1_1',
								mute_master: '%%toggle%%',
							},
							headline: 'Toggel Sum Bus mute',
						},
					],
					up: [],
				},
			],
			name: 'Sum Bus Mute Label and Gain',
		},
		{
			type: 'button',
			category: 'Sum Bus',
			style: {
				text: 'Polarity',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'sum_bus_polarity',
					options: {
						sink: 'srcdsp_sumbus1_1',
						polarity: 1,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when Sum Bus polarity is reversed ',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'sum_bus_polarity',
							options: {
								sink: 'srcdsp_sumbus1_1',
								polarity: '%%toggle%%',
							},
							headline: 'Toggel Sum Bus polarity',
						},
					],
					up: [],
				},
			],
			name: 'Sum Bus Polarity',
		},
		{
			type: 'button',
			category: 'Sum Bus',
			style: {
				text: 'Sum Bus\\n Assign',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'routing_sumbus',
					options: {
						sink: 'srcdsp_sumbus1_1',
						source: 'src_madi1_1',
					},
					style: {
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change background when specific source is assigned to Sum Bus',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'routing_sumbus',
							options: {
								sink: 'srcdsp_sumbus1_1',
								source: 'src_madi1_1',
								action: '%%toggle%%',
							},
							headline: 'Toggle Sum Bus assignment for specific source',
						},
					],
					up: [],
				},
			],
			name: 'Sum Bus\\n Assign',
		},
		{
			type: 'button',
			category: 'Groups',
			style: {
				text: '`${$(DO:group_label)["grp__1"]}\\nMute\\n${toFixed($(DO:group_gain)["grp__1"],1)} dB`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'group_mute',
					options: {
						group: 'grp__1',
						mute: true,
					},
					style: {
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
						text: '`${$(DO:Group_Label)["grp__1"]}\\nMute\\n${toFixed($(DO:Group_Gain)["grp__1"],1)} dB`',
						textExpression: true,
					},
					isInverted: false,
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'group_mute',
							options: {
								group: 'grp__1',
								mute: '%%toggle%%',
							},
						},
					],
					up: [],
				},
			],
			name: 'Group Mute, Label and Gain',
		},
		{
			type: 'button',
			category: 'Groups',
			style: {
				text: 'Group Fade',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'group_fadingstate',
					options: {
						group: 'grp__1',
						fading_state: 'faded_in',
					},
					style: {
						text: 'Fade\\nOut',
						textExpression: false,
						color: contrastcolor(defaultcolor_inactive),
						bgcolor: defaultcolor_inactive as any,
					},
					isInverted: false,
					headline: 'Change background and text when faded in',
				},
				{
					feedbackId: 'group_fadingstate',
					options: {
						group: 'grp__1',
						fading_state: 'fading_in',
					},
					style: {
						text: 'Fading\\nIn',
						textExpression: false,
					},
					isInverted: false,
					headline: 'Change text while fading in',
				},
				{
					feedbackId: 'group_fadingstate',
					options: {
						group: 'grp__1',
						fading_state: 'fading_out',
					},
					style: {
						text: 'Fading\\nOut',
						textExpression: false,
					},
					isInverted: false,
					headline: 'Change text while fading out',
				},
				{
					feedbackId: 'group_fadingstate',
					options: {
						group: 'grp__1',
						fading_state: 'faded_out',
					},
					style: {
						text: 'Fade\\nIn',
						textExpression: false,
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background and text when faded out',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'group_fadeout',
							options: {
								group: 'grp__1',
								fade_out: '%%toggle%%',
							},
							headline: 'Toggle group fade',
						},
					],
					up: [],
				},
			],
			name: 'Group Fade',
		},
		{
			type: 'button',
			category: 'Groups',
			style: {
				text: 'Output\\nGroup\\nMute',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'mute_group',
					options: {
						mutegroup: 'mutegrp_madi_1',
						mute_group: 1,
					},
					style: {
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
					},
					isInverted: false,
					headline: 'Change background when output mute group is muted',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'mute_group',
							options: {
								mutegroup: 'mutegrp_madi_1',
								mute_group: '%%toggle%%',
							},
							headline: 'Toggle output group mute',
						},
					],
					up: [],
				},
			],
			name: 'Output Group Mute',
		},
		{
			type: 'button',
			category: 'DSP',
			style: {
				text: 'IIR',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'eq_iir_enable',
					options: {
						eqiir: 0,
						eq_enabled: true,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when IIR is enabled',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'eq_iir_enable',
							options: {
								eqiir: 0,
								eq_enabled: '%%toggle%%',
							},
							headline: 'Toggle IIR enable',
						},
					],
					up: [],
				},
			],
			name: 'Enable IIR',
		},
		{
			type: 'button',
			category: 'DSP',
			style: {
				text: 'FIR',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'eq_fir_enable',
					options: {
						eqfir: 0,
						eq_enabled: true,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when FIR is enabled',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'eq_fir_enable',
							options: {
								eqfir: 0,
								eq_enabled: '%%toggle%%',
							},
							headline: 'Toggle FIR enable',
						},
					],
					up: [],
				},
			],
			name: 'Enable FIR',
		},
		{
			type: 'button',
			category: 'DSP',
			style: {
				text: 'Dynamics',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'compressor_enable',
					options: {
						compressor: 0,
						compressor_enabled: true,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when dynamics is enabled',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'compressor_enable',
							options: {
								compressor: 0,
								compressor_enabled: '%%toggle%%',
							},
							headline: 'Toggle dynamics enable',
						},
					],
					up: [],
				},
			],
			name: 'Enable Dynamics',
		},
		{
			type: 'button',
			category: 'DSP',
			style: {
				text: '`Delay\\n${$(DO:delay_samples)[0]} smp\\n${toFixed((($(DO:delay_samples)[0]/$(DO:device_samplerate))*1000),1)} ms`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'delay_enable',
					options: {
						delay: 0,
						delay_enabled: true,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when delay is enabled',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'delay_enable',
							options: {
								delay: 0,
								delay_enabled: '%%toggle%%',
							},
							headline: 'Toggle delay enable',
						},
					],
					up: [],
				},
			],
			name: 'Enable Delay',
		},
		{
			type: 'button',
			category: 'Snapshots',
			style: {
				text: '`Active\\nSnapshot\\n${$(DO:last_recalled_snapshot_name)}`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'Last Recalled Snapshot',
		},
		{
			type: 'button',
			category: 'Snapshots',
			style: {
				text: '`Recall \\n${$(DO:snapshots)["0"]["name"]}`',
				textExpression: true,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'snapshot_last_id',
					options: {
						operation: 'eq',
						last_snapshot_recalled: 0,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when snapshot is loaded',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'snapshot_recall_id',
							options: {
								snapshot: 0,
							},
							headline: 'Recall snapshot by ID',
						},
					],
					up: [],
				},
			],
			name: 'Recall Snapshot by ID ',
		},
		{
			type: 'button',
			category: 'Monitoring',
			style: {
				text: '`LTC\\n${replaceAll($(DO:settings_ltc_source),"src_gen_-1","Unassigned")}`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'ltc_source',
					options: {
						ltc_source: 'src_gen_-1',
					},
					style: {
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: true,
					headline: 'Change background when LTC source is assigned ',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'LTC Source Feedback',
		},
		{
			type: 'button',
			category: 'Monitoring',
			style: {
				text: 'Set\\nLTC\\nSource',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'ltc_source',
					options: {
						ltc_source: 'src_madi1_1',
					},
					style: {
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change Background when LTC is assigned ',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'ltc_source',
							options: {
								ltc_source: 'src_madi1_1',
							},
							headline: 'Set LTC source',
						},
					],
					up: [],
				},
			],
			name: 'Set LTC Source',
		},
		{
			type: 'button',
			category: 'Monitoring',
			style: {
				text: '`${$(DO:monitoring_label)["snk_mon1_3"]}\\n${$(DO:input_label)[$(DO:settings_monitoring_source_1)["0"]]?$(DO:input_label)[$(DO:settings_monitoring_source_1)["0"]]:"Unassigned"}`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'monitoring_source1',
					options: {
						channel: 0,
						input: 'src_gen_-1',
					},
					style: {
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: true,
					headline: 'Change background when monitoring source is assigned to Monitor 1',
				},
				{
					feedbackId: 'monitoring_routing',
					options: {
						sink: 'snk_mon1_3',
						source: 'src_mon1_3',
					},
					style: {
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
					},
					isInverted: true,
					headline: 'Change background when Monitor 1 route is not Monitor 1',
				},
				{
					feedbackId: 'monitoring_routing',
					options: {
						sink: 'snk_mon1_3',
						source: 'src_mon1_1',
					},
					style: {
						text: '`${$(DO:Monitoring_Label)["snk_mon1_3"]}\\n${$(DO:Monitoring_Label)["snk_mon1_1"]}`',
						textExpression: true,
					},
					isInverted: false,
					headline: 'Change text when Monitor 1 route is Phones 1',
				},
				{
					feedbackId: 'monitoring_routing',
					options: {
						sink: 'snk_mon1_3',
						source: 'src_mon1_2',
					},
					style: {
						text: '`${$(DO:Monitoring_Label)["snk_mon1_3"]}\\n${$(DO:Monitoring_Label)["snk_mon1_2"]}`',
						textExpression: true,
					},
					isInverted: false,
					headline: 'Change text when Monitor 1 route is Phones 2',
				},
				{
					feedbackId: 'monitoring_routing',
					options: {
						sink: 'snk_mon1_3',
						source: 'src_mon1_4',
					},
					style: {
						text: '`${$(DO:Monitoring_Label)["snk_mon1_3"]}\\n${$(DO:Monitoring_Label)["snk_mon1_4"]}`',
						textExpression: true,
					},
					isInverted: false,
					headline: 'Change text when Monitor 1 route is Monitor 2',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'Monitor 1 Feedback',
		},
		{
			type: 'button',
			category: 'Monitoring',
			style: {
				text: '`Set\\n${$(DO:monitoring_label)["snk_mon1_3"]}\\nSource`',
				textExpression: true,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'monitoring_source1',
					options: {
						channel: 0,
						input: 'src_madi1_1',
					},
					style: {
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change background when Monitor 1 source is assigned',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'monitoring_source1',
							options: {
								channel: 0,
								input: 'src_madi1_1',
							},
							headline: 'Set Monitor 1 source',
						},
						{
							actionId: 'monitoring_source1',
							options: {
								channel: 1,
								input: 'src_madi1_2',
							},
							headline: 'Set Monitor 1 source',
						},
					],
					up: [],
				},
			],
			name: 'Set Monitor 1',
		},
		{
			type: 'button',
			category: 'Monitoring',
			style: {
				text: '`${$(DO:monitoring_label)["snk_mon1_4"]}\\n${$(DO:input_label)[$(DO:settings_monitoring_source_2)["0"]]?$(DO:input_label)[$(DO:settings_monitoring_source_2)["0"]]:"Unassigned"}`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'monitoring_source2',
					options: {
						channel: 0,
						input: 'src_gen_-1',
					},
					style: {
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: true,
					headline: 'Change background when source is assigned to Monitor 2',
				},
				{
					feedbackId: 'monitoring_routing',
					options: {
						sink: 'snk_mon1_4',
						source: 'src_mon1_4',
					},
					style: {
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
					},
					isInverted: true,
					headline: 'Change background when Monitor 2 route is not Monitor 1',
				},
				{
					feedbackId: 'monitoring_routing',
					options: {
						sink: 'snk_mon1_4',
						source: 'src_mon1_1',
					},
					style: {
						text: '`${$(DO:Monitoring_Label)["snk_mon1_4"]}\\n${$(DO:Monitoring_Label)["snk_mon1_1"]}`',
						textExpression: true,
					},
					isInverted: false,
					headline: 'Change text when Monitor 2 route is Phones 1',
				},
				{
					feedbackId: 'monitoring_routing',
					options: {
						sink: 'snk_mon1_4',
						source: 'src_mon1_2',
					},
					style: {
						text: '`${$(DO:Monitoring_Label)["snk_mon1_4"]}\\n${$(DO:Monitoring_Label)["snk_mon1_2"]}`',
						textExpression: true,
					},
					isInverted: false,
					headline: 'Change text when Monitor 2 route is Phones 2',
				},
				{
					feedbackId: 'monitoring_routing',
					options: {
						sink: 'snk_mon1_4',
						source: 'src_mon1_3',
					},
					style: {
						text: '`${$(DO:Monitoring_Label)["snk_mon1_4"]}\\n${$(DO:Monitoring_Label)["snk_mon1_3"]}`',
						textExpression: true,
					},
					isInverted: false,
					headline: 'Change text when Monitor 2 route is Monitor 1',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'Monitor 2 Feedback',
		},
		{
			type: 'button',
			category: 'Monitoring',
			style: {
				text: '`Set\\n${$(DO:monitoring_label)["snk_mon1_4"]}\\nSource`',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'monitoring_source2',
					options: {
						channel: 0,
						input: 'src_madi1_1',
					},
					style: {
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change background when Monitor 2 source is assigned',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'monitoring_source2',
							options: {
								channel: 0,
								input: 'src_madi1_1',
							},
							headline: 'Set Monitor 2 source',
						},
						{
							actionId: 'monitoring_source2',
							options: {
								channel: 1,
								input: 'src_madi1_2',
							},
							headline: 'Set Monitor 2 source',
						},
					],
					up: [],
				},
			],
			name: 'Set Monitor 2',
		},
		{
			type: 'button',
			category: 'Monitoring',
			style: {
				text: 'Monitoring Route',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'monitoring_routing',
					options: {
						sink: 'snk_mon1_1',
						source: 'src_mon1_1',
					},
					style: {
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change background when monitor route is assigned',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'monitoring_routing',
							options: {
								sink: 'snk_mon1_1',
								source: 'src_mon1_1',
							},
							headline: 'Set monitor route',
						},
					],
					up: [],
				},
			],
			name: 'Set Monitoring Route',
		},
		{
			type: 'button',
			category: 'Settings',
			style: {
				text: 'GP Input Status',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'status_gpi',
					options: {
						gpi: 0,
						state: true,
					},
					style: {
						color: contrastcolor(defaultcolor_ok),
						bgcolor: defaultcolor_ok as any,
					},
					isInverted: false,
					headline: 'Change background when GPI is true',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'GPI Status',
		},
		{
			type: 'button',
			category: 'Settings',
			style: {
				text: 'GP Output',
				textExpression: false,
				size: '14',
				color: contrastcolor(defaultcolor_inactive),
				bgcolor: defaultcolor_inactive as any,
			},
			feedbacks: [
				{
					feedbackId: 'gpo_set',
					options: {
						gpo: 0,
						state: true,
					},
					style: {
						color: contrastcolor(defaultcolor_active),
						bgcolor: defaultcolor_active as any,
					},
					isInverted: false,
					headline: 'Change background when GP output is on',
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'gpo_set',
							options: {
								gpo: 0,
								state: '%%toggle%%',
							},
							headline: 'Toggle GP output',
						},
					],
					up: [],
				},
			],
			name: 'GPO Status',
		},
		{
			type: 'button',
			category: 'Settings',
			style: {
				text: 'No\\nWarning',
				textExpression: false,
				size: 'auto',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [
				{
					feedbackId: 'status_warnings_active',
					options: {
						active: true,
					},
					style: {
						color: contrastcolor(defaultcolor_bad),
						bgcolor: defaultcolor_bad as any,
						text: '$(DO:warnings_message)',
						textExpression: true,
					},
					isInverted: false,
					headline: 'Change background and text when warning present',
				},
			],
			steps: [
				{
					down: [],
					up: [],
				},
			],
			name: 'Warning Feedback',
		},
		{
			type: 'button',
			category: 'Settings',
			style: {
				text: '$(DO:settings_device_name)',
				textExpression: true,
				size: 'auto',
				color: contrastcolor(defaultcolor_bg),
				bgcolor: defaultcolor_bg as any,
			},
			feedbacks: [],
			steps: [
				{
					down: [
						{
							actionId: 'flash',
							options: {},
							headline: 'Flash device leds',
						},
					],
					up: [],
				},
			],
			name: 'Device Name and Identify',
		},
	]

	return presets.reduce((last, curr) => {
		return { ...last, [curr.name]: curr }
	}, {})
}
