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

			expect(result).toStrictEqual(null);
		});

		it('should return null when `since` date above now is passed', () => {
			const since = new Date('8050-10-20');

			const result = util.createdAt(since.getTime());

			expect(result).toStrictEqual(null);
		});

		it('should return Date between now and `since` when `since` date below now is passed', () => {
			const now = new Date();
			const since = new Date('1731-10-20');

			const result = util.createdAt(since.getTime());

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

			expect(result).toStrictEqual(null);
		});

		it('should return null when `until` date below now is passed', () => {
			const since = new Date('2002-10-20');

			const result = util.expiresOn(since.getTime());

			expect(result).toStrictEqual(null);
		});

		it('should return a date between now and specified date', () => {
			const now = new Date();

			const until = new Date('8050-10-20');
			const result = util.expiresOn(until);

			expect(result?.getTime()).toBeGreaterThanOrEqual(now.getTime());
			expect(result?.getTime()).toBeLessThanOrEqual(until.getTime());
		});
	});
});
