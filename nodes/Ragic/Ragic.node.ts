import type {
	IBinaryData,
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
import { ApplicationError, BINARY_ENCODING } from 'n8n-workflow';

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
				// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
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
					{
						name: 'Retrieve File',
						value: 'retrieveFile'
					}
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
				displayOptions: {
					hide: {
						action: [
							'retrieveFile'
						],
					}
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
								displayName: 'Content Type',
								name: 'entries_type',
								type: 'options',
								options: [
									{
										name: 'Text',
										value: 'text',
									},
									{
										name: 'File',
										value: 'file',
									},
								],
								default: 'text',
								required: true,
							},
							{
								displayName: 'Value',
								name: 'entries_value',
								type: 'string',
								default: '',
							},
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
			{		// subtable entries
				displayName: 'Subtable Entries',
				name: 'subtableEntries',
				placeholder: 'Add Subtable Entry',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'fieldMode_subtable_map',
						displayName: 'Subtable Entries',
						values: [
							{
									displayName: 'Subtable Record Node ID',
									name: 'subtable_entries_nodeId',
									type: 'number',
									required: true,
									default: -1,
									description: 'Subtable record node ID; Enter a negative integer to create new subtable records, use the same negative integer for each new record',
							},
							{
								// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
								displayName: 'Subtable Field',
								name: 'subtable_entries_field',
								// eslint-disable-next-line n8n-nodes-base/node-param-description-missing-from-dynamic-options
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getSubtableFieldOptions',
									loadOptionsDependsOn: ['credentials', 'form', 'recordIndex'],
								},
								default: '',
								
							},
							{
								displayName: 'Content Type',
								name: 'subtable_entries_type',
								type: 'options',
								options: [
									{
										name: 'Text',
										value: 'text',
									},
									{
										name: 'File',
										value: 'file',
									},
								],
								default: 'text',
								required: true,
							},
							{
								displayName: 'Value',
								name: 'subtable_entries_value',
								type: 'string',
								default: '',
							},
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
			{		// File Download With User Authentication
				displayName: 'File Download With User Authentication',
				name: 'fileDownloadWithUserAuthentication',
				type: 'boolean',
				default: false,
				description: 'Whether the "File Download With User Authentication" in Company Settings is set to "Yes" (default No)',
				displayOptions: {
					show: {
						action: ['retrieveFile'],
					}
				},
			},
			{		//account name (for retrieve files)
				displayName: 'Account Name',
				name: 'apName',
				type: 'string',
				required: true,
				default: '',
				description: 'Account name of where the file is at',
				displayOptions: {
					show: {
						action: ['retrieveFile'],
						fileDownloadWithUserAuthentication: [
							false
						]
					}
				},
			},
			{		// file record url
				displayName: 'File Record Url',
				name: 'fileRecordUrl',
				type: 'string',
				required: true,
				default: '',
				description: 'Please enter the record URL where you upload the file; nevigate to the record and copy the URL, then paste it here',
				displayOptions: {
					show: {
						action: ['retrieveFile'],
						fileDownloadWithUserAuthentication: [
							true
						],
					}
				},
			},
			{		// file name
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				required: true,
				default: '',
				description: 'You can find the file name from the returned JSON from "Read Data" action, the file name format should look like: Ni92W2luv@My_Picture.jpg',
				displayOptions: {
					show: {
						action: [
							'retrieveFile',
						]
					}
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
				const formDef = await getFormDef(this);				
				const fields = formDef['fields'] as JsonObject;
				
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
			},
			async getSubtableFieldOptions(this: ILoadOptionsFunctions){
				const formDef = await getFormDef(this);				
				const fields = formDef['fields'] as JsonObject;
				
				const options = [];
				for (const key of Object.keys(fields)) {
					if (!key.startsWith('stid')) continue;
					const subtableKey = key.substring(4);
					const subtableDef = fields[key] as JsonObject;
					for(const subtableDefKey of Object.keys(subtableDef)){
						if(!subtableDefKey.startsWith('fid')) continue;
						const domainId = subtableDefKey.substring(3);
						const info = subtableDef[subtableDefKey] as JsonObject;
						const name = info['name'] as string;
						const displayName = name + ' (' + subtableKey + '_' + domainId + ')';
						options.push({name: displayName, value: subtableKey + '_' + domainId});
					}
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

		// 執行 API 請求
		let response;
		let iBinaryData:IBinaryData|null = null;
		if(action === 'readData' || action === 'readSingleData'){
			const baseURL = buildRegularAPIUrl(this, action, serverName);
			response = await sendReadDataGETRequest(this, baseURL, apiKey);
		}else if(action === 'createNewData' || action === 'updateExistedData'){
			const method = this.getNodeParameter('method', 0);
			const baseURL = buildRegularAPIUrl(this, action, serverName);
			if(method === 'jsonMode'){
				response = await sendJsonModePOSTRequest(this, baseURL, apiKey);
			} else if(method === 'fieldMode'){
				response = await sendFieldModePOSTRequest(this, baseURL, apiKey);
			}
		}else if(action === 'retrieveFile'){
			iBinaryData = await sendRetrieveFileGETRequest(this, serverName, apiKey);
		}
		
		if(iBinaryData){
			const item: INodeExecutionData = {
				json: iBinaryData,
				binary: {downloadedFile:iBinaryData},
			};
			return this.prepareOutputData([item]);

		}else{
			try {
				const parsedResponse = (
					typeof response === 'string' ? JSON.parse(response) : response
				) as IDataObject;

				return [this.helpers.returnJsonArray(parsedResponse)];
			} catch (error) {
				throw new ApplicationError('Failed to parse API response as JSON.');
			}
		}
	}
}

function buildRegularAPIUrl(iExecuteFunctions: IExecuteFunctions, action:string, serverName:string):string{
	const path = iExecuteFunctions.getNodeParameter('form', 0);
	
	let recordIndex = '';
	if(action === 'updateExistedData' || action === 'readSingleData'){
		recordIndex = '/' + (iExecuteFunctions.getNodeParameter('recordIndex', 0) as string);
	}

	return `https://${serverName}/${path}${recordIndex}?api&n8n`;
}

async function sendReadDataGETRequest(iExecuteFunctions: IExecuteFunctions, baseURL: string, apiKey: string):Promise<JsonObject> {
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
				const value = encodeURIComponent(filter.filters_value);
				baseURL += ('&where=' + target + ',' + operand + ',' + value);
			}
		}
	}
	const otherParameters = iExecuteFunctions.getNodeParameter('otherParameters', 0) as IDataObject;
	const otherParameter_map = otherParameters['parameter_map'] as Array<{parameters_key:string, parameters_value:string}>;
	if(otherParameter_map){
		for(const otherParameter of otherParameter_map){
			const key = encodeURIComponent(otherParameter.parameters_key);
			const value = encodeURIComponent(otherParameter.parameters_value);
			baseURL += ('&' + key + '=' + value);
		}
	}
	if(action === 'readSingleData'){
		baseURL += '&singleEntryMode';
	}else{
		const limit = iExecuteFunctions.getNodeParameter('limit', 0) + '' as string;
		baseURL += ('&limit=' + limit);
	}
	if(!ifShowSubtables){
		baseURL += '&subtables=0'
	}
	if(ifIgnoreMasked){
		baseURL += '&ignoreMask=true'
	}
	
	const responseJson = (await iExecuteFunctions.helpers.request({
		method: 'GET',
		url: baseURL,
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
	const formData = {} as IDataObject;

	// 一般欄位 -------------------------------------------------------------
	const entries = iExecuteFunctions.getNodeParameter('entries', 0) as IDataObject;
	const fieldMode_map = entries['fieldMode_map'] as Array<{
		entries_field: string;
		entries_value?: string;
		entries_type?: string;        // 'text' 或 'file'
	}>;
	if(fieldMode_map){
		for (const entry of fieldMode_map) {
			if (entry.entries_type === 'file' && entry.entries_value) {		// 檔案欄位
				addFormData(entry.entries_field, entry.entries_value, 'file', formData, iExecuteFunctions);
			}
			else if (entry.entries_value !== undefined) {		// 純文字欄位
				addFormData(entry.entries_field, entry.entries_value, 'text', formData, iExecuteFunctions);
			}
		}
	}
	// -------------------------------------------------------------------
	
	// 子表格欄位 ---------------------------------------------------------
	const subtablentries = iExecuteFunctions.getNodeParameter('subtableEntries', 0) as IDataObject;
	const fieldMode_subtable_map = subtablentries['fieldMode_subtable_map'] as Array<{
		subtable_entries_nodeId: number;
		subtable_entries_field: string;
		subtable_entries_value?: string;
		subtable_entries_type?: string;        // 'text' 或 'file'
	}>;
	if(fieldMode_subtable_map){
		for(const subtableEntry of fieldMode_subtable_map){
			const subtableKey_domainId = subtableEntry.subtable_entries_field;
			if(subtableKey_domainId.split('_').length !== 2) continue;
			const domainId = subtableKey_domainId.split('_')[1];
			const formDataKey = domainId + '_' + subtableEntry.subtable_entries_nodeId;

			if(subtableEntry.subtable_entries_type === 'file' && subtableEntry.subtable_entries_value){
				addFormData(formDataKey, subtableEntry.subtable_entries_value, 'file', formData, iExecuteFunctions);
			}else if(subtableEntry.subtable_entries_value !== undefined){
				addFormData(formDataKey, subtableEntry.subtable_entries_value, 'text', formData, iExecuteFunctions);
			}
		}
	}
	// ----------------------------------------------------------------
	
	const responseJson = (await iExecuteFunctions.helpers.request({
		method: 'POST',
		url: `${baseURL}`,
		headers: {
			Authorization: `Basic ${apiKey}`,
		},
		formData,
		json: true,
	})) as JsonObject;

	return responseJson;
}

async function sendRetrieveFileGETRequest(iExecuteFunctions: IExecuteFunctions, serverName:string, apiKey: string):Promise<IBinaryData> {
	const fileDownloadWithUserAuthentication = iExecuteFunctions.getNodeParameter('fileDownloadWithUserAuthentication', 0) as boolean;
	let apName:string;
	let cookies = [] as string[];
	
	if(fileDownloadWithUserAuthentication){
		const fileRecordUrl = iExecuteFunctions.getNodeParameter('fileRecordUrl', 0) as string;
		const accessRecordUrl = fileRecordUrl.split('?')[0] + '?api&n8n'
		const accessRecordResponse = await iExecuteFunctions.helpers.request({
      method: 'GET',
      url: accessRecordUrl,
			headers: {
				Authorization: `Basic ${apiKey}`,
			},
      resolveWithFullResponse: true,
      json: true,
    });
		cookies = accessRecordResponse.headers['set-cookie'];
		apName = fileRecordUrl.split('/')[3];
	}else{
		apName = iExecuteFunctions.getNodeParameter('apName', 0) as string;
	}

	const cookie = cookies.join(';');
	const fullFileName = iExecuteFunctions.getNodeParameter('fileName', 0) as string;
	const retrieveFileUrl = `https://${serverName}/sims/file.jsp?a=${apName}&f=${fullFileName}`;
	const fileName = fullFileName.split('@')[1];
	const stream = await iExecuteFunctions.helpers.request({
		method: 'GET',
		url: retrieveFileUrl,
		headers: {
			Authorization: `Basic ${apiKey}`,
			Cookie: cookie
		},
		encoding: null,
  	json: false,
	});
	
	return await iExecuteFunctions.helpers.prepareBinaryData(stream, fileName);

}

async function getFormDef(iLoadOptionsFunctions:ILoadOptionsFunctions):Promise<JsonObject>{
	const credentials = await iLoadOptionsFunctions.getCredentials('ragicApi');
	const serverName = credentials?.serverName as string;
	const apiKey = credentials?.apiKey as string;
	const path = iLoadOptionsFunctions.getNodeParameter('form', 0);
	if (path === null || path === ''){
		throw new ApplicationError('invalid path');
	}
	const responseJson = (await iLoadOptionsFunctions.helpers.request({
		method: 'GET',
		url: `https://${serverName}/${path}?api&def&n8n`,
		headers: {
			Authorization: `Basic ${apiKey}`,
		},
		json: true,
	})) as JsonObject;

	return responseJson;
}

async function addFormData(key:string, value:string, type:string, formData:IDataObject, iExecuteFunctions: IExecuteFunctions):Promise<IDataObject>{
	if(type === 'file'){
		// 用 assertBinaryData() 安全取得 IBinaryData 的 metadata（檔名、MIME 類型），
		// 會檢查該 binary property 是否存在，若不存在會丟出明確錯誤
		const binaryData = iExecuteFunctions.helpers.assertBinaryData(0, value);

		// 直接從輸入資料中抓 IBinaryData 實體（可能包含 id 或 base64 data），
		// 不經檢查，因為需要直接取用 .id 或 .data 來決定是用 Buffer 還是 Stream
		const itemBinaryData = iExecuteFunctions.getInputData(0)[0].binary![value];
		let uploadData: Buffer | NodeJS.ReadableStream;

		if (itemBinaryData.id) {
			// 大檔案用 stream
			uploadData = await iExecuteFunctions.helpers.getBinaryStream(itemBinaryData.id);
		} else {
			// 小檔案用 Buffer
			uploadData = Buffer.from(itemBinaryData.data, BINARY_ENCODING);
		}

		if (!formData[key]) {
			formData[key] = [];
		}

		(formData[key] as IDataObject[]).push({
			value: uploadData,
			options: {
				filename: binaryData.fileName || 'upload.bin',
				contentType: binaryData.mimeType || 'application/octet-stream',		// 如果沒有提供，application/octet-stream 代表「未知的二進位檔案」，是最安全的通用型別。
			},
		});
	}else if(type === 'text'){
		if (!formData[key]) {
			formData[key] = [];
		}
		(formData[key] as string[]).push(value);
	}
	return formData;
}