import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RagicApiTrigger implements ICredentialType {
	name = 'RagicApiTrigger';
	displayName = 'Ragic API Trigger';
	properties: INodeProperties[] = [
		// {
		// 	displayName: 'API Key',
		// 	name: 'apiKey',
		// 	type: 'string',
		// 	default: '',
		// 	required: true,
		// },
		// {
		// 	displayName: 'Sheet Url',
		// 	name: 'sheetUrl',
		// 	type: 'string',
		// 	default: '',
		// 	required: true,
		// 	description: 'Please copy the sheet url from "https" til the charactor before "?" and paste it.'
		// }
	];
	authenticate = {
		type: 'generic',
		properties: {
			headers: {
        'Authorization': '={{"Basic " + $credentials.apiKey}}',
      },
		},
	} as IAuthenticateGeneric;
}