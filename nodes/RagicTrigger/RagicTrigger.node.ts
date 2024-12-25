import {
	INodeType,
	INodeTypeDescription,
	IHookFunctions,
  IExecuteFunctions,
  INodeExecutionData,
  NodeExecutionWithMetadata,
} from 'n8n-workflow';

export class RagicTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ragic Trigger',
		name: 'RagicTrigger',
		icon: 'file:Ragic.svg',
		group: ['trigger'],
		version: 1,
		description: 'Webhook Trigger for Ragic',
		defaults: {
			name: 'Ragic Trigger',
		},
		inputs: [],
		outputs: ['main'],
		properties: [
      {
        displayName: 'API Key',
        name: 'apiKey',
        type: 'string',
        default: '',
        required: true,
        description: 'Please refer to https://www.ragic.com/intl/en/doc-user/20/personal-settings#4',
      },
      {
        displayName: 'Sheet Url',
        name: 'sheetUrl',
        type: 'string',
        default: '',
        required: true,
        description: 'Please copy the sheet url from "https" til the charactor before "?" and paste it.'
      }
    ],
	};

	// 定義 webhookMethods
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        // const credentials = await this.getCredentials('RagicApiTrigger');
        // const apiKey = credentials?.apiKey as string;
        // const sheetUrl = credentials?.sheetUrl as String;
        const apiKey = this.getNodeParameter('apiKey',0) as string;
        const sheetUrl = this.getNodeParameter('sheetUrl',0) as string;
        const sheetUrlSection = sheetUrl.split('/');
        const server = sheetUrlSection[2];
        const apName = sheetUrlSection[3];
        const path = sheetUrlSection[4];
        const sheetIndex = sheetUrlSection[5];
        let url = `https://${server}/sims/webhooks.jsp?n8n`
        url += `&ap=${apName}`;
        url += `&path=${path}`;
        url += `&si=${sheetIndex}`;
        url += `&url=${webhookUrl}`;
        const response = await this.helpers.request({
            method: 'GET',
            url: url,
            headers: {
              Authorization: `Basic ${apiKey}`,
            },
        });
        return response.data.includes(webhookUrl);
      },
			async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default'); // 1. 獲取節點的 Webhook URL
        // const credentials = await this.getCredentials('RagicApiTrigger');
        // const apiKey = credentials?.apiKey as string;
        // const sheetUrl = credentials?.sheetUrl as String;
        const apiKey = this.getNodeParameter('apiKey',0) as string;
        const sheetUrl = this.getNodeParameter('sheetUrl',0) as string;
        const sheetUrlSection = sheetUrl.split('/');
        const server = sheetUrlSection[2];
        const apName = sheetUrlSection[3];
        const path = sheetUrlSection[4];
        const sheetIndex = sheetUrlSection[5];
        let url = `https://${server}/sims/webhookSubscribe.jsp?n8n`
        url += `&ap=${apName}`;
        url += `&path=${path}`;
        url += `&si=${sheetIndex}`;
        url += `&url=${webhookUrl}`;
        url += `&event=`;  // 暫時不確定event是甚麼
        // url += `&APIKey=${apiKey}`;  // 不確定有沒有用
        await this.helpers.request({ // 2. 發送 POST 請求到第三方 API
            method: 'GET', // 3. 請求方法
            url: url, // 4. 請求的 API URL
            headers: { // 5. HTTP 請求的header資訊
                Authorization: `Basic ${apiKey}`, // 5.1 從憑證中獲取 API Token
            },
            body: { // 6. 請求的主體
                url: webhookUrl, // 6.1 傳遞我們的 Webhook URL
            },
            json: true, // 7. 指定請求和回應使用 JSON 格式
        });
        return true; // 8. 返回 true 表示註冊成功
      },
			async delete(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default'); // 1. 獲取節點的 Webhook URL
        // const credentials = await this.getCredentials('RagicApiTrigger');
        // const apiKey = credentials?.apiKey as string;
        // const sheetUrl = credentials?.sheetUrl as String;
        const apiKey = this.getNodeParameter('apiKey',0) as string;
        const sheetUrl = this.getNodeParameter('sheetUrl',0) as string;
        const sheetUrlSection = sheetUrl.split('/');
        const server = sheetUrlSection[2];
        const apName = sheetUrlSection[3];
        const path = sheetUrlSection[4];
        const sheetIndex = sheetUrlSection[5];
        let url = `https://${server}/sims/webhookUnsubscribe.jsp?n8n`
        url += `&ap=${apName}`;
        url += `&path=${path}`;
        url += `&si=${sheetIndex}`;
        url += `&url=${webhookUrl}`;
        url += `&event=`;  // 暫時不確定event是甚麼
        // url += `&APIKey=${apiKey}`;  // 不確定有沒有用
        await this.helpers.request({ // 2. 發送 POST 請求到第三方 API
            method: 'GET', // 3. 請求方法
            url: url, // 4. 請求的 API URL
            headers: { // 5. HTTP 請求的header資訊
                Authorization: `Basic ${apiKey}`, // 5.1 從憑證中獲取 API Token
            },
            body: { // 6. 請求的主體
                url: webhookUrl, // 6.1 傳遞我們的 Webhook URL
            },
            json: true, // 7. 指定請求和回應使用 JSON 格式
        });
        return true; // 8. 返回 true 表示註冊成功
      },
		},
	};

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | NodeExecutionWithMetadata[][] | null> {

    const exec_apiKey = this.getNodeParameter('apiKey',0) as string;
    const exec_sheetUrl = this.getNodeParameter('sheetUrl',0) as string;
    const exec_sheetUrlSection = exec_sheetUrl.split('/');
    const exec_server = exec_sheetUrlSection[2];
    const exec_apName = exec_sheetUrlSection[3];
    const exec_path = exec_sheetUrlSection[4];
    const exec_sheetIndex = exec_sheetUrlSection[5];
    let url = `https://${exec_server}/api/http/testApiAuth.jsp?n8n`
    url += `&ap=${exec_apName}`;
    url += `&path=${exec_path}`;
    url += `&si=${exec_sheetIndex}`;
    const exec_response = await this.helpers.request({
      method: 'GET',
      url: url,
      headers: {
        Authorization: `Basic ${exec_apiKey}`,
      },
    });
    
    let parsedResponse;
    try {
			parsedResponse = typeof exec_response === 'string' ? JSON.parse(exec_response) : exec_response;
		} catch (error) {
			throw new Error('Failed to parse API response as JSON.');
		}
   
		// 返回結構化 JSON 數據
		return [this.helpers.returnJsonArray(parsedResponse)];
  }
}