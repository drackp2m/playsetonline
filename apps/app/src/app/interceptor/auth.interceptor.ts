import {
	HttpErrorResponse,
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
	HttpResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, filter, skip, switchMap, take } from 'rxjs/operators';

import { AuthStore } from '../store/auth.store';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	private readonly authStore = inject(AuthStore);
	private readonly router = inject(Router);

	private readonly API_REFRESH_SESSION_URL = '/api/auth/refresh-session';
	private readonly API_REGISTER_URL = '/api/auth/register';
	private readonly API_LOGIN_URL = '/api/auth/login';

	private readonly authStoreLoadingFinished$ = toObservable(this.authStore.isLoading).pipe(
		skip(1),
		filter((value) => !value),
	);

	intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		const tokensAreValid = this.authStore.tokensAreValid();

		const urlsToIgnore = [this.API_REGISTER_URL, this.API_LOGIN_URL, this.API_REFRESH_SESSION_URL];

		if (!tokensAreValid || urlsToIgnore.some((url) => req.url.includes(url))) {
			return next.handle(req);
		}

		return next.handle(req).pipe(
			switchMap((event) => {
				return this.handleErrorOrEvent(req, next, event);
			}),
			catchError((error: unknown) => {
				return this.handleErrorOrEvent(req, next, error);
			}),
		);
	}

	// ToDo => improve types of this method
	handleErrorOrEvent(
		req: HttpRequest<unknown>,
		next: HttpHandler,
		event?: unknown,
	): Observable<HttpEvent<unknown>> {
		const isHttpErrorResponse = event instanceof HttpErrorResponse;
		const isHttpResponse = event instanceof HttpResponse;

		if (!isHttpErrorResponse && !isHttpResponse) {
			return of(event as HttpResponse<unknown>);
		}

		const isUnauthorizedError = isHttpErrorResponse
			? 401 === event.status
			: 'Unauthorized' === event.body?.errors?.[0]?.message;

		if (isUnauthorizedError && this.authStore.tokensAreValid()) {
			return this.retryRequest(req, next, event as HttpResponse<unknown>);
		}

		return of(event as HttpResponse<unknown>);
	}

	private retryRequest(
		req: HttpRequest<unknown>,
		next: HttpHandler,
		event?: HttpEvent<unknown>,
	): Observable<HttpEvent<unknown>> {
		const isAuthStoreLoading = this.authStore.isLoading();

		const requestAfterRefresh = this.authStoreLoadingFinished$.pipe(
			take(1),
			switchMap(() => {
				const tokensAreValid = this.authStore.tokensAreValid();

				if (!tokensAreValid) {
					this.router.navigate(['/login']);
				}

				return next.handle(req);
			}),
		);

		if (event !== undefined && !isAuthStoreLoading) {
			this.authStore.tryToRefreshTokens();
		}

		return requestAfterRefresh;
	}
}
