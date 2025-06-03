import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	NodeConnectionType,
	NodeExecutionWithMetadata,
} from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';

export class Ragic implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
		displayName: 'Ragic',
		name: 'ragic',
		icon: 'file:Ragic.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["action"]}}',
		description: 'Ragic: #1 No Code database builder',
		defaults: {
			name: 'Ragic',
		},
		inputs: ['main'] as NodeConnectionType[],
		outputs: ['main'] as NodeConnectionType[],
		credentials: [
			{
				name: 'ragicApi',
				required: true,
			},
		],
		properties: [
			// Resources and operations will go here
			{		// action
				displayName: 'Action',
				name: 'action',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Read Data',
						value: 'readData'
					},
					{
						name: 'Read Single Data',
						value: 'readSingleData'
					},
					{
						name: 'Create New Data',
						value: 'createNewData',
					},
					{
						name: 'Update Existed Data',
						value: 'updateExistedData',
					},
				],
				default: 'readData',
			},
			{		// method
				displayName: 'Method',
				name: 'method',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						action: [
							'createNewData',
							'updateExistedData'
						],
					},
				},
				options: [
					{
						name: 'JSON',
						value: 'jsonMode'
					},
					{
						name: 'Field',
						value: 'fieldMode'
					}
				],
				default: 'jsonMode'
			},
			{		// form
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
				displayName: 'Form',
				name: 'form',
				type: 'options',
				required: true,
				typeOptions: {
					loadOptionsMethod: 'getFormOptions',
					loadOptionsDependsOn: ['credentials'],
				},
				default: '',
				description:
					'Only the forms that you are the admin user would show in this list. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{		// record index
				displayName: 'Record Index',
				name: 'recordIndex',
				type: 'number',
				required: true,
				typeOptions: {
					numberPrecision: 0,
				},
				displayOptions: {
					show: {
						action: [
							'updateExistedData', 
							'readSingleData'
						],
					},
				},
				default: '',
				description:
					'You can find the Record Index from the URL. Record URL structure: http://{domain}/{database}/{path}/{form}/{record index}?.',
			},
			{		// json body
				displayName: 'JSON Body',
				name: 'jsonBody',
				type: 'json',
				displayOptions: {
					show: {
						action: [
							'createNewData',
							'updateExistedData'
						],
						method: ['jsonMode'],
					},
				},
				default: '',
				description: 'Please refer to <a href="https://www.ragic.com/intl/en/doc-api">here</a>',
			},
			{		// entries
				displayName: 'Entries',
				name: 'entries',
				placeholder: 'Add Entry',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'fieldMode_map',
						displayName: 'Entries',
						values: [
							{
								// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
								displayName: 'Field',
								name: 'entries_field',
								// eslint-disable-next-line n8n-nodes-base/node-param-description-missing-from-dynamic-options
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getFieldOptions',
									loadOptionsDependsOn: ['credentials', 'form', 'recordIndex'],
								},
								default: '',
								
							},
							{
								displayName: 'Value',
								name: 'entries_value',
								type: 'string',
								default: ''
							}
						]
					}
				],
				displayOptions: {
					show: {
						action: [
							'createNewData',
							'updateExistedData'
						],
						method: ['fieldMode'],
					},
				},
			},
			{		// show subtables
				displayName: 'Show Subtables',
				name: 'ifShowSubtables',
				type: 'boolean',
				default: true,
				description: 'Whether to show subtable data in response',
				displayOptions: {
					show: {
						action: [
							'readData',
							'readSingleData'
						],
					}
				},
			},
			{		// ignore masked
				displayName: 'Ignore Masked',
				name: 'ifIgnoreMasked',
				type: 'boolean',
				default: false,
				description: 'Whether to show the unmasked value of the fields of "Masked text"',
				displayOptions: {
					show: {
						action: [
							'readData',
							'readSingleData'
						],
					}
				},
			},
			{		// limit
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					numberPrecision: 0,
				},
				// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
				default: 1000,
				// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-limit
				description: 'The maximum number of records to return, please note that if this value is set too high, it may cause a time out to all Ragic Http API',
				displayOptions: { // the resources and operations to display this element with
					show: {
						action: ['readData'],
					}
				},
			},
			{		// filters
				displayName: 'Filters',
				name: 'filters',
				placeholder: 'Add Filter Condition',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'filter_map',
						displayName: 'Filters',
						values: [
							{
								// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
								displayName: 'Filter',
								name: 'filters_field',
								// eslint-disable-next-line n8n-nodes-base/node-param-description-missing-from-dynamic-options
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getFieldOptions',
									loadOptionsDependsOn: ['credentials', 'form'],
								},
								default: '',
								
							},
							{
								displayName: 'Operand',
								name: 'filters_operand',
								type: 'options',
								// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
								options: [
									{
										name: 'Equals',
										value: 'eq'
									},
									{
										name: 'Greater Or Equals',
										value: 'gte'
									},
									{
										name: 'Less Or Equals',
										value: 'lte'
									},
									{
										name: 'Greater',
										value: 'gt'
									},
									{
										name: 'Less',
										value: 'lt'
									},
									{
										name: 'Contains',
										value: 'like'
									},
									{
										name: 'Regular Expression',
										value: 'regex'
									},
									{
										name: 'Equals A Node ID',
										value: 'eqeq'
									}
								],
								default: 'eq'
							},
							{
								displayName: 'Condition',
								name: 'filters_value',
								type: 'string',
								default: '',
							}
						]
					}
				],
				displayOptions: {
					show: {
						action: ['readData'],
					},
				},
			},
			{		// other parameters
				displayName: 'Other Parameters',
				name: 'otherParameters',
				placeholder: 'Add Parameter',
				description: 'Other parameters please refer to <a href="https://www.ragic.com/intl/en/doc-api/25">here</a>',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'parameter_map',
						displayName: 'Other Parameters',
						values: [
							{
								displayName: 'Key',
								name: 'parameters_key',
								type: 'string',
								required: true,
								default: '',
								
							},
							{
								displayName: 'Value',
								name: 'parameters_value',
								type: 'string',
								default: '',
							},
						]
					}
				],
				displayOptions: {
					show: {
						action: [
							'readData',
							'readSingleData'
						],
					},
				},
			},
			
		],
	};

	methods = {
		loadOptions: {
			async getFormOptions(this: ILoadOptionsFunctions) {
				const credentials = await this.getCredentials('ragicApi');
				const serverName = credentials?.serverName as string;
				const apiKey = credentials?.apiKey as string;
				const responseJson = (await this.helpers.request({
					method: 'GET',
					url: `https://${serverName}/api/http/integromatForms.jsp?n8n`,
					headers: {
						Authorization: `Basic ${apiKey}`,
					},
					json: true,
				})) as JsonObject;

				const options = [];
				for (const key of Object.keys(responseJson)) {
					const optionInfo = responseJson[key] as JsonObject;
					options.push({name: optionInfo['displayName'] as string, value: optionInfo['path'] as string});
				}
				return options;
			},
			async getFieldOptions(this: ILoadOptionsFunctions){
				const credentials = await this.getCredentials('ragicApi');
				const serverName = credentials?.serverName as string;
				const apiKey = credentials?.apiKey as string;
				const path = this.getNodeParameter('form', 0);
				if (path === null || path === ''){
					return [];
				}
				const responseJson = (await this.helpers.request({
					method: 'GET',
					url: `https://${serverName}/${path}?api&def&n8n`,
					headers: {
						Authorization: `Basic ${apiKey}`,
					},
					json: true,
				})) as JsonObject;
				
				const fields = responseJson['fields'] as JsonObject;
				
				const options = [];
				for (const key of Object.keys(fields)) {
					if (!key.startsWith('fid')) continue;
					const domainId = key.substring(3);
					const info = fields[key] as JsonObject;
					const name = info['name'] as string;
					const displayName = name + ' (' + domainId + ')';
					options.push({name: displayName, value: domainId});
				}

				return options;
			}
		},
		
	};

	async execute(
		this: IExecuteFunctions,
	): Promise<INodeExecutionData[][] | NodeExecutionWithMetadata[][] | null> {
		
		// 獲取憑據
		const credentials = await this.getCredentials('ragicApi');

		// 獲取 serverName
		const serverName = credentials?.serverName as string;
		const apiKey = credentials?.apiKey as string;
		const action = this.getNodeParameter('action', 0);
		const path = this.getNodeParameter('form', 0);
		let method = null;
		if(action === 'createNewData' || action === 'updateExistedData'){
			method = this.getNodeParameter('method', 0) as string;
		}
		
		let recordIndex = '';
		if(action === 'updateExistedData' || action === 'readSingleData'){
			recordIndex = '/' + (this.getNodeParameter('recordIndex', 0) as string);
		}

		// 構建 baseURL
		let baseURL = `https://${serverName}/${path}${recordIndex}?api&n8n`;

		// 執行 API 請求
		let responseJson;
		if(action === 'readData' || action === 'readSingleData'){
			responseJson = await sendReadDataGETRequest(this, baseURL, apiKey);
		}else if(method === 'jsonMode') {
			responseJson = await sendJsonModePOSTRequest(this, baseURL, apiKey);
		} else if (method === 'fieldMode') {
			responseJson = await sendFieldModePOSTRequest(this, baseURL, apiKey);
		}
		

		// 確保返回的是 JSON 格式
		let parsedResponse;
		try {
			parsedResponse = (
				typeof responseJson === 'string' ? JSON.parse(responseJson) : responseJson
			) as IDataObject;
		} catch (error) {
			throw new ApplicationError('Failed to parse API response as JSON.');
		}

		// 返回結構化 JSON 數據
		return [this.helpers.returnJsonArray(parsedResponse)];
	}
}

