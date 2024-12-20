import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { Message } from '@playsetonline/api-definitions';

import { ConfigurationService } from '../../shared/module/config/configuration.service';

@Injectable()
export class AppService {
	constructor(private readonly configService: ConfigurationService) {}

	@Cron('*/5 * * * *')
	async handleCron() {
		const apiConfig = this.configService.api;
		const port = 'production' !== apiConfig.environment ? `:${apiConfig.port}` : '';
		const apiBaseUrl = `${apiConfig.protocol}://${apiConfig.domain}${port}/graphql`;

		const body = {
			operationName: 'ListGames',
			query: 'query ListGames { listGames { uuid } }',
		};

		const response = await fetch(apiBaseUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		const parsedResponse = (await response.json()) as unknown as {
			data: { listGames: { uuid: string }[] };
		};

		const numberOfGames = parsedResponse.data.listGames.length;

		Logger.log(`There are currently ${numberOfGames} games.`);
	}

	welcomeMessage(): Message {
		return { message: 'Welcome to Play Set Online!' };
	}
}
