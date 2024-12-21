import { MikroORM } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/postgresql';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';

import { NotFoundException } from '../../../shared/exception/not-found.exception';
import { PreconditionFailedException } from '../../../shared/exception/precondition-failed.exception';
import { GenerateNowDateUseCase } from '../../../shared/use-case/generate-now-date.use-case';
import { GenerateUuidUseCase } from '../../../shared/use-case/generate-uuid.use-case';
import { ShuffleArrayUseCase } from '../../../shared/use-case/shuffle-array.use-case';
import { EditableDate } from '../../../shared/util/editable-date';
import { UserFaker } from '../../user/factory/user.faker';
import { GameFaker } from '../factory/game.faker';
import { Game } from '../game.entity';
import { GameRepository } from '../game.repository';
import { GameParticipant } from '../relation/game-participant.entity';
import { GameParticipantRepository } from '../relation/game-participant.repository';

import { CreateGameUseCase } from './create-game.use-case';
import { GenerateGameCardsUseCase } from './generate-game-cards.use-case';

describe('CreateGameUseCase', () => {
	let useCase: CreateGameUseCase;
	const gameRepository = mock<GameRepository>();
	const gameParticipantRepository = mock<GameParticipantRepository>();

	beforeAll(async () => {
		MikroORM.initSync(
			defineConfig({
				dbName: ':memory:',
				entities: [Game, GameParticipant],
				dynamicImportProvider: (id) => import(id),
			}),
		);

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CreateGameUseCase,
				GenerateGameCardsUseCase,
				ShuffleArrayUseCase,
				{
					provide: GameRepository,
					useValue: gameRepository,
				},
				{
					provide: GameParticipantRepository,
					useValue: gameParticipantRepository,
				},
			],
		}).compile();

		useCase = await module.resolve(CreateGameUseCase);
	});

	it('should be defined', () => {
		expect(useCase).toBeDefined();
	});

	describe('execute', () => {
		it('should throw PreconditionFailedException when GameRepository.getOne returns value', async () => {
			const fakeGame = GameFaker.makeOne();
			const fakeUser = UserFaker.makeOne();

			gameRepository.getOne.mockResolvedValueOnce(fakeGame);

			const game = useCase.execute(fakeUser);

			expect(game).rejects.toThrow(PreconditionFailedException);
			expect(game).rejects.toMatchObject({ response: { user: 'already in a game' } });

			expect(gameRepository.getOne).toHaveBeenCalledTimes(1);
			expect(gameRepository.getOne).toHaveBeenCalledWith({
				participants: { uuid: fakeUser.uuid },
			});
		});

		it('should return Game instance with specified Participant', async () => {
			const fakeUuid = 'f858b7c7-a260-4760-b6e3-b90e66557d3c';
			jest.spyOn(GenerateUuidUseCase.prototype, 'execute').mockReturnValue(fakeUuid);

			const fakeDate = new EditableDate();
			jest.spyOn(GenerateNowDateUseCase.prototype, 'execute').mockReturnValue(fakeDate);

			const expiresOn = new EditableDate(fakeDate).edit('day', 1);

			const fakeGame = GameFaker.makeOne({
				uuid: fakeUuid,
				tableCards: ['a', 'b', 'c'],
				deckCards: ['d', 'e', 'f'],
				expiresOn,
				createdAt: fakeDate,
				updatedAt: fakeDate,
			});
			const fakeUser = UserFaker.makeOne();

			fakeGame.participants.add(fakeUser);

			const participant = new GameParticipant({ game: fakeGame, user: fakeUser });

			gameRepository.getOne.mockRejectedValueOnce(new NotFoundException());
			gameParticipantRepository.insert.mockResolvedValueOnce(participant);

			const game = await useCase.execute(fakeUser);

			expect(game).toBeInstanceOf(Game);
			expect(game.participants).toContain(fakeUser);

			expect(gameRepository.getOne).toHaveBeenCalledTimes(1);
			expect(gameRepository.getOne).toHaveBeenCalledWith({
				participants: { uuid: fakeUser.uuid },
			});

			expect(gameParticipantRepository.insert).toHaveBeenCalledTimes(1);
			expect(gameParticipantRepository.insert).toHaveBeenCalledWith(participant);
		});
	});
});
