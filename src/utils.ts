import {
	CompanionInputFieldDropdown,
	SomeCompanionActionInputField,
	SomeCompanionFeedbackInputField,
	splitRgb,
} from '@companion-module/base'
import { DOvalues } from './types.js'

export const clampDOvalues = (value: unknown): DOvalues => {
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
	return `${value}`
}

export const clampStringNum = (value: unknown): string | number => {
	if (typeof value === 'string' || typeof value === 'number') return value
	return `${value}`
}

export const stringToNum = (input: string | number): number | string => {
	if (typeof input === 'number') return input
	if (!isNaN(parseInt(input))) return parseInt(input)
	return input
}

/**
 * Matches every device path that holds the routed source of a destination.
 * Capture groups: output, flex channel, MP mixer (`<mixer>/source_routing/<input>`), 64x64 mixer, sidechain
 */
export const ROUTING_PATH =
	/^\/settings\/(?:(?:easy_)?routing\/(\d+)|flex_channel\/(\d+)\/source_routing|mixer\/(\d+\/source_routing\/\d+)|mixer64x64\/source_routing\/(\d+)|compressor\/(\d+)\/side_chain_key)$/

export const routingVariableId = (destination: string): string => `dest_${destination}_active_source`

export const getPathFromKey = (key: string): string => {
	return key.indexOf('/') > -1 ? key.substring(key.indexOf('/')) : ''
}

export const getTranslationFromKey = (key: string): string | undefined => {
	let translationTable: string | undefined = undefined
	if (key.split('_')[1] === 'translation') {
		translationTable = key.split('_')[2]
		if (typeof translationTable !== 'string') return undefined
	}
	return translationTable
}

/**
 * Inserts the values of an array into a string where * is used as a placeholder.
 */
export const insertPathOptions = (path: string, values?: Array<string | number>): string => {
	if (!Array.isArray(values)) return path
	if (path.split('').filter((char) => char === '*').length > values.length) return path
	const pathParts = path.split('*')
	if (pathParts.length <= 1) return path
	const resultarr: string[] = []
	for (let i = 0; i < pathParts.length - 1; i++) {
		resultarr.push(pathParts[i])
		resultarr.push(`${values[i]}`)
	}
	resultarr.push(pathParts[pathParts.length - 1])

	return resultarr.join('')
}

export const PrevNextChoices = [
	{ label: 'Select Previous item', id: '%%prev%%' },
	{ label: 'Select Next item', id: '%%next%%' },
]

/**
 * This function optimizes dropdown options.
 * If there are two options, it adds a toggle option,
 * if there is only one option, it hides the dropdown,
 * if there are more than two options, it adds "previous" and "next" options.
 * @param option
 * @returns
 */
export const enrichDropdown = <T extends SomeCompanionActionInputField | SomeCompanionFeedbackInputField>(
	option: T,
): T | CompanionInputFieldDropdown => {
	if (option.type === 'dropdown' && Array.isArray(option.choices)) {
		const newchoices = [...option.choices]
		if (newchoices.length == 2) {
			newchoices.unshift({ label: 'Toggle', id: '%%toggle%%' })
			option.default = '%%toggle%%'
		} else if (newchoices.length == 1) {
			option.default = newchoices[0].id
			option.isVisible = () => {
				return false
			}
		} else if (newchoices.length > 2) {
			newchoices.unshift(...PrevNextChoices)
			option.default = option.choices[2].id
		}
		const newoption = { ...option, choices: newchoices }
		return newoption as unknown as T
	}
	return option
}

export function getLuminance(r: number, g: number, b: number): number {
	;[r, g, b] = [r, g, b].map(function (v) {
		v /= 255
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
	})
	return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastcolor(color: string | number): number {
	const rgb = splitRgb(color)
	const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
	// Contrast ratio with white vs black
	const white = 1.05 / (luminance + 0.05)
	const black = (luminance + 0.05) / 0.05
	return white > black ? 0xffffff : 0
}

// const optionsToPath = (path: string, options: CompanionOptionValues): string => {
// 	const optionValues = Object.keys(options)
// 		.filter((key) => key.startsWith('opt'))
// 		.sort()
// 		.map((key) => {
// 			let value = options[key]
// 			if (typeof value !== 'string' && typeof value !== 'number') value = `${value}`
// 			if (key.includes('_translate_')) {
// 				// TODO
// 			}
// 			return value
// 		})

// 	if (optionValues.length === 0) return path
// 	return insertPathOptions(path, optionValues)
// }

/**
 * Takes OptionsValues and applies them to the path where * is used as a placeholder. Also applies translations if needed
 * @param path
 * @param optionsValues
 * @returns
 */
// const optionsValuesToPath = (path: string, optionsValues: OptionsValues): string => {
// 	const optionValues = optionsValues.options.map((opt) => {
// 		let value = clampDOvalues(opt.value)
// 		if (opt.translation) {
// 			value = self.translate('outgoing', opt.translation, value)
// 		}
// 		if (typeof value !== 'string' && typeof value !== 'number') value = `${value}`
// 		return value
// 	})

// 	if (optionValues.length === 0) return path
// 	return insertPathOptions(path, optionValues)
// }

// const optionsToParameterValue = (
// 	options: CompanionOptionValues,
// ): { value: DOvalues; translation: string | undefined } | null => {
// 	if (options === undefined) return null
// 	const parameterKey = Object.keys(options)
// 		.filter((key) => key.startsWith('parameter'))
// 		.sort()[0]
// 	if (parameterKey === undefined) return null
// 	const parameterValue = options[parameterKey]
// 	if (
// 		typeof parameterValue !== 'string' &&
// 		typeof parameterValue !== 'number' &&
// 		typeof parameterValue !== 'boolean'
// 	)
// 		return null

// 	let translationTable: string | undefined = undefined
// 	if (parameterKey.split('_')[1] === 'translation') {
// 		translationTable = parameterKey.split('_')[2]
// 		if (typeof translationTable !== 'string' || !Object.keys(self.translations).includes(translationTable))
// 			return null
// 	}

// 	return { value: parameterValue, translation: translationTable }
// }
