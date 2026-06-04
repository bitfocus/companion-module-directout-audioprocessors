import { VariablesTable } from './types.js'
import type { DirectoutInstance } from './main.js'

// Use the variableId also for the key of the Map. The dynamic variables will do the same and so they don't clash.
export function getStaticVariableDefinitions(_self: DirectoutInstance): VariablesTable {
	return new Map([
		[
			'device_samplerate',
			{
				variableId: 'device_samplerate',
				name: 'Current Sample Rate of the device',
				publishers: new Set(['static']),
			},
		],
		[
			'snapshots',
			{
				variableId: 'snapshots',
				name: 'Array with snapshot metadata. Index is the Snapshot ID',
				publishers: new Set(['static']),
			},
		],
		[
			'routing_selected_source',
			{
				variableId: 'reouting_selected_source',
				name: 'The ID of the source that is currently selected for routing',
				publishers: new Set(['static']),
			},
		],
		[
			'routing_selected_destination',
			{
				variableId: 'routing_selected_destination',
				name: 'The ID of the destination that is currently selected for routing',
				publishers: new Set(['static']),
			},
		],
		[
			'routing_source_of_selected_destination',
			{
				variableId: 'routing_source_of_selected_destination',
				name: 'The ID of the source that is currently routed to the selected destination',
				publishers: new Set(['static']),
			},
		],
	])
}
