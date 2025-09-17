import type { IAuthenticateGeneric, ICredentialType, INodeProperties, ICredentialTestRequest } from 'n8n-workflow';

export class RagicTriggerApi implements ICredentialType {
	name = 'ragicTriggerApi';

	displayName = 'Ragic Trigger API';

	documentationUrl = 'https://www.ragic.com/intl/en/doc/156';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Please refer to <a href="https://www.ragic.com/intl/en/doc-user/20/personal-settings#4">here</a>',
		},
		{
			displayName: 'Sheet Url',
			name: 'sheetUrl',
			type: 'string',
			default: '',
			required: true,
			description:
				'Please copy the sheet url from "https" til the charactor before "?" and paste it.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Basic " + $credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request:{
			baseURL: '={{($credentials.sheetUrl).split("/")[0] + "//" + ($credentials.sheetUrl).split("/")[2]}}',
			url: '/api/n8n/n8nCredentialCheck.jsp',
			headers: {
				Authorization: '={{"Basic " + $credentials.apiKey}}',
			},
			qs: {
				n8n: 'true',
				nodeType: 'trigger',
				ap: '={{($credentials.sheetUrl).split("/")[3]}}',
				path: '={{"/" + ($credentials.sheetUrl).split("/")[4]}}',
				sheetIndex: '={{($credentials.sheetUrl).split("/")[5]}}',
			}
		},
		rules:[			// 雖然type是responseSuccessBody，但實際上是用來處理錯誤的。
			{
				type: 'responseSuccessBody' as const,
				properties: {
					key: 'code',
					value: 400,
					message: 'Bad Request',
				},
			},
			{
				type: 'responseSuccessBody' as const,
				properties: {
					key: 'code',
					value: 403,
					message: 'Permission Denied',
				},
			},
			{
				type: 'responseSuccessBody' as const,
				properties: {
					key: 'code',
					value: 404,
					message: 'Form Not Found',
				},
			}
		]
	}
}
