import { AnyEntity } from '@mikro-orm/core';
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import { readdirSync } from 'fs';
import { databaseConfig } from './database.config';

async function getEntities(): Promise<AnyEntity[]> {
	if (process.env.WEBPACK) {
		const modules = require.context('../modules', true, /\.ts$/);

		return modules
			.keys()
			.map((r) => modules(r))
			.flatMap((mod) => Object.keys(mod).map((className) => mod[className]));
	}

	const promises = readdirSync('apps/api/src/modules').map(
		(file) => import(`../modules/${file}/${file}.entity.ts`),
	);
	const modules = await Promise.all(promises);

	return modules.flatMap((mod) =>
		Object.keys(mod).map((className) => mod[className]),
	);
}

export const mikroOrmConfig = async () =>
	({
		type: 'postgresql',
		...databaseConfig(),
		allowGlobalContext: true,
		entities: await getEntities(),
		migrations: {
			tableName: 'migrations',
			path: 'apps/api/src/migrations',
			transactional: true,
		},
	} as MikroOrmModuleSyncOptions);

export default mikroOrmConfig();
