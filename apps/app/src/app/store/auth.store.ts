import { Injectable, inject } from '@angular/core';
import { patchState, signalStore, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { BaseState, getInitialBaseState } from '../definition/base-state.interface';
import { ApiClient } from '../service/api-client.service';

type AuthInfo = { tokensAreValid: boolean };

const initialState: BaseState<AuthInfo, unknown> = getInitialBaseState({
	tokensAreValid: true,
});

@Injectable({
	providedIn: 'root',
})
export class AuthStore extends signalStore(
	{
		protectedState: false,
	},
	withState(initialState),
) {
	private readonly apiClient = inject(ApiClient);

	reset(): void {
		patchState(this, initialState);
	}

	markTokensAs(status: 'valid' | 'invalid'): void {
		patchState(this, { tokensAreValid: 'valid' === status, isLoading: false });
	}

	async tryToRefreshTokens(): Promise<void> {
		patchState(this, { isLoading: true });

		try {
			await firstValueFrom(this.apiClient.auth.get('/refresh-session'));

			patchState(this, { tokensAreValid: true, isLoading: false });
		} catch (error) {
			console.error('Error refreshing tokens');
			patchState(this, { error, tokensAreValid: false, isLoading: false });
		}
	}
}