async function sendReadDataGETRequest(iExecuteFunctions: IExecuteFunctions, baseURL: string, apiKey: string):Promise<JsonObject> {
	const url = new URL(baseURL);
	const action = iExecuteFunctions.getNodeParameter('action', 0);
	const ifShowSubtables = iExecuteFunctions.getNodeParameter('ifShowSubtables', 0) as boolean;
	const ifIgnoreMasked = iExecuteFunctions.getNodeParameter('ifIgnoreMasked', 0) as boolean;
	if(action !== 'readSingleData'){
		const filters = iExecuteFunctions.getNodeParameter('filters', 0) as IDataObject;
		const filter_map = filters['filter_map'] as Array<{filters_field:string, filters_operand:string, filters_value:string}>;
		if(filter_map){
			for(const filter of filter_map){
				const target = filter.filters_field;
				const operand = filter.filters_operand;
				const value = filter.filters_value;
				url.searchParams.append('where', target + ',' + operand + ',' + value);
			}
		}
	}
	const otherParameters = iExecuteFunctions.getNodeParameter('otherParameters', 0) as IDataObject;
	const otherParameter_map = otherParameters['parameter_map'] as Array<{parameters_key:string, parameters_value:string}>;
	if(otherParameter_map){
		for(const otherParameter of otherParameter_map){
			const key = otherParameter.parameters_key;
			const value = otherParameter.parameters_value;
			url.searchParams.append(key, value);
		}
	}
	if(action === 'readSingleData'){
		url.searchParams.set('singleEntryMode','')
	}else{
		const limit = iExecuteFunctions.getNodeParameter('limit', 0) + '' as string;
		url.searchParams.set('limit', limit);
	}
	if(ifShowSubtables){
		url.searchParams.delete('subtables');
	}else{
		url.searchParams.set('subtables', '0');
	}
	if(ifIgnoreMasked){
		url.searchParams.set('ignoreMask', 'true');
	}else{
		url.searchParams.delete('ignoreMask');
	}
	
	const responseJson = (await iExecuteFunctions.helpers.request({
		method: 'GET',
		url: url.toString(),
		headers: {
			Authorization: `Basic ${apiKey}`,
		},
		json: true,
	})) as JsonObject;

	return responseJson;
}

