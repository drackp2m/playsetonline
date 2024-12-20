import { ApiProtocol } from '../../../environment/api-protocol.type';
import { NodeEnv } from '../../../environment/node-env.type';

export type ApiConfig = {
	environment: NodeEnv;
	protocol: ApiProtocol;
	domain: string;
	prefix: string;
	port: number;
	corsAllowedDomains: string[];
	cookieSecret: string;
	cookieDomain: string;
};
