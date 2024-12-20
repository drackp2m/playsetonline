import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { Context } from 'graphql-ws';

import { GraphqlWsConnectionExtra } from '../../../../module/auth/definition/graphql-ws-connection-extra.interface';
import { JwtCookie } from '../../../../module/auth/definition/jwt-cookie.enum';
import { CleanJwtAccessTokenCookieUseCase } from '../../../../module/auth/use-case/clean-jwt-access-token-cookie.use-case';
import { ExtractCookiesFromRawHeadersUseCase } from '../../../../module/auth/use-case/extract-cookies-from-raw-headers.use-case';
import { ConfigurationService } from '../configuration.service';

@Injectable()
export class GqlFactory implements GqlOptionsFactory {
	constructor(
		private readonly configurationService: ConfigurationService,
		private readonly extractCookiesFromRawHeadersUseCase: ExtractCookiesFromRawHeadersUseCase,
		private readonly cleanJwtAccessTokenCookieUseCase: CleanJwtAccessTokenCookieUseCase,
	) {}

	createGqlOptions(): ApolloDriverConfig {
		const isProduction = 'production' === this.configurationService.api.environment;

		return {
			driver: ApolloDriver,
			autoSchemaFile: 'apps/api/src/schema.gql',
			csrfPrevention: false,
			sortSchema: true,
			context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
			includeStacktraceInErrorResponses: !isProduction,
			buildSchemaOptions: {
				dateScalarMode: 'isoDate',
				numberScalarMode: 'float',
				noDuplicatedFields: true,
			},
			definitions: {
				path: 'libs/api-definitions/src/lib/graphql/definitions.ts',
			},
			subscriptions: {
				'subscriptions-transport-ws': false,
				'graphql-ws': {
					path: '/graphql',
					onConnect: async (context: Context<Record<string, unknown>, unknown>) => {
						const extra = context.extra as GraphqlWsConnectionExtra;

						extra.request.signedCookies = this.getSignedCookiesFromGQLContextExtra(extra);

						return true;
					},
				},
			},
			playground: false,
			plugins: [...(isProduction ? [] : [ApolloServerPluginLandingPageLocalDefault()])],
		};
	}

	private getSignedCookiesFromGQLContextExtra(extra: GraphqlWsConnectionExtra): object {
		const cookies = this.extractCookiesFromRawHeadersUseCase.execute(extra.request.rawHeaders);

		const accessTokenCookieKey = JwtCookie.access;

		if (cookies[accessTokenCookieKey] !== undefined) {
			const cleanCookie = this.cleanJwtAccessTokenCookieUseCase.execute(
				cookies[accessTokenCookieKey],
			);

			Object.assign(cookies, { [accessTokenCookieKey]: cleanCookie });
		}

		return cookies;
	}
}
