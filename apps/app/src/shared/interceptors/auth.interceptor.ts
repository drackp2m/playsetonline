import {
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
	HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { ApiClient } from '../services/api-client.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	private readonly API_LOGIN_URL = '/api/login';
	private readonly API_REFRESH_SESSION_URL = '/api/refresh-session';

	private isInvalidToken = false;
	private readonly JwtTokensRefreshed$: Subject<void> = new Subject<void>();

	constructor(private readonly apiClient: ApiClient, private readonly router: Router) {}

	intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		const ignoredUrls = [this.API_LOGIN_URL, this.API_REFRESH_SESSION_URL];

		if (ignoredUrls.includes(req.url)) return next.handle(req);

		return next.handle(req).pipe(
			switchMap((event) => {
				if (!(event instanceof HttpResponse)) return of(event);

				const isUnauthorizedError =
					event.body?.errors && event.body.errors[0].message === 'Unauthorized';

				if (!isUnauthorizedError) return of(event);

				if (this.isInvalidToken) {
					return this.JwtTokensRefreshed$.pipe(
						switchMap(() => {
							return next.handle(req);
						}),
					);
				}

				this.isInvalidToken = true;

				return this.refreshJwtTokens().pipe(
					switchMap(() => {
						this.isInvalidToken = false;

						this.JwtTokensRefreshed$.next();

						return next.handle(req);
					}),
					catchError(() => {
						this.isInvalidToken = false;

						this.router.navigate(['/login']);

						return of(event);
					}),
				);
			}),
		);
	}

	private refreshJwtTokens(): Observable<void> {
		return this.apiClient.auth.get('/refresh-session');
	}
}