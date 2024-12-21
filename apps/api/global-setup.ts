import { MetadataStorage, MikroORM } from '@mikro-orm/core';

import databaseConfig from './src/shared/module/config/mikro-orm.config';

declare let globalThis: {
	__TEARDOWN_MESSAGE__: string | undefined;
	__MIKRO_ORM__: MikroORM;
};

export default async () => {
	console.log('\nSetting up...\n');

	globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';

	const nxTaskTarget = process.env.NX_TASK_TARGET_TARGET;

	if (nxTaskTarget !== undefined && ['integrationTest'].includes(nxTaskTarget)) {
		console.log('Checking for pending DB migrations...\n');

		const config = await databaseConfig();

		globalThis.__MIKRO_ORM__ = await MikroORM.init(config);

		const pendingMigrations = await globalThis.__MIKRO_ORM__.migrator.getPendingMigrations();

		if (0 !== pendingMigrations.length) {
			console.log(`${pendingMigrations.length} pending migration(s) found:`);

			pendingMigrations.forEach((migration) => {
				console.log(`  - ${migration.name}`);
			});

			console.log(`\n`);

			await globalThis.__MIKRO_ORM__.migrator.up();
		}

		MetadataStorage.clear();

		await globalThis.__MIKRO_ORM__.close(true);
	}
};
