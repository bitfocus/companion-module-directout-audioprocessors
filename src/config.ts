import { combineRgb, Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	defaultcolor_bg: string | number
	defaultcolor_inactive: string | number
	defaultcolor_active: string | number
	defaultcolor_ok: string | number
	defaultcolor_warn: string | number
	defaultcolor_bad: string | number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Device IP',
			width: 4,
			regex: Regex.IP,
			default: '',
		},
		{
			id: 'coltext',
			type: 'static-text',
			label: 'Colors',
			value: 'The colors are used as default colors for presets, actions and feedbacks',
			width: 12,
		},
		{
			type: 'colorpicker',
			id: 'defaultcolor_bg',
			label: 'background',
			default: combineRgb(0, 0, 0),
			width: 4,
		},
		{
			type: 'colorpicker',
			id: 'defaultcolor_inactive',
			label: 'inactive',
			default: combineRgb(130, 130, 130),
			width: 4,
		},
		{
			type: 'colorpicker',
			id: 'defaultcolor_active',
			label: 'active',
			default: combineRgb(58, 0, 219),
			width: 4,
		},
		{
			type: 'colorpicker',
			id: 'defaultcolor_ok',
			label: 'ok',
			default: combineRgb(0, 234, 39),
			width: 4,
		},
		{
			type: 'colorpicker',
			id: 'defaultcolor_warn',
			label: 'warn',
			default: combineRgb(255, 128, 0),
			width: 4,
		},
		{
			type: 'colorpicker',
			id: 'defaultcolor_bad',
			label: 'bad',
			default: combineRgb(204, 0, 0),
			width: 4,
		},
	]
}
