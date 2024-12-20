import NodeCache from 'node-cache';

import { SemaphoreNamespace } from '../definition/semaphore-namespace.enum';

import { SemaphoreManagerService } from './semaphore-manager.service';

export class NodeCacheService {
	private readonly nodeCache = new NodeCache({ stdTTL: this.stdTtl });
	private readonly semaphore = new SemaphoreManagerService().getInstance({
		name: SemaphoreNamespace.ping,
	});

	constructor(private readonly stdTtl = 60) {}

	async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
		await this.semaphore.acquire();

		try {
			return this.nodeCache.set<T>(key, value, ttl ?? this.stdTtl);
		} finally {
			this.semaphore.release();
		}
	}

	async get<T>(key: string): Promise<T | undefined> {
		await this.semaphore.acquire();

		try {
			return this.nodeCache.get<T>(key);
		} finally {
			this.semaphore.release();
		}
	}

	async getAll<T>(): Promise<{ [key: string]: T }> {
		await this.semaphore.acquire();

		try {
			const allKeys = this.nodeCache.keys();

			return this.nodeCache.mget<T>(allKeys);
		} finally {
			this.semaphore.release();
		}
	}

	async getAllKeys(): Promise<string[]> {
		await this.semaphore.acquire();

		try {
			return this.nodeCache.keys();
		} finally {
			this.semaphore.release();
		}
	}

	async updateTtl(key: string, ttl?: number): Promise<boolean> {
		await this.semaphore.acquire();

		try {
			return 'undefined' !== typeof ttl ? this.nodeCache.ttl(key, ttl) : this.nodeCache.ttl(key);
		} finally {
			this.semaphore.release();
		}
	}
}
