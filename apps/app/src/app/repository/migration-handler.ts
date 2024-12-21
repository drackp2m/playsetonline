import { Injectable } from '@angular/core';
import { IDBPDatabase, IDBPTransaction, StoreNames, deleteDB } from 'idb';

import { OfflineGameSchema } from '../page/game/repository/offline-game/definition/offline-game-schema.interface';

import { KeyValueSchema } from './key-value/definition/key-value-schema.interface';

export type IDBPDatabaseSchemas = OfflineGameSchema | KeyValueSchema;

interface Migration<T> {
	version: number;
	apply: (props: {
		database: IDBPDatabase<T>;
		oldVersion: number;
		newVersion: number | null;
		transaction: IDBPTransaction<T, StoreNames<T>[], 'versionchange'>;
	}) => void;
}

@Injectable({
	providedIn: 'root',
})
export class MigrationHandler<T> {
	private readonly deprecatedDatabaseNames = ['PlaySetOnline'];

	private migrations: Migration<IDBPDatabaseSchemas>[] = [
		{
			version: 1,
			apply: ({ database }) => {
				database.createObjectStore('key_value');
			},
		},
		{
			version: 2,
			apply: ({ database, oldVersion }) => {
				if (2 > oldVersion) {
					database.createObjectStore('offline_game');
					database.createObjectStore('offline_game_set');
					database.createObjectStore('offline_game_event');
				}
			},
		},
		{
			version: 3,
			apply: ({ oldVersion, transaction }) => {
				if (3 > oldVersion) {
					const offlineGameStore = transaction.objectStore('offline_game');
					offlineGameStore.createIndex('status', 'status', { unique: false });
				}
			},
		},
		{
			version: 4,
			apply: ({ oldVersion, transaction }) => {
				if (4 > oldVersion) {
					const offlineGameStore = transaction.objectStore('offline_game_set');
					offlineGameStore.createIndex('game_uuid', 'game_uuid', { unique: false });

					const offlineGameEventStore = transaction.objectStore('offline_game_event');
					offlineGameEventStore.createIndex('game_uuid', 'game_uuid', { unique: false });
				}
			},
		},
	];

	getLatestVersion(): number {
		return this.migrations.length;
	}

	applyMigrations(
		database: IDBPDatabase<T>,
		oldVersion: number,
		newVersion: number | null,
		transaction: IDBPTransaction<T, StoreNames<T>[], 'versionchange'>,
	): void {
		const migrations = this.migrations as unknown as Migration<T>[];

		for (const migration of migrations) {
			if (migration.version > oldVersion) {
				migration.apply({ database, oldVersion, newVersion, transaction });
			}
		}
	}

	async removeDeprecatedDatabase(): Promise<void> {
		const promises: Promise<void>[] = [];

		if ('databases' in indexedDB) {
			const databases = await indexedDB.databases();
			databases.forEach((database): Promise<void> | void => {
				if (database.name !== undefined && this.deprecatedDatabaseNames.includes(database.name)) {
					const deletePromise = deleteDB(database.name, {
						blocked() {
							console.warn(`Unable to delete DataBase ${database.name}, because it is blocked`);
						},
					});

					promises.push(deletePromise);
				}
			});
		}

		await Promise.all(promises);
	}
}
