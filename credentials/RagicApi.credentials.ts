import type { IAuthenticateGeneric, ICredentialType, INodeProperties, ICredentialTestRequest } from 'n8n-workflow';

export class RagicApi implements ICredentialType {
	name = 'ragicApi';

	displayName = 'Ragic API';

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
			displayName: 'Server Name',
			name: 'serverName',
			type: 'string',
			default: '',
			required: true,
			description:
				'You can find the server name in your database url, from the frist charactor after "https://" til the charactor before the next "/". It should be like "www.ragic.com" or "ap5.ragic.com".',
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
			baseURL: '={{"https://" + $credentials.serverName}}',
			url: '/api/n8n/n8nCredentialCheck.jsp',
			headers: {
				Authorization: '={{"Basic " + $credentials.apiKey}}',
			},
			qs: {
				n8n: 'true',
				nodeType: 'action',
			}
		},
		rules:[			// 雖然type是responseSuccessBody，但實際上是用來處理錯誤的。
			{
				type: 'responseSuccessBody' as const,
				properties: {
					key: 'code',
					value: 403,
					message: 'Permission Denied',
				},
			}
		]
	}
}
