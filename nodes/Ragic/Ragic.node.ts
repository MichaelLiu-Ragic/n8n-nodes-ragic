import { IExecuteFunctions, ILoadOptionsFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeExecutionWithMetadata } from 'n8n-workflow';

export class Ragic implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
    displayName: 'Ragic',
    name: 'Ragic',
    icon: 'file:Ragic.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["action"]}}',
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
      displayName: 'Form',
      name: 'form',
      type: 'options',
      typeOptions: {
        loadOptionsMethod: 'getFormOptions',
      },
      default: '',
      description: 'Choose the form based on the action.',
    },
		]
	};

  methods = {
    loadOptions: {
      async getFormOptions(this: ILoadOptionsFunctions) {
        // 獲取當前選擇的 `action` 值
        const action = this.getNodeParameter('action') as string;
  
        // 如果選擇的是 `createNewData`，發送 API 請求
        if (action === 'createNewData') {
          const credentials = await this.getCredentials('RagicApi');
          const serverName = credentials?.serverName as string;
          const apiKey = credentials?.apiKey as string;
          const response = await this.helpers.request({
            method: 'GET',
            url: `https://${serverName}/Takoumori/n8n-test/2?api`, // 替換為實際的 API URL
            headers: {
              Authorization: `Basic ${apiKey}`,
            },
          });
  
          // 假設回傳的 JSON 結構為 [{ id: '1', name: 'Form 1' }, { id: '2', name: 'Form 2' }]
          return response.map((form: { id: string; name: string }) => ({
            name: form.name,
            value: form.id,
          }));
        }
  
        // 如果選擇的是其他動作，返回空選項
        return [];
      },
    },
  };


  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | NodeExecutionWithMetadata[][] | null> {
    // 獲取憑據
		const credentials = await this.getCredentials('RagicApi');

		// 獲取 serverName
		const serverName = credentials?.serverName as string;
		const apiKey = credentials?.apiKey as string;

		// 構建 baseURL
		const baseURL = `https://${serverName}/Takoumori/n8n-test/2?api`;
    const action = this.getNodeParameter('action', 0) as string;

		// 執行 API 請求
    let response;
    if(action === 'createNewData'){
      response = await this.helpers.request({
        method: 'POST',
        url: `${baseURL}`, // 使用動態構建的 baseURL
        headers: {
          Authorization: `Basic ${apiKey}`,
        },
        body:{
          '1000009':'n8n測試',
          '1000010':'總算有點進展了'
        }
      });
    }else{
      response = await this.helpers.request({
        method: 'GET',
        url: `${baseURL}`, // 使用動態構建的 baseURL
        headers: {
          Authorization: `Basic ${apiKey}`,
        },
      });
    }


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