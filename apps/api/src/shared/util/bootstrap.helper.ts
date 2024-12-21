import { readFileSync } from 'node:fs';

import { INestApplication, Logger, NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { GlobalPrefixOptions } from '@nestjs/common/interfaces';

import { ConfigurationService } from '../module/config/configuration.service';
import { ApiConfig } from '../module/config/definition/api-config.type';

import { HttpExceptionFilter } from './exception-filter';

export class BootstrapHelper {
	static readonly validationPipe = new ValidationPipe({
		whitelist: true,
		transform: true,
	});

	static readonly exceptionsFilter = new HttpExceptionFilter();

	static readonly globalPrefix = (
		appConfig: ApiConfig,
	): [prefix: string, options?: GlobalPrefixOptions] => {
		return [appConfig.prefix, { exclude: ['', 'api'] }];
	};

	static readonly nestApplicationOptions = (appConfig: ApiConfig): NestApplicationOptions => {
		const nestApplicationOptions: NestApplicationOptions = {};

		if ('production' !== appConfig.environment) {
			nestApplicationOptions.httpsOptions = {
				key: readFileSync('certs/self-signed.key'),
				cert: readFileSync('certs/self-signed.crt'),
			};
		}

		return nestApplicationOptions;
	};

	static readonly apiConfig = (app: INestApplication): ApiConfig => {
		const configService = app.get(ConfigurationService);

		return configService.api;
	};

	static readonly logAppBootstrap = (appConfig: ApiConfig): void => {
		const isProduction = 'production' === appConfig.environment;
		const port = isProduction ? '' : `:${appConfig.port}`;

		const playgroundUrl = `${appConfig.protocol}://${appConfig.domain}${port}/graphql`;
		const uptime = process.uptime().toFixed(3);
		const exposedPortInfo = isProduction ? ` and exposed on port ${appConfig.port}` : '';

		Logger.log(
			`🚀 GraphQL Playground ready at ${playgroundUrl} in ${uptime}s` + exposedPortInfo,
			'Bootstrap',
		);
	};
}
