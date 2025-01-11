import { Test, TestingModule } from '@nestjs/testing';

import { DateFaker } from './date.faker';

describe('DateFaker', () => {
	let util: DateFaker;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [DateFaker],
		}).compile();

		util = await module.resolve(DateFaker);
	});

	it('should be defined', () => {
		expect(util).toBeDefined();
	});

	describe('createdAt', () => {
		it('should return a valid date', () => {
			const result = util.createdAt();

			expect(result).toBeInstanceOf(Date);
		});

		it('should return null when invalid `since` date is passed', () => {
			const result = util.createdAt('invalid');

			expect(result).toBeNull();
		});

		it.skip('should return null when `since` date above now is passed', () => {
			jest.useFakeTimers().setSystemTime(new Date('2024-12-21T22:29:42.000Z'));

			const since = new Date('2024-12-21T22:29:42.001Z');

			const result = util.createdAt(since);

			expect(result).toBeNull();
		});

		it('should return Date between now and `since` when `since` date below now is passed', () => {
			jest.useFakeTimers().setSystemTime(new Date('2024-12-21T22:29:42.000Z'));

			const now = new Date();
			const since = new Date('1731-10-20');

			const result = util.createdAt(since);

			expect(result?.getTime()).toBeGreaterThanOrEqual(since.getTime());
			expect(result?.getTime()).toBeLessThanOrEqual(now.getTime());
		});
	});

	describe('modifiedAt', () => {
		it('should return a valid Date', () => {
			const result = util.modifiedAt();

			expect(result).toBeInstanceOf(Date);
		});

		it('should return a date above the creation date', () => {
			jest.useFakeTimers().setSystemTime(new Date('2024-12-21T22:29:42.000Z'));

			const now = new Date();

			const createdAt = util['createdAt']();
			const result = util.modifiedAt();

			expect(result.getTime()).toBeGreaterThanOrEqual(createdAt?.getTime() ?? 0);
			expect(result.getTime()).toBeLessThanOrEqual(now.getTime());
		});
	});

	describe('expiresOn', () => {
		it('should return a valid Date', () => {
			const result = util.expiresOn();

			expect(result).toBeInstanceOf(Date);
		});

		it('should return null when invalid `until` date is passed', () => {
			const result = util.expiresOn('invalid');

			expect(result).toBeNull();
		});

		it('should return null when `until` date below now is passed', () => {
			jest.useFakeTimers().setSystemTime(new Date('2024-12-21T22:29:42.000Z'));

			const since = new Date('2024-12-20T22:29:42.000Z');

			const result = util.expiresOn(since);

			expect(result).toBeNull();
		});

		it('should return a date between now and specified date', () => {
			jest.useFakeTimers().setSystemTime(new Date('2024-12-21T22:29:42.000Z'));

			const now = new Date();

			const until = new Date('2025-12-21T22:29:42.000Z');
			const result = util.expiresOn(until);

			expect(result?.getTime()).toBeGreaterThanOrEqual(now.getTime());
			expect(result?.getTime()).toBeLessThanOrEqual(until.getTime());
		});
	});
});
