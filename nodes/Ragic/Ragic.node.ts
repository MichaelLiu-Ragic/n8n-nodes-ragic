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
			{
				displayName: 'Method',
				name: 'method',
				type: 'options',
				noDataExpression: true,
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
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create New Data',
						value: 'createNewData',
					},
					{
						name: 'Update Existed Data',
						value: 'updateExistedData',
					},
				],
				default: 'createNewData',
			},
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
				displayName: 'Form',
				name: 'form',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getFormOptions',
					loadOptionsDependsOn: ['credentials'],
				},
				default: '',
				description:
					'Only the forms that you are the admin user would show in this list. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Record Index',
				name: 'recordIndex',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						action: ['updateExistedData'],
					},
				},
				default: '',
				description:
					'You can find the Record Index from the URL. Record URL structure: http://{domain}/{database}/{path}/{form}/{record index}?.',
			},
			{
				displayName: 'JSON Body',
				name: 'jsonBody',
				type: 'json',
				displayOptions: {
					show: {
						method: ['jsonMode'],
					},
				},
				default: '',
				description: 'Please refer to <a href="https://www.ragic.com/intl/en/doc-api">here</a>',
			},
			{
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
						method: ['fieldMode'],
					},
				},
			}
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
		const path = this.getNodeParameter('form', 0);
		let recordIndex;
		try {
			recordIndex = '/' + (this.getNodeParameter('recordIndex', 0) as string);
		} catch (error) {
			recordIndex = '';
		}

		// 構建 baseURL
		const baseURL = `https://${serverName}/${path}${recordIndex}?api&n8n`;

		// 執行 API 請求
		const method = this.getNodeParameter('method', 0);
		let responseJson;
		if(method === 'jsonMode') {
			responseJson = (await this.helpers.request({
				method: 'POST',
				url: `${baseURL}`,
				headers: {
					Authorization: `Basic ${apiKey}`,
				},
				body: this.getNodeParameter('jsonBody', 0),
				json: true,
			})) as JsonObject;
		} else if (method === 'fieldMode') {
			const jsonBody = {} as JsonObject;
			const entries = this.getNodeParameter('entries', 0) as IDataObject;
			const fieldMode_map = entries['fieldMode_map'] as Array<{entries_field:string, entries_value:string}>;
			for (const entry of fieldMode_map) {
				const field = entry.entries_field;
				const value = entry.entries_value;
				jsonBody[field] = value;
			}

			responseJson = (await this.helpers.request({
				method: 'POST',
				url: `${baseURL}`,
				headers: {
					Authorization: `Basic ${apiKey}`,
				},
				body: jsonBody,
				json: true,
			})) as JsonObject;
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
