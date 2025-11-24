import {
	InstanceBase,
	runEntrypoint,
	InstanceStatus,
	SomeCompanionConfigField,
	Regex,
	TCPHelper,
	CompanionActionDefinitions,
	CompanionFeedbackDefinitions,
	CompanionPresetDefinitions,
	SomeCompanionActionInputField,
	CompanionActionEvent,
	CompanionActionContext,
	CompanionFeedbackInfo,
	SomeCompanionFeedbackInputField,
	CompanionOptionValues,
	InputValue,
	CompanionRecordedAction,
	CompanionButtonStyleProps,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { getStaticVariableDefinitions } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { returnActionDefinitions } from './actions.js'
import { returnFeedbackDefinitions } from './feedbacks.js'
import FJP from 'fast-json-patch'
import { returnStaticSubscriptions } from './subscriptions.js'
import { Option, returnParameters } from './parameters.js'
import { deviceTables, tables } from './capabilities.js'
import { isSet } from 'util/types'
import {
	clampDOvalues,
	clampStringNum,
	contrastcolor,
	enrichDropdown,
	getPathFromKey,
	insertPathOptions,
} from './utils.js'
import {
	DOstate,
	DOvalues,
	OptionsValues,
	IndexValuePair,
	DOpayload,
	Patch,
	Subscription,
	VariablesTable,
	Translations,
	DeviceType,
	RecordDescription,
} from './types.js'
import { returnPresetDefinitions } from './presets.js'

/**
 *
 * Main class of the module to interact with the device.
 *
 */
export class DirectoutInstance extends InstanceBase<ModuleConfig> {
	/** The TCP port of the device */
	static port = 5003

	config!: ModuleConfig
	/** TCP socket for device connection */
	socket: TCPHelper | undefined
	/** the id for each sent command */
	sendId = 0

	/** the state object holding a local copy of the device state */
	state: DOstate = {}
	/** translation maps for values */
	translations: Translations = {
		input: { outgoing: new Map(), incoming: new Map() },
		output: { outgoing: new Map(), incoming: new Map() },
		fadingStates: {
			incoming: new Map([
				[0, 'faded_in'],
				[1, 'faded_out'],
				[2, 'fading_in'],
				[3, 'fading_out'],
			]),
			outgoing: new Map([
				['faded_in', 0],
				['faded_out', 1],
				['fading_in', 2],
				['fading_out', 3],
			]),
		},
	}
	/** object with various Companion choices to use in actions and feedbacks */
	choices: { [key: string]: any } = {}
	/** the action definitions */
	actionDefinitions: CompanionActionDefinitions = {}
	/** the feedback definitions */
	feedbackDefinitions: CompanionFeedbackDefinitions = {}
	/** a map to generate variable definitions */
	variablesTable: VariablesTable = new Map()
	/** the preset definitions */
	presetDefinitions: CompanionPresetDefinitions = {}
	/** subscriptuion definitions */
	subscriptions: Map<string, Subscription> = new Map()
	/** the default style to use when adding a boolean feedback */
	defaultDefaultStyle: Partial<Partial<CompanionButtonStyleProps>> = {}
	/** definitions how to record incoming changes to actions */
	recorderTable: Map<string, RecordDescription> = new Map()
	/** the last incoming deliberate change (excluding automatic status updates) */
	lastChange: { path: string; value: DOvalues } = { path: '/', value: '' }
	/** the type of the connected device */
	devicetype: DeviceType = 'GENERIC'

	/** are we recording */
	isRecording: boolean = false
	/** should the change record a custom action */
	inhibitNextGenericRecord: boolean = false

	/**
	 * Class constructor
	 * most instance initialization will be done in init()
	 */
	constructor(internal: unknown) {
		super(internal)
	}

	/**
	 * Initialize the module once it is ready to start working
	 * @param config
	 */
	async init(config: ModuleConfig): Promise<void> {
		this.log('debug', 'Initializing DirectOut module')
		this.config = config

		// this.updateStatus(InstanceStatus.Connecting)
		this.initVariablesTable()
		// this.updateVariableDefinitions() // maybe not useful in that early stage, but can't harm either

		this.updateDefaultDefaultStyle()

		if (this.config.host !== '') {
			this.log('debug', `Starting connection to ${this.config.host}:${DirectoutInstance.port}`)
			void this.startConnection(this.config.host, DirectoutInstance.port)
		}

		// this.updateAllDefinitions()
		this.setPresetDefinitions(returnPresetDefinitions(this)) // currently preset definitions are not dependent on any device parameter (only config colors), so they can be set here
	}

	/**
	 * takes the returned options object from an action or feedback and transforms it in an object where the option names are interpreted
	 * @param options
	 * @returns
	 */
	getOptionsValues(options: CompanionOptionValues): OptionsValues {
		const optionsValues: OptionsValues = { options: [], parameters: [] }

		optionsValues.parameters = Object.keys(options)
			.filter((key) => key.startsWith('param'))
			.sort()
			.map((key) => {
				let translation: string | undefined = undefined
				const path = getPathFromKey(key)

				if (key.split('_')[1] === 'translation') {
					const translationTable = key.split('_')[2]
					if (typeof translationTable === 'string' && Object.keys(this.translations).includes(translationTable))
						translation = translationTable
				}

				const origvalue = options[key] as InputValue
				let value = clampDOvalues(origvalue)
				if (translation) value = this.translate('outgoing', translation, origvalue)

				return { key, value, translation, origvalue, path }
			})

		optionsValues.options = Object.keys(options)
			.filter((key) => key.startsWith('opt'))
			.sort()
			.map((key) => {
				let translation: string | undefined = undefined
				if (key.split('_')[1] === 'translation') {
					const translationTable = key.split('_')[2]
					if (typeof translationTable === 'string' && Object.keys(this.translations).includes(translationTable))
						translation = translationTable
				}
				const origvalue = options[key] as InputValue
				let value = clampDOvalues(origvalue)
				if (translation) value = this.translate('outgoing', translation, origvalue)

				return { key, value, translation, origvalue }
			})

		if (optionsValues.options.length)
			optionsValues.parameters.forEach((param) => {
				param.path = insertPathOptions(
					param.path,
					optionsValues.options.map((opt) => clampStringNum(opt.value)),
				)
			})

		return optionsValues
	}

	/**
	 * takes the array of options and inserts their values into the placeholders of a path
	 * @param options
	 * @returns
	 */
	insertOptionsValues(path: string, paramOptions: Option[], options: CompanionOptionValues): string {
		let retPath = path
		paramOptions.forEach((opt) => {
			const rawValue = options[opt.id ?? opt.label ?? `unknown_${opt.type}_option`]
			if (rawValue === undefined) return
			const value = this.translate('outgoing', opt.translation, rawValue)

			if (retPath.includes('*')) retPath = retPath.replace('*', value)
		})

		return retPath
	}

	/**
	 * Update the several choices with current data
	 */
	updateAllChoices(): void {
		this.choices.unassigned = this.getChoicesFromTable('unassigned')
		this.choices.inputChoices = this.getChoicesFromTable('sourceTable')
		this.choices.inputDspChoices = this.getChoicesFromTable('sourceDspTable')
		this.choices.generatorSources = this.getChoicesFromTable('generatorSources')
		this.choices.outputChoices = this.getChoicesFromTable('sinkTable')
		this.choices.outputFlexChoices = this.getChoicesFromTable('sinkTableFlex')
		this.choices.outputMixerChoices = this.getChoicesFromTable('sinkTableMixer')
		this.choices.outputSidechainChoices = this.getChoicesFromTable('sinkTableSidechain')
		this.choices.earsChoices = this.getChoicesFromTable('earsTable')
		this.choices.inmngChoices = this.getChoicesFromTable('inmngTable')
		this.choices.groupsChoices = this.getChoicesFromTable('groupsTable')
		this.choices.monitoringSnkChoices = this.getChoicesFromTable('monitoringSnkTable')
		this.choices.monitoringSrcChoices = this.getChoicesFromTable('monitoringSrcTable')
		this.choices.groupMuteChoices = this.getChoicesFromTable('groupMuteTable')
		this.choices.sumbusSinkChoices = this.getChoicesFromTable('sourceTableSumbus')
		this.choices.sumbusSourceChoices = (deviceTables.sumBusSources[this.devicetype] as Array<unknown>).map(
			(source: any) => {
				const id = source.chId
				const label =
					[...this.choices.inputChoices, ...this.choices.inputDspChoices, ...this.choices.generatorSources].find(
						(choice: { label: string; id: string }) => choice.id === id,
					)?.label ?? id
				return { id, label }
			},
		)
	}

	/**
	 * Use the different markup objects to generate the definitions for Companion and publishes them after
	 */
	updateAllDefinitions(): void {
		// apply static markup first
		this.subscriptions = returnStaticSubscriptions(this)
		this.actionDefinitions = returnActionDefinitions(this)
		this.feedbackDefinitions = returnFeedbackDefinitions(this)

		const parameters = returnParameters(this)
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this

		const makeActionOption = (param: Option): SomeCompanionActionInputField => {
			const option: Record<string, unknown> = {
				id: param.id ?? param.label ?? `unknown_${param.type}_option`,
				label: param.label ?? `Unknown`,
			}
			if (param.tooltip) option.tooltip = param.tooltip

			if (param.type === 'dropdown') {
				option.type = 'dropdown'
				if (Array.isArray(param.choices) && param.choices.length) {
					option.choices = param.choices
					if (param.default !== undefined) {
						option.default = param.default
					} else if ((option.choices as any[])[0].id !== undefined) {
						option.default = (option.choices as any[])[0].id
					} else {
						this.log('error', `Default value for dropdown ${option.label} can't be found or calculated.`)
						option.default = ''
					}
				} else {
					this.log('error', `Dropdown ${option.label} has no valid choices.`)
					option.choices = []
					option.default = ''
				}
			} else if (param.type === 'number' && !param.incremental) {
				option.type = 'number'
				option.min = param.min ?? 0
				option.max = param.max ?? 1024
				option.step = param.step ?? 1
				option.default = param.default ?? 0
				if (Number(option.default) < Number(option.min)) option.default = option.min
				if (Number(option.default) > Number(option.max)) option.default = option.max
				if (option.tooltip === undefined)
					option.tooltip = `Value range between ${option.min} and ${option.max}, increments ${option.step}`
			} else if (param.type === 'number' && param.incremental) {
				option.type = 'number'
				option.step = param.step ?? 1
				option.default = 1
				option.max = param.max ?? 1024
				// no min, have to allow negatives for incremental - clamped in action
				if (option.tooltip === undefined)
					option.tooltip = `Step size ${option.step}. Use negative values to decrement. Final value clamped to valid range.`
			} else if (param.type === 'boolean') {
				option.type = 'dropdown'
				option.choices = param.choices ?? [
					{ label: 'On', id: '%%true%%' },
					{ label: 'Off', id: '%%false%%' },
				] // toggle will be added by enrich function
				option.default = param.default ?? '%%true%%'
			} else if (param.type === 'string') {
				option.type = 'textinput'
				option.useVariables = { local: true }
				option.default = param.default ?? ''
				if (param.regex) option.regex = param.regex
			}

			return option as unknown as SomeCompanionActionInputField
		}

		const makeFeedbackOption = (param: Option) => {
			const option: Record<string, unknown> = {
				id: param.id ?? param.label ?? `unknown_${param.type}_option`,
				label: param.label ?? `Unknown`,
			}
			if (param.tooltip) option.tooltip = param.tooltip

			if (param.type === 'dropdown') {
				option.type = 'dropdown'
				if (Array.isArray(param.choices) && param.choices.length) {
					option.choices = param.choices
					if (param.default !== undefined) {
						option.default = param.default
					} else if ((option.choices as any[])[0].id !== undefined) {
						option.default = (option.choices as any[])[0].id
					} else {
						this.log('error', `Default value for dropdown ${option.label} can't be found or calculated.`)
						option.default = ''
					}
				} else {
					this.log('error', `Dropdown ${option.label} has no valid choices.`)
					option.choices = [
						{ label: 'On', id: '%%true%%' },
						{ label: 'Off', id: '%%false%%' },
					]
					option.default = '%%true%%'
				}
				// option.default = param.default ?? (option.choices as { label: string; id: string }[])[0].id
			} else if (param.type === 'number') {
				option.type = 'number'
				option.min = param.min ?? 0
				option.max = param.max ?? 1024
				option.step = param.step ?? 1
				option.default = param.default ?? 0
				if (Number(option.default) < Number(option.min)) option.default = option.min
				if (Number(option.default) > Number(option.max)) option.default = option.max
			} else if (param.type === 'boolean') {
				option.type = 'checkbox'
				option.default = true
			} else if (param.type === 'string') {
				option.type = 'textinput'
				option.default = param.default ?? ''
				if (param.regex) option.regex = param.regex
			}

			return option as unknown as SomeCompanionFeedbackInputField
		}

		const makeIncrementalOption = (param: Option): SomeCompanionActionInputField[] => {
			if (param.incremental) {
				const option: Record<string, unknown> = {
					id: 'incremental',
					label: 'Incremental',
					type: 'checkbox',
					default: false,
					tooltip: 'When enabled, adds value to current setting. When disabled, sets absolute value.',
				}
				return [option as unknown as SomeCompanionActionInputField]
			}
			return []
		}

		for (const parameterKey of Object.keys(parameters)) {
			const parameter = parameters[parameterKey]
			const key = parameter.id ?? parameterKey

			// skip if there is a device restriction
			if (Array.isArray(parameter.device) && !parameter.device.includes(this.devicetype)) continue

			const parameterOptions = parameter.parameters?.map((param) => ({
				...param,
				key: param.id ?? param.label ?? `unknown_${param.type}_option`,
			}))
			const parameterOption = parameterOptions?.length ? parameterOptions[0] : undefined
			const optionOptions = parameter.options?.map((param) => ({
				...param,
				key: param.id ?? param.label ?? `unknown_${param.type}_option`,
			}))

			// -----------------------------------------------------------
			// generate action
			// -----------------------------------------------------------

			if (parameter.provide.includes('action') && parameterOption) {
				const callback = async (event: CompanionActionEvent, context: CompanionActionContext): Promise<void> => {
					const options = event.options
					for (const param of parameterOptions ?? []) {
						if (!param.path?.startsWith('/')) continue
						let thisPath = param.path
						const thisKey = param.key
						if (optionOptions?.length && param.path.includes('*'))
							thisPath = this.insertOptionsValues(thisPath, optionOptions, options)

						if (param.type == 'string') {
							const value = await context.parseVariablesInString((options[thisKey] as string) ?? '')
							self.sendSetCmd(thisPath, value, param.translation)
						} else if (param.type == 'boolean') {
							let value = options[thisKey]
							if (value == '%%toggle%%') {
								const currentvalue = self.getState(thisPath)
								value = currentvalue == false ? '%%true%%' : '%%false%%'
							}
							value = value == '%%false%%' ? false : true
							self.sendSetCmd(thisPath, value)
						} else if (param.type == 'dropdown') {
							let value = options[thisKey]
							if (value == '%%toggle%%') {
								const list: any[] =
									param.choices?.filter(
										(choice: any) => choice.id !== '%%toggle%%' && choice.id !== '%%next%%' && choice.id !== '%%prev%%',
									) ?? []
								const currentvalue = self.getState(thisPath, param.translation)
								const index = list.findIndex((choice) => choice.id == currentvalue)
								if (index == 0) value = list[1].id
								else if (index == 1) value = list[0].id
								else return
							} else if (value == '%%next%%') {
								const list: any[] =
									param.choices?.filter(
										(choice: any) => choice.id !== '%%toggle%%' && choice.id !== '%%next%%' && choice.id !== '%%prev%%',
									) ?? []
								const currentvalue = self.getState(thisPath, param.translation)

								const index = list.findIndex((choice) => choice.id == currentvalue)
								if (index == -1) return
								const nextindex = (index + 1) % list.length
								value = list[nextindex].id
							} else if (value == '%%prev%%') {
								const list: any[] =
									param.choices?.filter(
										(choice: any) => choice.id !== '%%toggle%%' && choice.id !== '%%next%%' && choice.id !== '%%prev%%',
									) ?? []
								const currentvalue = self.getState(thisPath, param.translation)

								const index = list.findIndex((choice) => choice.id == currentvalue)
								if (index == -1) return
								const previndex = index == 0 ? list.length - 1 : index - 1
								value = list[previndex].id
							}

							if (value == '%%false%%') value = false
							else if (value == '%%true%%') value = true

							self.sendSetCmd(thisPath, value, param.translation)
						} else if (param.type == 'number') {
							let value = Number(options[thisKey])

							// check if user selected incremental mode
							const useIncremental = param.incremental && options['incremental'] === true

							if (!useIncremental) {
								// absolute mode: clamp to parameter range
								if (param.min && value < param.min) value = param.min
								if (param.max && value > param.max) value = param.max
							}
							if (param.step)
								value = Number(
									(Math.round((value + Number.EPSILON) / param.step) * param.step).toFixed(
										param.step.toString().includes('.') ? param.step.toString().split('.')[1].length : 0,
									),
								)

							if (useIncremental) {
								// incremental mode: add to current value and clamp result
								let newVal = Number(self.getPath(thisPath)) + value
								if (param.max && newVal > param.max) newVal = param.max
								if (param.min && newVal < param.min) newVal = param.min
								self.sendSetCmd(thisPath, newVal)
							} else {
								self.sendSetCmd(thisPath, value)
							}
						} else {
							self.sendSetCmd(thisPath, options[thisKey], param.translation)
						}
					}
				}

				const learn = (event: CompanionActionEvent, _context: CompanionActionContext) => {
					const options = event.options
					const newValues: Record<string, any> = {}
					for (const param of parameterOptions ?? []) {
						if (!param.path?.startsWith('/')) continue
						let thisPath = param.path
						if (optionOptions?.length && thisPath?.includes('*'))
							thisPath = this.insertOptionsValues(thisPath, optionOptions, options)
						let value = self.getState(thisPath, param.translation)
						if (value === true) value = '%%true%%'
						else if (value === false) value = '%%false%%'
						newValues[param.key] = value
						// self.log('debug', `learn called. value: ${value}\noptionValues: ${JSON.stringify(param, null, 2)}`)
					}
					return { ...options, ...newValues }
				}

				this.actionDefinitions[key] = {
					name: `Set ${parameter.name}`,
					options: [
						...(optionOptions ? optionOptions.map((opt) => makeActionOption(opt)) : []),
						...(parameterOptions ? parameterOptions.map((param) => enrichDropdown(makeActionOption(param))) : []),
						...(parameterOptions ? parameterOptions.flatMap((param) => makeIncrementalOption(param)) : []),
					],
					callback,
					learn,
				}

				// apply overrides
				if (typeof parameter.action === 'object')
					this.actionDefinitions[key] = { ...this.actionDefinitions[key], ...parameter.action }
			}

			// -----------------------------------------------------------
			// generate boolean feedback for each parameter of parameter
			// -----------------------------------------------------------

			if (parameter.provide.includes('feedback') && parameterOptions?.length) {
				for (const param of parameterOptions) {
					if (!param.path?.startsWith('/')) continue
					const thisKey = param.key
					const feedbackKey = parameterOptions.length > 1 ? `${key}_${thisKey}` : key

					let callback = (event: CompanionFeedbackInfo) => {
						const options = event.options
						let thisPath = param.path
						if (optionOptions?.length && param.path.includes('*'))
							thisPath = this.insertOptionsValues(thisPath, optionOptions, options)

						const optionValue = options[thisKey]
						const translatedStoredValue = self.getState(thisPath, param.translation)
						if (optionValue == translatedStoredValue) return true
						else return false
					}

					const learn = (event: CompanionFeedbackInfo) => {
						const options = event.options
						let thisPath = param.path
						if (optionOptions?.length && param.path.includes('*'))
							thisPath = this.insertOptionsValues(thisPath, optionOptions, options)

						const translatedStoredValue = self.getState(thisPath, param.translation)
						if (translatedStoredValue === undefined) return {}

						return { ...options, [thisKey]: translatedStoredValue }
					}

					const options = [
						...(optionOptions ? optionOptions.map((opt) => makeFeedbackOption(opt)) : []),
						makeFeedbackOption(param),
					]

					if (param.type === 'number') {
						const mathoption = {
							type: 'dropdown' as const,
							label: 'Operation',
							id: 'operation',
							choices: [
								{ id: 'eq', label: 'Equals' },
								{ id: 'lt', label: 'Less than' },
								{ id: 'gt', label: 'Greater than' },
							],
							default: 'eq',
						}
						options.unshift(mathoption)

						callback = (event: CompanionFeedbackInfo) => {
							const options = event.options
							let thisPath = param.path
							if (optionOptions?.length && param.path.includes('*'))
								thisPath = this.insertOptionsValues(thisPath, optionOptions, options)

							const optionValue = options[thisKey]
							if (typeof optionValue !== 'number') return false
							const storedValue = self.getState(thisPath)

							if (options['operation'] == 'lt' && storedValue < optionValue) return true
							else if (options['operation'] == 'gt' && storedValue > optionValue) return true
							else if (options['operation'] == 'eq' && storedValue == optionValue) return true
							else return false
						}
					} else if (param.type === 'string') {
						const mathoption = {
							type: 'dropdown' as const,
							label: 'Operation',
							id: 'operation',
							choices: [
								{ id: 'eq', label: 'Equals' },
								{ id: 'start', label: 'Starts with' },
								{ id: 'include', label: 'Includes' },
							],
							default: 'eq',
						}
						options.unshift(mathoption)

						callback = (event: CompanionFeedbackInfo) => {
							const options = event.options
							let thisPath = param.path
							if (optionOptions?.length && param.path.includes('*'))
								thisPath = this.insertOptionsValues(thisPath, optionOptions, options)

							const optionValue = options[thisKey]
							const storedValue = self.getState(thisPath)
							if (typeof optionValue !== 'string' || typeof storedValue !== 'string') return false

							if (options['operation'] == 'start' && storedValue.startsWith(optionValue)) return true
							else if (options['operation'] == 'include' && storedValue.includes(optionValue)) return true
							else if (options['operation'] == 'eq' && storedValue == optionValue) return true
							else return false
						}
					}

					this.feedbackDefinitions[feedbackKey] = {
						type: 'boolean',
						name: `Check ${parameter.name}`,
						options,
						callback,
						learn,
						defaultStyle: this.defaultDefaultStyle,
						subscribe: (feedback) => {
							const options = feedback.options
							let thisPath = param.path
							if (optionOptions?.length && param.path.includes('*'))
								thisPath = this.insertOptionsValues(thisPath, optionOptions, options)

							if (self.subscriptions.has(thisPath)) {
								const sub = self.subscriptions.get(thisPath) as Subscription
								if (!isSet(sub?.listeners)) sub.listeners = new Set()
								sub.listeners.add(feedback.id)
							} else {
								self.subscriptions.set(thisPath, {
									check: RegExp(thisPath + '$'),
									feedback: [feedback.feedbackId],
									listeners: new Set([feedback.id]),
								})
							}
						},
						unsubscribe: (feedback) => {
							const options = feedback.options
							let thisPath = param.path
							if (optionOptions?.length && param.path.includes('*'))
								thisPath = this.insertOptionsValues(thisPath, optionOptions, options)
							if (self.subscriptions.has(thisPath)) {
								const sub = self.subscriptions.get(thisPath) as Subscription
								if (isSet(sub?.listeners)) {
									sub.listeners.delete(feedback.id)
									if (sub.listeners.size === 0) {
										self.subscriptions.delete(thisPath)
									}
								}
							}
						},
					}

					// apply overrides
					if (typeof parameter.feedback === 'object')
						this.feedbackDefinitions[key] = { ...this.feedbackDefinitions[key], ...parameter.feedback }
				}
			}

			// -----------------------------------------------------------
			// generate variable for parameter
			// -----------------------------------------------------------

			if (parameter.provide.includes('variable') && parameterOptions?.length) {
				for (const param of parameterOptions) {
					if (!param.path?.startsWith('/')) continue

					const path = param.path
					const name = parameter.name + (parameterOptions?.length > 1 ? ` ${param.label}` : '')
					const variable = parameter.name
						.toLocaleLowerCase()
						.replaceAll(/[^a-zA-Z0-9_-]/g, '_')
						.replaceAll(/_+/g, '_')

					// add to variable definitions or add myself to publishers
					if (self.variablesTable.has(variable)) {
						const varDef = self.variablesTable.get(variable)
						varDef?.publishers.add('parameter')
					} else {
						self.variablesTable.set(variable, {
							variableId: variable,
							name,
							publishers: new Set(['parameter']),
						})
						self.updateVariableDefinitions() // needs to be done here, so variable values can be set instantly
					}

					// -----------------------------------------------------------
					// add to subscriptions so the variable can be updated. Deduplication not needed here, but use key as a unique identifier
					// -----------------------------------------------------------
					// no options present
					if (optionOptions === undefined || optionOptions?.length === 0) {
						self.subscriptions.set(`parameter_${key}`, {
							check: RegExp(`^${path}$`),
							listeners: new Set([`parameter_${key}`]),
							fun: (fpath) => {
								const value = self.getState(fpath, param.translation)
								// self.log(
								// 	'debug',
								// 	`subscription called for parameter ${key} from ${fpath} with translation ${param.translation}, value: ${value}`,
								// )
								self.setVariableValues({ [variable]: value })
							},
							init: [`${path}`],
						})
						// init variable value
						const value = self.getState(path, param.translation)

						self.setVariableValues({ [variable]: value })
					} else if (optionOptions?.length == 1) {
						// one option present
						const optionTranslations = optionOptions
							// .sort((a, b) => a.key.localeCompare(b.key))
							.map((option) => option.translation)

						let thisSubscription: Subscription = {
							check: RegExp(`^${path.replaceAll('*', '([^/])+')}$`),
							listeners: new Set([`parameter_${key}`]),
							fun: (fpath) => {
								const value = self.getState(fpath, param.translation)
								const optionIndices = path
									.substring(1)
									.split('/')
									.map((part, i) => (part === '*' ? i : null))
									.filter((e) => e !== null)
								const pathparts = fpath.substring(1).split('/')
								const currentVariableValue = self.getVariableValue(variable)
								let returnObj: any = {}
								if (typeof currentVariableValue === 'object') returnObj = { ...(currentVariableValue as any) }
								for (let level = 0; level < optionIndices.length; level++) {
									let thisKey: string | number = pathparts[optionIndices[level]]
									const keyNum = parseInt(thisKey)
									if (!isNaN(keyNum)) thisKey = keyNum
									// self.log(
									// 	'debug',
									// 	`pushing variable ${path} ${thisKey} ${JSON.stringify(optionTranslations)} value=${value} made key ${self.translate('incoming', optionTranslations[level], thisKey)}`,
									// )
									returnObj[`${self.translate('incoming', optionTranslations[level], thisKey)}`] = value
									// self.log(
									// 	'debug',
									// 	`subscription called for parameter ${key} from ${fpath} with option ${thisKey}, translation: ${optionTranslations[level]}, value: ${value}`,
									// )
								}

								self.setVariableValues({ [variable]: returnObj })
							},
						}

						// apply overrides
						if (typeof parameter.subscription === 'object')
							thisSubscription = { ...thisSubscription, ...parameter.subscription }

						self.subscriptions.set(`parameter_${key}`, thisSubscription)

						// init variable value
						const optionIndices = path
							.substring(1)
							.split('/')
							.map((part, i) => (part === '*' ? i : null))
							.filter((e) => e !== null)
						const pathparts = path.substring(1).split('/')
						const returnObj: any = {}
						for (let level = 0; level < optionIndices.length; level++) {
							const partialPath = '/' + pathparts.slice(0, optionIndices[level]).join('/')
							const valuesObject = self.getState(partialPath)
							let keys: Array<number | string> = []
							if (Array.isArray(valuesObject)) keys = Array.from({ length: valuesObject.length }, (_e, i) => i)
							else if (typeof valuesObject === 'object') keys = Object.keys(valuesObject)
							keys.forEach((key) => {
								const thisPathArr = pathparts
								thisPathArr[optionIndices[level]] = key.toString()
								const thisValue = self.getState(`/${thisPathArr.join('/')}`, param.translation)
								const prop = self.translate('incoming', optionTranslations[level], key)
								if (typeof prop === 'string' || typeof prop === 'number') returnObj[`${prop}`] = thisValue
							})

							// const thisKey = pathparts[optionIndices[level]]
							// returnObj[`${thisKey}`] = value
							self.setVariableValues({ [variable]: returnObj })
						}

						// const value = self.getState(path)
						// self.setVariableValues({ [variable]: value })
					} else if (optionOptions?.length == 2) {
						// two option present
						const optionTranslations = optionOptions
							// .sort((a, b) => a.key.localeCompare(b.key))
							.map((option) => option.translation)

						let thisSubscription: Subscription = {
							check: RegExp(`^${path.replaceAll('*', '([^/])+')}$`),
							listeners: new Set([`parameter_${key}`]),
							fun: (fpath) => {
								const value = self.getState(fpath, param.translation)
								const optionIndices = path
									.substring(1)
									.split('/')
									.map((part, i) => (part === '*' ? i : null))
									.filter((e) => e !== null)
								const pathparts = fpath.substring(1).split('/')
								const currentVariableValue = self.getVariableValue(variable)
								let returnObj: any = {}
								if (typeof currentVariableValue === 'object') returnObj = { ...(currentVariableValue as any) }
								const keys: Array<string | number> = []
								for (let level = 0; level < optionIndices.length; level++) {
									let thisKey: string | number = pathparts[optionIndices[level]]
									const keyNum = parseInt(thisKey)
									if (!isNaN(keyNum)) thisKey = keyNum
									keys[level] = self.translate('incoming', optionTranslations[level], thisKey)
								}

								// self.log(
								// 	'debug',
								// 	`pushing variable ${path} ${JSON.stringify(optionTranslations)} optionIndices=${optionIndices} value=${value}`,
								// )
								if (typeof returnObj[`${keys[0]}`] !== 'object') returnObj[`${keys[0]}`] = {}

								returnObj[`${keys[0]}`][`${keys[1]}`] = value
								// self.log(
								// 	'debug',
								// 	`subscription called for parameter ${key} from ${fpath} with options ${keys}, translations: ${optionTranslations}, value: ${value}`,
								// )

								self.setVariableValues({ [variable]: returnObj })
							},
						}

						// apply overrides
						if (typeof parameter.subscription === 'object')
							thisSubscription = { ...thisSubscription, ...parameter.subscription }

						self.subscriptions.set(`parameter_${key}`, thisSubscription)

						// init variable value
						const returnObj: any = {}

						const pathparts = path.substring(1).split('/')
						const optionIndices = pathparts.map((part, i) => (part === '*' ? i : null)).filter((e) => e !== null)
						const path1 = '/' + pathparts.slice(optionIndices[0] + 1, optionIndices[1]).join('/')
						const path2 = '/' + pathparts.slice(optionIndices[1] + 1).join('/')

						const baseObj = self.getState('/' + pathparts.slice(0, optionIndices[0]).join('/'))

						const keys = (obj: any) => {
							let keys: Array<number | string> = []
							if (Array.isArray(obj)) keys = Array.from({ length: obj.length }, (_e, i) => i)
							else if (typeof obj === 'object' && obj !== null) keys = Object.keys(obj)
							return keys
						}

						keys(baseObj).forEach((key1) => {
							const translatedKey1 = self.translate('incoming', optionOptions[0].translation, key1)
							const secondObj: any = this.getPath(path1, baseObj[key1])
							returnObj[translatedKey1] = {}
							keys(secondObj).forEach((key2) => {
								const translatedKey2 = self.translate('incoming', optionOptions[1].translation, key2)
								const value = this.getPath(`/${key2}${path2}`, secondObj, parameterOptions[0].translation)
								returnObj[translatedKey1.toString()][translatedKey2.toString()] = value
							})
						})
						self.setVariableValues({ [variable]: returnObj })
					} else {
						self.setVariableValues({ [variable]: 'Not implemented yet (recursion)' })
					}

					// -----------------------------------------------------------
					// add to recorder dictionary
					// -----------------------------------------------------------
					if (parameter.provide.includes('action')) {
						// no options present
						if (optionOptions?.length === 0) {
							this.recorderTable.set(path, {
								actionId: key,
								parameters: [{ name: param.key, translation: param.translation }],
								options: [],
							})
						} else if (optionOptions && optionOptions.length >= 1) {
							// options present
							const optionIndices = path
								.substring(1)
								.split('/')
								.map((part, i) => (part === '*' ? i : null))
								.filter((e) => e !== null)
							this.recorderTable.set(path.replaceAll('*', '([^/])+'), {
								actionId: key,
								parameters: [{ name: param.key, translation: param.translation }],
								options: optionOptions
									//.sort((a, b) => a.id.localeCompare(b.id))
									.map((opt, i) => ({
										name: opt.key,
										index: optionIndices[i],
										translation: opt.translation,
									})),
							})
						}
					}
				}
			}
		}

		//self.updateVariableDefinitions()
		this.setActionDefinitions(this.actionDefinitions)
		this.setFeedbackDefinitions(this.feedbackDefinitions)
		this.subscribeFeedbacks() // run subscribe on feedbacks to make them add their subscriptions
	}

	/**
	 * Establish connection to a DirectOut device
	 * @param host
	 * @param port
	 * @returns
	 */
	async startConnection(host: string, port: number): Promise<void> {
		this.updateStatus(InstanceStatus.Connecting)
		if (!host.match(new RegExp(Regex.IP.split('/')[1]))) {
			this.log('error', 'Invalid host address')
			this.updateStatus(InstanceStatus.BadConfig)
			return
		}
		if (this.socket !== undefined) {
			try {
				this.socket.destroy()
			} catch (_error) {
				this.log('error', 'Failed to close socket')
				this.updateStatus(InstanceStatus.UnknownError)
				return
			}
			delete this.socket
		}

		let receivebuffer = ''
		this.sendId = 0
		this.socket = new TCPHelper(host, port)

		this.socket.on('status_change', (status, message) => {
			this.updateStatus(status, message)
		})

		this.socket.on('connect', () => {
			this.log('info', 'Connected')
			//this.initDevice()
			this.sendCmd({ type: 'get' })
			this.sendCmd({ type: 'cmd', payload: 'enable_auto_update' })
		})

		this.socket.on('error', (err) => {
			this.log('error', 'Network error: ' + err.message)
		})

		this.socket.on('data', (chunk) => {
			let i = 0,
				line = '',
				offset = 0
			receivebuffer += chunk

			while ((i = receivebuffer.indexOf('\n', offset)) !== -1) {
				line = receivebuffer.substring(offset, i)
				offset = i + 1
				void this.parseResponse(line.toString())
			}
			receivebuffer = receivebuffer.slice(offset)
		})
	}

	/**
	 * Parse received response data
	 * @param data
	 * @returns
	 */
	async parseResponse(data: string): Promise<void> {
		if (data.length === 0) return
		if (!data.startsWith('{')) {
			this.log('error', 'Invalid response format')
			return
		}
		let response: any
		try {
			response = JSON.parse(data)
		} catch (_error) {
			this.log('error', 'Failed to parse response JSON')
			return
		}
		if (typeof response.type !== 'string') {
			this.log('error', 'Response object missing type')
			return
		}

		/*
		 * UPDATE
		 */
		if (response.type === 'update') {
			// if (!data.match(/"payload":\{"fan":\{/)) this.log('debug', 'Received update: ' + data)
			const patches = this.payloadToPatches(response.payload)
			// this.log('debug', 'Patches generated:' + JSON.stringify(patches, null, 2))
			FJP.applyPatch(this.state, patches)
			patches.forEach((patch) => {
				// if (!patch.path.match(/\/fan\//)) this.log('debug', 'Patch generated:' + JSON.stringify(patch, null, 2))
				this.checkSub(patch.path)
				if (patch.op === 'replace' || patch.op === 'add') {
					if (
						(deviceTables.noRecordPaths[this.devicetype] as RegExp[]).findIndex((pathReg) => {
							return patch.path.match(pathReg) !== null
						}) == -1
					) {
						this.lastChange = { path: patch.path, value: patch.value }
						if (this.isRecording) this.recordPatch(patch)
					}
				}
			})
			// this.log('debug', 'Update, New state: ' + JSON.stringify(this.state, null, 2))

			/*
			 * ACK
			 */
		} else if (response.type === 'ack') {
			// this.log('debug', 'Received response: ' + data)
			/*
			 * GET RESPONSE
			 */
		} else if (response.type === 'get_resp') {
			if (typeof response.payload === 'object' && response.payload !== null) {
				if (typeof response.obj === 'string' || Array.isArray(response.obj)) {
					// deep object
					// this.log('debug', 'Received get_resp response: ' + data)
				} else {
					// root
					this.updateState(response.payload)
					// ' + JSON.stringify(this.state, null, 2).substring(0, 1500))
					this.devicetype = this.getState('/device_info/model')
					if (this.devicetype === undefined) {
						this.log('error', `Can't read device type, connection failed.`)
						return
					}
					let fpga_version = ''
					if (this.devicetype.startsWith('MAVEN')) {
						fpga_version = this.getState('/device_info/version_fpga')
					} else {
						fpga_version = `v${this.getState('/device_info/FPGA_FW_rev/0')}.${this.getState('/device_info/FPGA_FW_rev/1')} b${this.getState('/device_info/FPGA_FW_build/0')}${this.getState('/device_info/FPGA_FW_build/1')}`
					}
					this.log(
						'info',
						`Root GET, New state received
	Model Type: ${this.devicetype}
	System Build: ${this.getState('/device_info/image_build/0')} (${this.getState('/device_info/image_build/1')})
	FPGA Version: ${fpga_version}
	CORED Version: ${this.getState('/device_info/cored_tag')}
	Serial Number: ${this.getState('/device_info/serial_number')}`,
					)
					this.updateAllTranslations()
					this.updateAllChoices()
					this.updateAllDefinitions()
					this.initSubscriptions()
					this.checkFeedbacks()
				}
			}

			/*
			 * ERROR
			 */
		} else if (response.type === 'error') {
			this.log('error', 'Received error from device: ' + JSON.stringify(response, null, 2))
			return
		} else {
			this.log('error', 'Received response with unexpected type: ' + response.type)
			return
		}
	}

	/**
	 * Use a payload object received with update response to update the state
	 * @param payload
	 * @param [state=this.state] - the base object where the payload will be merged
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	updateState(payload: any, state: any = this.state): void {
		for (const key in payload) {
			const updateValue = payload[key]

			// If nested object (not array), recurse
			if (typeof updateValue === 'object' && updateValue !== null && !Array.isArray(updateValue)) {
				if (typeof state[key] !== 'object' || state[key] === null || Array.isArray(state[key])) {
					state[key] = {}
				}
				this.updateState(updateValue, state[key])
			}
			// If array of [index, value] and target is expected to be an array
			else if (
				Array.isArray(updateValue) &&
				updateValue.every((el: any) => Array.isArray(el) && el.length === 2 && typeof el[0] === 'number')
			) {
				if (!Array.isArray(state[key])) {
					state[key] = []
				}
				for (const [index, value] of updateValue as IndexValuePair[]) {
					// Create holes as needed in case index is greater than length
					if (index >= state[key].length) {
						state[key].length = index + 1
					}

					// update object in array
					if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
						// create object if not existing or other type
						if (typeof state[key][index] !== 'object' || state[key][index] == null || Array.isArray(state[key][index]))
							state[key][index] = {}
						this.updateState(value, state[key][index])

						// update array in array
					} else if (typeof value === 'object' && value !== null && Array.isArray(value)) {
						// create array if not existing or other type
						if (!Array.isArray(state[key][index])) state[key][index] = []
						this.updateState(value, state[key][index])

						// update value in array
					} else {
						state[key][index] = value
					}
				}
			}
			// Else, direct value
			else {
				state[key] = updateValue
			}
		}
	}

	/**
	 * Use a payload object received with update response to generate patches
	 * @param payload
	 * @param [path=''] - the base path to use, starts at / (root) when omitted
	 * @returns - array with one or more patch objects according to json patch notation
	 */
	payloadToPatches(payload: DOpayload, path: string = ''): Array<Patch> {
		const patches: Array<Patch> = []

		const p2p = (payload: any, parentPath = '') => {
			for (const key in payload) {
				const updateValue = payload[key]

				// If nested object (not array), recurse
				if (typeof updateValue === 'object' && updateValue !== null && !Array.isArray(updateValue)) {
					p2p(updateValue, `${parentPath}/${key}`)
				}
				// If array of [index, value] and target is expected to be an array
				else if (
					Array.isArray(updateValue) &&
					updateValue.every((el: any) => Array.isArray(el) && el.length === 2 && typeof el[0] === 'number')
				) {
					for (const [index, value] of updateValue as IndexValuePair[]) {
						// update object in array
						if (typeof value === 'object' && value !== null) {
							p2p(value, `${parentPath}/${key}/${index}`)

							// update value in array
						} else {
							patches.push({ op: 'replace', path: `${parentPath}/${key}/${index}`, value: value })
						}
					}
				}
				// Else, direct value
				else {
					patches.push({ op: 'replace', path: `${parentPath}/${key}`, value: updateValue })
				}
			}
		}

		p2p(payload, path)

		return patches
	}

	/**
	 * Check if a subscription exists for path and run feedbacks or the fun function
	 * @param path
	 */
	checkSub(path: string): void {
		// console.log('looking for subscription for ' + path)
		let doUpdate = false
		Array.from(this.subscriptions.values())
			.filter((sub) => path.match(sub.check))
			.forEach((sub) => {
				// console.log('found subscription', sub.check)
				if (sub.fun && typeof sub.fun === 'function') {
					const update = sub.fun(path)
					if (update) doUpdate = true
				}
				if (sub.feedback) this.checkFeedbacks(...sub.feedback)
			})
		if (doUpdate) {
			this.updateAllChoices()
			this.updateAllDefinitions()
		}
	}

	/**
	 * Run all subscriptions with the initial path
	 */
	initSubscriptions(): void {
		// console.log('looking for subscription for ' + path)
		let doUpdate = false
		Array.from(this.subscriptions.values())
			.filter((sub) => Array.isArray(sub.init) && sub.init.length > 0)
			.forEach((sub) => {
				// console.log('found subscription', sub.check)
				if (sub.init == undefined) return
				for (const path of sub.init) {
					if (sub.fun && typeof sub.fun === 'function') {
						const update = sub.fun(path)
						if (update) doUpdate = true
					}
					if (sub.feedback) this.checkFeedbacks(...sub.feedback)
				}
			})
		if (doUpdate) this.updateAllDefinitions()
	}

	/**
	 * Record a patch with the action recorder
	 * @param patch
	 */
	recordPatch(patch: Patch): void {
		if (patch.op !== 'replace') return

		// this.log('debug', `recording ${patch.path}`)
		const key = Array.from(this.recorderTable.keys()).find((key) => {
			const regex = new RegExp(`^${key}$`)
			return regex.test(patch.path)
		})

		// if a parameter action is found, record it
		if (key !== undefined) {
			const actionDesc: RecordDescription = this.recorderTable.get(key) as RecordDescription
			// this.log('debug', `desc = ${JSON.stringify(actionDesc, null, 2)}}`)
			let value = this.translate('incoming', actionDesc.parameters[0].translation, patch.value)
			if (value === true) value = '%%true%%'
			else if (value === false) value = '%%false%%'
			const param: Record<string, DOvalues> = {
				[actionDesc.parameters[0].name]: value,
			}
			const pathparts = patch.path.substring(1).split('/')
			const options: Record<string, DOvalues> = {}
			actionDesc.options.forEach((option) => {
				let value: number | string = pathparts[option.index]
				if (!isNaN(parseInt(value))) value = parseInt(value)
				options[option.name] = this.translate('incoming', option.translation, value)
			})

			const action: CompanionRecordedAction = {
				actionId: actionDesc.actionId,
				options: {
					...options,
					...param,
				},
			}
			this.recordAction(action)

			// else record custom action
		} else {
			if (!this.inhibitNextGenericRecord) {
				const action: CompanionRecordedAction = {
					actionId: 'set_custom_value',
					options: {
						path: patch.path,
						value: JSON.stringify(patch.value),
					},
				}
				this.recordAction(action)
			}
		}
		this.inhibitNextGenericRecord = false
	}

	/**
	 * Get some value from the state
	 * @param path - path to get like `/settings/some_setting`
	 * @param translation - optional, name of translation map for the value
	 * @returns the value
	 */
	getState(path: string, translation?: string): any {
		return this.getPath(path, this.state, translation)
	}

	/**
	 * Get some value from an object by path
	 * @param path - path to get like `/settings/some_setting`
	 * @param translation - optional, name of translation map for the value
	 * @returns the value
	 */
	getPath(path: string, obj: any = this.state, translation?: string): any {
		try {
			let value = FJP.getValueByPointer(obj, path)
			if (typeof translation == 'string' && Object.keys(this.translations).includes(translation)) {
				value = this.translations[translation as keyof typeof this.translations].incoming.get(value)
			}
			return value
		} catch (error) {
			this.log(
				'error',
				`Failed to read value at path ${path}${translation ? ' with translation' + translation : ''} from ${obj == this.state ? 'state' : 'object'}. ${error}`,
			)
			return undefined
		}
	}

	/**
	 * Send a SET command to the device
	 * @param path either an array of path parts or a slash delimited string
	 * @param value the value to set
	 * @param translation optional name of a translation dictionary to use for the value
	 */
	sendSetCmd(path: string | Array<string | number>, value: unknown, translation?: string): void {
		if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
			this.log('error', 'Invalid value type for set command')
			return
		}
		const patharr: Array<string | number> = Array.isArray(path) ? path : this.pathToArray(path)
		let val = value
		if (typeof translation == 'string' && Object.keys(this.translations).includes(translation)) {
			val = this.translations[translation as keyof typeof this.translations].outgoing.get(value)
			if (typeof val !== 'string' && typeof val !== 'number' && typeof val !== 'boolean') {
				this.log(
					'error',
					`Invalid value type for set command after translation ${translation} of value ${value}: ${typeof val}`,
				)
				return
			}
		}

		this.sendCmd({
			type: 'set',
			obj: patharr,
			payload: val,
		})
	}

	/**
	 * @typedef {object} DOcommand
	 * @property {string} type the type of the command, e.g. 'set'
	 * @property {string[]} obj the path to the object to manipulate, e.g. ['settings', 'ltc_source']
	 * @property {DOvalues} payload the value to set
	 */

	/**
	 * Send an object as a command to the device, adds a command-ID
	 * @param {DOcommand} object Command object
	 */
	sendCmd(object: Record<string, unknown>): void {
		if (this.socket === undefined) {
			this.log('error', 'Socket is not connected')
			return
		}
		if (this.sendId > 64353) this.sendId = 0
		object.seq = this.sendId
		const cmdString = `${JSON.stringify(object)}\n`
		// this.log('debug', `Sending command: ${JSON.stringify(object, null, 2)}`)

		void this.socket.send(cmdString)
		this.sendId++
	}

	/**
	 * Called when module gets deleted
	 */
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
	}

	/**
	 * Called when user saves a new configuration for a connection
	 * @param config the new configuration data
	 */
	async configUpdated(config: ModuleConfig): Promise<void> {
		const oldconf = { ...this.config }
		this.config = config
		if (this.config.host !== oldconf.host) {
			void this.startConnection(this.config.host, DirectoutInstance.port)
		}
		if (this.config.defaultcolor_active !== oldconf.defaultcolor_active) {
			this.updateDefaultDefaultStyle()
			this.updateAllDefinitions()
		}
		this.setPresetDefinitions(returnPresetDefinitions(this))
	}

	/**
	 * returns the validity and accessibility of a path in the current state
	 * @param path
	 * @returns true or false
	 */
	validPath(path: unknown): boolean {
		const pathstr = `${path}`
		if (!pathstr.match(/^(\/[a-zA-Z0-9_-]+)+$/)) {
			this.log('error', `Path: ${pathstr} is not a valid path format.`)
			return false
		}
		const currentValue = this.getState(pathstr)
		if (currentValue === undefined) {
			this.log('error', `Path ${pathstr} can't be found on the device.`)
			return false
		}
		return true
	}

	/**
	 * Returns an array from a path. Parts, that are numbers will be interpreted as array index.
	 * @param path
	 * @returns
	 */
	pathToArray(path: string): Array<string | number> {
		while (path.startsWith('/')) path = path.substring(1)
		return path.split('/').map((part) => (part.match(/^\d+$/) ? parseInt(part) : part))
	}

	/**
	 * Return config fields for web config
	 */
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	/**
	 * returns a Companion choices array with the choices for all external inputs (without DSP inputs) of the device.
	 * The labels are made of slotname, input name and default slotname, default inputname.
	 * The ids are made of a unique id like `in_net2_42`
	 */
	getInputChoices(): { label: string; id: string | number | boolean }[] {
		if (typeof this.devicetype !== 'string') return []
		if (!Object.keys(tables.sourceTable).includes(this.devicetype)) return []

		const devInTable: any = tables.sourceTable[this.devicetype]
		//this.log('debug', 'devintable\n' + JSON.stringify(devInTable, null, 2))
		return devInTable.map((input: any) => {
			const slotlabel = input['slotlabelpath'] ? this.getState(input.slotlabelpath) : undefined
			const chlabel = input['chlabelpath'] ? this.getState(input.chlabelpath) : undefined
			const defaultlabel = `${input.slotlabel} ${input.chlabel}`
			let label: string

			if (slotlabel && chlabel) label = `${slotlabel} ${chlabel} (${defaultlabel})`
			else if (chlabel) label = `${input.slotlabel} ${chlabel} (${defaultlabel})`
			else if (slotlabel) label = `${slotlabel} (${defaultlabel})`
			else label = defaultlabel

			const id = `${input.type}_${input.slotid}_${input.chid}`
			return { label, id }
		})
	}

	/**
	 * returns a Companion choices array with the choices for the named table of the connected device.
	 * The labels are made of slotname, input name and default slotname, default inputname.
	 * The ids are made of a unique id like `in_net2_42`
	 */
	getChoicesFromTable(table: string): { label: string; id: string | number | boolean }[] {
		if (typeof this.devicetype !== 'string') return []
		if (!Object.keys(tables).includes(table)) return []

		let devicetouse: string | undefined
		if (Object.keys((tables as any)[table]).includes(this.devicetype)) devicetouse = this.devicetype
		else if (Object.keys((tables as any)[table]).includes('GENERIC')) devicetouse = 'GENERIC'
		else return []

		const devTable: any = (tables as any)[table][devicetouse]
		// this.log('debug', 'devintable\n' + JSON.stringify(devInTable, null, 2))
		return devTable.map((tableItem: any) => {
			const slotlabel = tableItem['slotlabelpath'] ? this.getState(tableItem.slotlabelpath) : undefined
			const chlabel = tableItem['chlabelpath'] ? this.getState(tableItem.chlabelpath) : undefined
			const defaultlabel = `${tableItem.slotlabel} ${tableItem.chlabel}`
			let label: string

			if (slotlabel && chlabel) label = `${slotlabel} ${chlabel} (${defaultlabel})`
			else if (chlabel) label = `${tableItem.slotlabel} ${chlabel} (${defaultlabel})`
			else label = defaultlabel

			const id = `${tableItem.type}_${tableItem.slotid}_${tableItem.chid}`
			return { label, id }
		})
	}

	translate(direction: 'incoming' | 'outgoing', table: string | undefined, value: unknown): any {
		if (table === undefined || (direction !== 'incoming' && direction !== 'outgoing')) return value
		if (!Object.keys(this.translations).includes(table)) return value
		return this.translations[table as keyof typeof this.translations][direction].get(value)
	}

	/**
	 * update the maps in the translations object with the values for the current device
	 * @returns
	 */
	updateAllTranslations(): void {
		this.makeTranslation('input', 'unassigned', 'sourceTable', 'sourceDspTable', 'generatorSources')
		this.makeTranslation('output', 'sinkTable')
		this.makeTranslation('sinkFlex', 'sinkTableFlex')
		this.makeTranslation('sinkMixer', 'sinkTableMixer')
		this.makeTranslation('sinkSidechain', 'sinkTableSidechain')
		this.makeTranslation('sinkSumbus', 'sourceTableSumbus')
		this.makeTranslation('ears', 'earsTable')
		this.makeTranslation('inmng', 'inmngTable')
		this.makeTranslation('groups', 'groupsTable')
		this.makeTranslation('monitoringSnk', 'monitoringSnkTable')
		this.makeTranslation('monitoringSrc', 'monitoringSrcTable')
		this.makeTranslation('groupMute', 'groupMuteTable')
		this.translations.mtxNum = { incoming: new Map(), outgoing: new Map() }
		const a = deviceTables.matMixer[this.devicetype] as { id: string; label: string; devId: number; path: string }[]
		a.forEach((mtx) => {
			this.translations.mtxNum.incoming.set(mtx.devId, mtx.id)
			this.translations.mtxNum.outgoing.set(mtx.id, mtx.devId)
		})
		this.translations.genericIn = { incoming: new Map(), outgoing: new Map() }
		const ins = Array.from({ length: 8192 }, (_, i) => i)
		ins.forEach((i) => {
			this.translations.genericIn.incoming.set(i, `in${i + 1}`)
			this.translations.genericIn.outgoing.set(`in${i + 1}`, i)
		})
		this.translations.genericIn.incoming.set(-1, `none`)
		this.translations.genericIn.outgoing.set(`none`, -1)
	}

	/**
	 * creates a translation dictionary for the current device
	 * @param translationName - name of the translation dictionary
	 * @param tableNames - list of table names to include in the translation dictionary, the IDs need to be unique across all included tables
	 */
	makeTranslation(translationName: string, ...tableNames: string[]): void {
		if (typeof this.devicetype !== 'string') return
		if (tableNames.length === 0) return

		tableNames.forEach((tableName, i) => {
			if (!Object.keys(tables).includes(tableName)) return

			let devTable: any = []
			if (Object.keys(tables[tableName as keyof typeof tables]).includes(this.devicetype)) {
				devTable = tables[tableName as keyof typeof tables][this.devicetype]
			} else if (Object.keys(tables[tableName as keyof typeof tables]).includes('GENERIC')) {
				devTable = tables[tableName as keyof typeof tables]['GENERIC']
			} else return

			if (this.translations[translationName] === undefined) {
				this.translations[translationName] = { incoming: new Map(), outgoing: new Map() }
			}

			const dict = this.translations[translationName]

			if (i === 0) {
				dict.incoming.clear()
				dict.outgoing.clear()
			}

			devTable.forEach((item: any) => {
				if (
					item.type !== undefined &&
					item.slotid !== undefined &&
					item.chid !== undefined &&
					item.index !== undefined
				) {
					const id = `${item.type}_${item.slotid}_${item.chid}`
					const index = item.index
					dict.outgoing.set(id, index)
					dict.incoming.set(index, id)
				} else if (item.type !== undefined && item.chid !== undefined && item.index !== undefined) {
					const id = `${item.type}_${item.chid}`
					const index = item.index
					dict.outgoing.set(id, index)
					dict.incoming.set(index, id)
				}
			})
		})
	}

	updateActions(): void {
		returnActionDefinitions(this)
	}

	updateFeedbacks(): void {
		returnFeedbackDefinitions(this)
	}

	initVariablesTable(): void {
		this.variablesTable = getStaticVariableDefinitions(this)
	}

	updateVariableDefinitions(): void {
		const variableDefinitions = Array.from(this.variablesTable).map(([key, val]) => ({
			variableId: key,
			name: val.name,
		}))
		this.setVariableDefinitions(variableDefinitions)
	}

	updateDefaultDefaultStyle(): void {
		this.defaultDefaultStyle = {
			bgcolor: this.config.defaultcolor_active as unknown as number, // FIXME: remove type conversion when Companion typsystem recognises color strings
			color: contrastcolor(this.config.defaultcolor_active),
		}
	}

	handleStartStopRecordActions(isRecording: boolean): void {
		this.inhibitNextGenericRecord = false
		this.isRecording = isRecording
	}
}

runEntrypoint(DirectoutInstance, UpgradeScripts)
