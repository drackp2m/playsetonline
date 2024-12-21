import { EntityManager, FilterQuery, FindOneOptions, FindOptions, Primary } from '@mikro-orm/core';

import { NotFoundException } from '../exception/not-found.exception';

import { CustomBaseEntity } from './custom-base.entity';

export class CustomRepository<T extends CustomBaseEntity<T>> {
	constructor(
		private readonly entityManager: EntityManager,
		private readonly entityName: string,
	) {}

	getReference(id: Primary<T>): T {
		return this.entityManager.fork().getReference<T>(this.entityName, id);
	}

	async getOne<Hint extends string = never>(
		query: FilterQuery<T>,
		options?: FindOneOptions<T, Hint>,
	): Promise<T> {
		const user = await this.entityManager.fork().findOne(this.entityName, query, options);

		if (null === user) {
			const entityName = this.entityName.replace('Entity', '').toLocaleLowerCase();
			throw new NotFoundException('not exists', entityName);
		}

		return user;
	}

	async getMany<Hint extends string = never>(
		query: FilterQuery<T> = {},
		options?: FindOptions<T, Hint>,
	): Promise<T[]> {
		return this.entityManager.fork().find(this.entityName, query, options);
	}

	async insert(entity: T): Promise<T> {
		await this.entityManager.fork().persistAndFlush(entity);

		return entity;
	}

	async update(entity: T): Promise<T> {
		return this.insert(entity);
	}

	async delete(entity: T): Promise<void> {
		await this.entityManager.fork().removeAndFlush(entity);
	}

	async deleteMany(query: FilterQuery<T>): Promise<void> {
		await this.entityManager.fork().nativeDelete(this.entityName, query);
	}
}
