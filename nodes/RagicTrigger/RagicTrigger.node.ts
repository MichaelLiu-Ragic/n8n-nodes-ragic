import {
	IWebhookResponseData,
	INodeType,
	INodeTypeDescription,
	ITriggerFunctions,
	ITriggerResponse,
	IHookFunctions,
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
			name: 'My Trigger Node',
		},
		inputs: [],
		outputs: ['main'],
		properties: [],
	};

	// 定義 webhookMethods
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// 檢查是否已註冊 Webhook
				console.log('Checking if webhook exists...');
				return false; // 默認為不存在
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// 註冊 Webhook
				console.log('Creating webhook...');
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// 刪除 Webhook
				console.log('Deleting webhook...');
				return true;
			},
		},
	};

	// 定義 Trigger 方法
	trigger = async function (this: ITriggerFunctions): Promise<ITriggerResponse | undefined> {
		console.log('Trigger node started...');
		// 返回 Trigger 初始化邏輯
		return {
			closeFunction: async () => {
				console.log('Trigger node stopped...');
			},
		};
	};
}