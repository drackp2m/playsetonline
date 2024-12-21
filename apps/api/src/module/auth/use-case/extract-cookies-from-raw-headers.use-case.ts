import { Injectable } from '@nestjs/common';

@Injectable()
export class ExtractCookiesFromRawHeadersUseCase {
	execute(rawHeaders: string[]): Record<string, string> {
		const headers = this.getHeadersFromPlainArray(rawHeaders);

		const plainHeaderCookies = headers.get('Cookie');

		return plainHeaderCookies !== undefined
			? this.getCookiesFromCookieHeader(plainHeaderCookies)
			: {};
	}

	private getHeadersFromPlainArray(rawHeaders: string[]): Map<string, string> {
		const headers: Map<string, string> = new Map();

		for (let i = 0; i < rawHeaders.length; i += 2) {
			const key = rawHeaders[i];
			const value = rawHeaders[i + 1];

			if (key !== undefined && value !== undefined) {
				headers.set(key, value);
			}
		}

		return headers;
	}

	private getCookiesFromCookieHeader(cookieHeader: string): Record<string, string> {
		const cookiesArray = cookieHeader.split(';');

		const cookiesAsObject =
			cookiesArray.reduce((obj, item) => {
				const [key, value] = item.trim().split('=');

				if (key !== undefined && value !== undefined) {
					Object.assign(obj, { [key]: value });
				}

				return obj;
			}, {}) ?? {};

		return cookiesAsObject;
	}
}
