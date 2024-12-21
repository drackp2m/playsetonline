import { Test, TestingModule } from '@nestjs/testing';

import { ShuffleArrayUseCase } from './shuffle-array.use-case';

describe('ShuffleArrayUseCase', () => {
	type NewType = ShuffleArrayUseCase;

	let useCase: NewType;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ShuffleArrayUseCase],
		}).compile();

		useCase = await module.resolve(ShuffleArrayUseCase);
	});

	it('should be defined', () => {
		expect(useCase).toBeDefined();
	});

	describe('execute', () => {
		it('should return a valid v4 uuid', () => {
			const originalArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
			const shuffledArray = useCase.execute(originalArray);

			expect(shuffledArray).toHaveLength(10);
			expect([...shuffledArray].sort((a, b) => a - b)).toStrictEqual(originalArray);
		});
	});
});
