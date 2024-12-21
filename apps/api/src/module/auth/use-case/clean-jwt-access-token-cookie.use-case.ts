import { Injectable } from '@nestjs/common';

@Injectable()
export class CleanJwtAccessTokenCookieUseCase {
	execute(accessToken: string): string {
		const accessTokenWithoutSecurePrefix = decodeURIComponent(accessToken).split(':')[1];

		if (accessTokenWithoutSecurePrefix === undefined) {
			return accessToken;
		}

		const accessTokenParts = accessTokenWithoutSecurePrefix.split('.');

		return accessTokenParts.slice(0, 3).join('.');
	}
}