async function sendJsonModePOSTRequest(iExecuteFunctions: IExecuteFunctions, baseURL: string, apiKey: string):Promise<JsonObject> {
	const responseJson = (await iExecuteFunctions.helpers.request({
		method: 'POST',
		url: `${baseURL}`,
		headers: {
			Authorization: `Basic ${apiKey}`,
		},
		body: iExecuteFunctions.getNodeParameter('jsonBody', 0),
		json: true,
	})) as JsonObject;

	return responseJson;
}

async function sendFieldModePOSTRequest(iExecuteFunctions: IExecuteFunctions, baseURL: string, apiKey: string):Promise<JsonObject> {
	const jsonBody = {} as JsonObject;
	const entries = iExecuteFunctions.getNodeParameter('entries', 0) as IDataObject;
	const fieldMode_map = entries['fieldMode_map'] as Array<{entries_field:string, entries_value:string}>;
	for (const entry of fieldMode_map) {
		const field = entry.entries_field;
		const value = entry.entries_value;
		jsonBody[field] = value;
	}

	const responseJson = (await iExecuteFunctions.helpers.request({
		method: 'POST',
		url: `${baseURL}`,
		headers: {
			Authorization: `Basic ${apiKey}`,
		},
		body: jsonBody,
		json: true,
	})) as JsonObject;

	return responseJson;
}