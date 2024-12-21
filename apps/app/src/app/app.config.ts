import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
	ApplicationConfig,
	computed,
	inject,
	isDevMode,
	provideExperimentalCheckNoChangesForDebug,
	provideExperimentalZonelessChangeDetection,
	signal,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { ApolloClientOptions, InMemoryCache, split } from '@apollo/client/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { OperationDefinitionNode } from 'graphql';
import { createClient } from 'graphql-ws';

import { environment } from '../environments/environment';

import { APP_ROUTES } from './app.routes';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { WithCredentialsInterceptor } from './interceptor/with-credentials.interceptor';

const pingTimestamp = signal<number | undefined>(undefined);

const pongTimestamp = signal<number | undefined>(undefined);

export const pingValue = computed(() => {
	const pingTimestampValue = pingTimestamp();
	const pongTimestampValue = pongTimestamp();

	if (pongTimestampValue === undefined || pingTimestampValue === undefined) {
		return undefined;
	}

	const ping = pongTimestampValue - pingTimestampValue;

	return 0 < ping ? ping : undefined;
});

const apolloConfig = (): ApolloClientOptions<unknown> => {
	const httpLink = inject(HttpLink);

	const http = httpLink.create({
		uri: `${environment.apiUrl}/graphql`,
	});

	const ws = new GraphQLWsLink(
		createClient({
			url: `${environment.wsUrl}/graphql`,
			connectionAckWaitTimeout: 1000,
			keepAlive: 2000,
			on: {
				ping: (_a, _b) => {
					pingTimestamp.set(new Date().getTime());
				},
				pong: (_c, _d) => {
					pongTimestamp.set(new Date().getTime());
				},
			},
		}),
	);

	const link = split(
		({ query }) => {
			const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode;

			return 'OperationDefinition' === kind && 'subscription' === operation;
		},
		ws,
		http,
	);

	// https://www.apollographql.com/docs/react/api/core/ApolloClient/
	return {
		name: 'playsetonline',
		link,
		defaultOptions: {
			watchQuery: {
				fetchPolicy: 'no-cache',
				errorPolicy: 'none', // none | ignore | all
			},
			query: {
				fetchPolicy: 'no-cache',
				errorPolicy: 'none',
			},
			mutate: {
				fetchPolicy: 'no-cache',
				errorPolicy: 'none',
			},
		},
		cache: new InMemoryCache(),
		connectToDevTools: true,
	};
};

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(withInterceptorsFromDi()),
		provideRouter(APP_ROUTES, withHashLocation()),
		provideServiceWorker('ngsw-worker.js', {
			enabled: !isDevMode(),
			registrationStrategy: 'registerWhenStable:5000',
			scope: '/',
		}),
		provideExperimentalZonelessChangeDetection(),
		provideExperimentalCheckNoChangesForDebug({
			exhaustive: true,
			interval: 500,
		}),
		provideApollo(apolloConfig),
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true,
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: WithCredentialsInterceptor,
			multi: true,
		},
	],
};
