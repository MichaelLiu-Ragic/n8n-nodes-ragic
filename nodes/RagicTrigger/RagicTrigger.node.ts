import {
	type INodeType,
	type INodeTypeDescription,
	type IHookFunctions,
	type IWebhookFunctions,
	type IWebhookResponseData,
	type NodeConnectionType,
	IHttpRequestMethods,
} from 'n8n-workflow';

export class RagicTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Ragic Trigger',
		name: 'ragicTrigger',
		icon: 'file:Ragic.svg',
		group: ['trigger'],
		version: 1,
		description: 'Webhook Trigger for Ragic',
		defaults: {
			name: 'Ragic_Trigger',
		},
		inputs: [],
		outputs: ['main'] as NodeConnectionType[],
		credentials: [
			{
				name: 'ragicTriggerApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default', // Webhook 的名稱
				httpMethod: 'POST', // 支援的 HTTP 方法
				responseMode: 'onReceived', // 回應模式（即時處理請求）
				path: 'default', // Webhook 的路徑（URL 的一部分）
			},
		],
		properties: [
			{
				displayName: 'Webhook Event',
				name: 'webhookEvent',				// 若name使用"event"，這個選項就會被當成是這個node的分支，在搜尋此node時，顯示方式會變得比較不友善。
				type: 'options',
				options: [
					{
						name: 'Create Records',
						value: 'create',
					},
					{
						name: 'Update Records',
						value: 'update',
					},
					{
						name: 'Create & Update Records',
						value: 'CreateUpdate',
					},
				],
				default: 'create',
				description: 'The Event of this trigger node listen to',
				required: true,
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		// 獲取請求數據
		const bodyData = this.getBodyData();

		return {
			workflowData: [
				this.helpers.returnJsonArray({
					bodyData,
				}),
			],
		};
	}

	// 定義 webhookMethods
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookInfo = await getWebhookInfo(this, 'check');
				const url = webhookInfo.requestUrl;
				const responseJSONArray = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'ragicTriggerApi',
					{
						method: webhookInfo.requestMethod,
						url,
						headers: {
							Authorization: webhookInfo.requestAuthorization,
						},
					}
				)) as [];
				
				for (let index = 0; index < responseJSONArray.length; index++) {
					const subscribedUrl = responseJSONArray[index]['url'];
					const subscribedWebhookEvent = responseJSONArray[index]['event'];
					if (subscribedUrl === webhookInfo.webhookUrl && subscribedWebhookEvent === webhookInfo.event) return true;
				}
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookInfo = await getWebhookInfo(this, 'create');
				const url = webhookInfo.requestUrl;
				await this.helpers.httpRequestWithAuthentication.call(
					this,
					'ragicTriggerApi',
					{
						method: webhookInfo.requestMethod,
						url,
						headers: {
							Authorization: webhookInfo.requestAuthorization,
						},
						json: true,
					}
				);
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookInfo = await getWebhookInfo(this, 'delete');
				const url = webhookInfo.requestUrl;
				await this.helpers.httpRequestWithAuthentication.call(
					this,
					'ragicTriggerApi',
					{
						method: webhookInfo.requestMethod,
						url,
						headers: {
							Authorization: webhookInfo.requestAuthorization,
						},
						json: true,
					}
				);
				return true;
			},
		},
	};
}

async function getWebhookInfo(iHookFuncions:IHookFunctions, webhookAction:'check'|'create'|'delete'):Promise<{ requestMethod: IHttpRequestMethods; requestUrl: string; requestAuthorization: string; webhookUrl: string; event: string}>{
	const credentials = await iHookFuncions.getCredentials('ragicTriggerApi');
	const webhookUrl = iHookFuncions.getNodeWebhookUrl('default') as string;
	const apiKey = credentials?.apiKey as string;
	const sheetUrl = credentials?.sheetUrl as string;
	const sheetUrlInfo = getFormUrlInfo(sheetUrl);
	const event = iHookFuncions.getNodeParameter('webhookEvent', 0) as string;
	let requestTarget = '/sims/';
	switch(webhookAction){
		case 'check':
			requestTarget += 'webhooks.jsp';
			break;
		case 'create':
			requestTarget += 'webhookSubscribe.jsp';
			break;
		case 'delete':
			requestTarget += 'webhookUnsubscribe.jsp';
			break;
	}
	let url = `${sheetUrlInfo.serverUrl}${requestTarget}?n8n`;
	url += `&ap=${sheetUrlInfo.apname}`;
	url += `&path=${sheetUrlInfo.path}`;
	url += `&si=${sheetUrlInfo.sheetIndex}`;
	url += `&url=${webhookUrl}`;
	url += `&event=${event}`;

	return {
		requestMethod: 'GET',
		requestUrl: url,
		requestAuthorization: `Basic ${apiKey}`,
		webhookUrl: webhookUrl,
		event: event
	}
}

function getFormUrlInfo(sheetUrl: string):{serverUrl:string, apname:string, path:string, sheetIndex:string}{
	const sheetUrlSec = sheetUrl.split('/');
	const serverUrl = sheetUrlSec[0] + '//' + sheetUrlSec[2];
	const apname = sheetUrlSec[3];
	const path = '/' + sheetUrlSec[4];
	const sheetIndex = sheetUrlSec[5];

	return {
		serverUrl: serverUrl,
		apname: apname,
		path: path,
		sheetIndex: sheetIndex
	}
}
