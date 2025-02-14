import { Migrator } from '@mikro-orm/migrations';
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

import { MikroOrmNamingStrategy } from './mikro-orm.naming-strategy';
import { databaseConfig } from './register/database-config';

export default async (): Promise<MikroOrmModuleSyncOptions> => ({
	driver: PostgreSqlDriver,
	...databaseConfig(),
	allowGlobalContext: false,
	forceUtcTimezone: true,
	tsNode: true,
	preferTs: true,
	autoLoadEntities: true,
	extensions: [Migrator],
	entities: ['apps/api/src/module/**/*.entity.ts'],
	namingStrategy: MikroOrmNamingStrategy,
	migrations: {
		tableName: 'migrations',
		path: 'apps/api/migrations',
		// snapshot: false,
		silent: true,
	},
});
