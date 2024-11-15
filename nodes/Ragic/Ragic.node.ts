import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class Ragic implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
    displayName: 'Ragic',
    name: 'Ragic',
    icon: 'file:Ragic.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
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
    requestDefaults: {
      baseURL: 'https://www.ragic.com/demo/sales/1?api',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
		properties: [
		// Resources and operations will go here
		]
	};
}