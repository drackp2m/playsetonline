import { Injectable, computed, inject, signal } from '@angular/core';

import { GameOfflineStore } from '../page/game/store/game-offline.store';
import { MigrationHandler } from '../repository/migration-handler';
import { UserStore } from '../store/user.store';

@Injectable({
	providedIn: 'root',
})
export class AppLoaderService {
	private readonly userStore = inject(UserStore);
	private readonly gameOfflineStore = inject(GameOfflineStore);
	private readonly migrationHandler = inject(MigrationHandler);

	private stopCheck = false;

	readonly loadFinish = computed(() => {
		return this.checkLoadFinish();
	});

	readonly removeDeprecatedDatabases = signal<boolean>(false);

	constructor() {
		this.startRemoveDeprecatedDatabases();
	}

	private checkLoadFinish(): boolean {
		const loadFinish =
			this.stopCheck || (this.userLoaded() && this.isGameLoaded() && this.isRemoveDatabaseFinish());

		if (loadFinish) {
			this.stopCheck = true;
		}

		return loadFinish;
	}

	private userLoaded(): boolean {
		const isUserLoading = this.userStore.isLoading();

		return !isUserLoading;
	}

	private isGameLoaded(): boolean {
		const gameLoading = this.gameOfflineStore.isLoading();

		return !gameLoading;
	}

	private isRemoveDatabaseFinish(): boolean {
		const removeDeprecatedDatabase = this.removeDeprecatedDatabases();

		return removeDeprecatedDatabase;
	}

	private startRemoveDeprecatedDatabases(): void {
		this.migrationHandler.removeDeprecatedDatabase().then(() => {
			this.removeDeprecatedDatabases.set(true);
		});
	}
}
