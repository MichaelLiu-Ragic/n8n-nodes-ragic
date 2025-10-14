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
			displayName: 'Server Url',
			name: 'serverUrl',
			type: 'string',
			default: '',
			required: true,
			description:
				'You can obtain the server URL from the web address of your database, copy the part of the URL from the start up to the domain, example: https://ap12.ragic.com',
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
			baseURL: '={{$credentials.serverUrl}}',
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
