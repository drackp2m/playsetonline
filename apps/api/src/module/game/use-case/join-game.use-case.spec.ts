import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';

import { GameRepository } from '../game.repository';
import { GameParticipantRepository } from '../relations/game-participant.repository';

import { CreateGameUseCase } from './create-game.use-case';

describe('CreateGameUseCase', () => {
	let useCase: CreateGameUseCase;
	const gameRepository = mock<GameRepository>();
	const gameParticipantRepository = mock<GameParticipantRepository>();

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [MikroOrmModule.forRoot()],
			providers: [
				CreateGameUseCase,
				{ provide: GameRepository, useValue: gameRepository },
				{ provide: GameParticipantRepository, useValue: gameParticipantRepository },
			],
		}).compile();

		useCase = await module.resolve<CreateGameUseCase>(CreateGameUseCase);
	});

	it('should be defined', () => {
		expect(useCase).toBeDefined();
	});

	describe('execute', () => {
		// it('should throw PreconditionFailedException when GameRepository.getOne returns value', async () => {
		// 	const fakeGame = GameFaker.makeOne();
		// 	const fakeUser = UserFaker.makeOne();
		// 	gameRepository.getOne.mockResolvedValueOnce(fakeGame);
		// 	const game = useCase.execute(fakeUser);
		// 	expect(game).rejects.toThrow(PreconditionFailedException);
		// 	expect(game).rejects.toMatchObject({ response: { user: 'already in a game' } });
		// 	expect(gameRepository.getOne).toBeCalledTimes(1);
		// 	expect(gameRepository.getOne).toBeCalledWith({
		// 		participants: { uuid: fakeUser.uuid },
		// 	});
		// });
	});
});