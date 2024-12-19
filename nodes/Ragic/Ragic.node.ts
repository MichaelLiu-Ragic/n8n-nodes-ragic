import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeExecutionWithMetadata } from 'n8n-workflow';

export class Ragic implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
    displayName: 'Ragic',
    name: 'Ragic',
    icon: 'file:Ragic.svg',
    group: ['transform'],
    version: 1,
    subtitle: 'Update / Create data',
    description: 'Ragic: #1 No Code database builder',
    defaults: {
      name: 'Ragic',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'RagicApi',
        required: true,
      },
    ],
		properties: [
		// Resources and operations will go here
		]
	};


  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | NodeExecutionWithMetadata[][] | null> {
    // 獲取憑據
		const credentials = await this.getCredentials('RagicApi');

		// 獲取 serverName
		const serverName = credentials?.serverName as string;
		const apiKey = credentials?.apiKey as string;

		// 構建 baseURL
		const baseURL = `https://${serverName}/Takoumori/n8n-test/2?api`;

		// 執行 API 請求
		const response = await this.helpers.request({
			method: 'GET',
			url: `${baseURL}`, // 使用動態構建的 baseURL
			headers: {
				Authorization: `Basic ${apiKey}`,
			},
		});

		// 確保返回的是 JSON 格式
		let parsedResponse;
		try {
			parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
		} catch (error) {
			throw new Error('Failed to parse API response as JSON.');
		}

		// 返回結構化 JSON 數據
		return [this.helpers.returnJsonArray(parsedResponse)];
  }
}