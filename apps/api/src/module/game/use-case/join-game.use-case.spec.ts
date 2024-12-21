import { MikroORM } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/postgresql';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';

import { InternalServerErrorException } from '../../../shared/exception/internal-server-error.exception';
import { NotFoundException } from '../../../shared/exception/not-found.exception';
import { PreconditionFailedException } from '../../../shared/exception/precondition-failed.exception';
import { GenerateNowDateUseCase } from '../../../shared/use-case/generate-now-date.use-case';
import { UserFaker } from '../../user/factory/user.faker';
import { GameStatus } from '../definition/game-status.enum';
import { GameFaker } from '../factory/game.faker';
import { Game } from '../game.entity';
import { GameRepository } from '../game.repository';
import { GameParticipant } from '../relation/game-participant.entity';
import { GameParticipantRepository } from '../relation/game-participant.repository';

import { JoinGameUseCase } from './join-game.use-case';

describe('JoinGameUseCase', () => {
	let useCase: JoinGameUseCase;
	const gameRepository = mock<GameRepository>();
	const gameParticipantRepository = mock<GameParticipantRepository>();

	jest.spyOn(GenerateNowDateUseCase.prototype, 'execute').mockReturnValue(new Date());

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
				JoinGameUseCase,
				{ provide: GameRepository, useValue: gameRepository },
				{ provide: GameParticipantRepository, useValue: gameParticipantRepository },
			],
		}).compile();

		useCase = await module.resolve(JoinGameUseCase);
	});

	it('should be defined', () => {
		expect(useCase).toBeDefined();
	});

	describe('execute', () => {
		it('should throw PreconditionFailedException when current Game exists', () => {
			const fakeGame = GameFaker.makeOne();
			const fakeUser = UserFaker.makeOne();

			gameRepository.getOne
				.calledWith(
					expect.objectContaining({
						participants: { uuid: fakeUser.uuid },
						status: { $in: [GameStatus.waitingOpponents, GameStatus.inProgress] },
					}),
				)
				.mockResolvedValueOnce(fakeGame);

			const game = useCase.execute(fakeGame.uuid, fakeUser);

			expect(game).rejects.toThrow(PreconditionFailedException);
			expect(game).rejects.toMatchObject({ response: { user: 'already in a game' } });

			expect(gameRepository.getOne).toHaveBeenCalledTimes(2);
			expect(gameRepository.getOne).toHaveBeenNthCalledWith(1, {
				participants: { uuid: fakeUser.uuid },
				status: { $in: [GameStatus.waitingOpponents, GameStatus.inProgress] },
			});
			expect(gameRepository.getOne).toHaveBeenNthCalledWith(2, {
				uuid: fakeGame.uuid,
			});
		});

		it('should throw NotFoundException when target Game not exists', () => {
			const fakeGame = GameFaker.makeOne();
			const fakeUser = UserFaker.makeOne();

			gameRepository.getOne
				.calledWith(
					expect.objectContaining({
						participants: { uuid: fakeUser.uuid },
						status: { $in: [GameStatus.waitingOpponents, GameStatus.inProgress] },
					}),
				)
				.mockRejectedValueOnce(new NotFoundException('not exists', 'game'));

			gameRepository.getOne
				.calledWith(
					expect.objectContaining({
						uuid: fakeGame.uuid,
					}),
				)
				.mockRejectedValueOnce(new NotFoundException('not exists', 'game'));

			const game = useCase.execute(fakeGame.uuid, fakeUser);

			expect(game).rejects.toThrow(NotFoundException);
			expect(game).rejects.toMatchObject({ response: { game: 'not exists' } });

			expect(gameRepository.getOne).toHaveBeenCalledTimes(2);
			expect(gameRepository.getOne).toHaveBeenNthCalledWith(1, {
				participants: { uuid: fakeUser.uuid },
				status: { $in: [GameStatus.waitingOpponents, GameStatus.inProgress] },
			});
			expect(gameRepository.getOne).toHaveBeenNthCalledWith(2, {
				uuid: fakeGame.uuid,
			});
		});

		it('should throw InternalServerErrorException when insert fails', async () => {
			const fakeGame = GameFaker.makeOne();
			const fakeUser = UserFaker.makeOne();
			const fakeGameParticipant = new GameParticipant({
				game: fakeGame,
				user: fakeUser,
			});

			gameRepository.getOne
				.calledWith(
					expect.objectContaining({
						participants: { uuid: fakeUser.uuid },
						status: { $in: [GameStatus.waitingOpponents, GameStatus.inProgress] },
					}),
				)
				.mockRejectedValueOnce(new NotFoundException('not exists', 'game'));

			gameRepository.getOne
				.calledWith(
					expect.objectContaining({
						uuid: fakeGame.uuid,
					}),
				)
				.mockResolvedValueOnce(fakeGame);

			gameParticipantRepository.insert.mockRejectedValueOnce(new Error('insert failed'));

			const game = useCase.execute(fakeGame.uuid, fakeUser);

			await expect(game).rejects.toThrow(InternalServerErrorException);
			expect(game).rejects.toMatchObject({ response: 'insert failed' });

			expect(gameRepository.getOne).toHaveBeenCalledTimes(2);
			expect(gameRepository.getOne).toHaveBeenNthCalledWith(1, {
				participants: { uuid: fakeUser.uuid },
				status: { $in: [GameStatus.waitingOpponents, GameStatus.inProgress] },
			});
			expect(gameRepository.getOne).toHaveBeenNthCalledWith(2, {
				uuid: fakeGame.uuid,
			});

			expect(gameParticipantRepository.insert).toHaveBeenCalledTimes(1);
			expect(gameParticipantRepository.insert).toHaveBeenCalledWith(fakeGameParticipant);
		});

		it('should return game when insert works', async () => {
			const fakeGame = GameFaker.makeOne();
			const fakeUser = UserFaker.makeOne();
			const fakeGameParticipant = new GameParticipant({
				game: fakeGame,
				user: fakeUser,
			});

			gameRepository.getOne
				.calledWith(
					expect.objectContaining({
						participants: { uuid: fakeUser.uuid },
						status: { $in: [GameStatus.waitingOpponents, GameStatus.inProgress] },
					}),
				)
				.mockRejectedValueOnce(new NotFoundException('not exists', 'game'));

			gameRepository.getOne
				.calledWith(
					expect.objectContaining({
						uuid: fakeGame.uuid,
					}),
				)
				.mockResolvedValueOnce(fakeGame);

			gameParticipantRepository.insert.mockResolvedValueOnce(fakeGameParticipant);

			const game = await useCase.execute(fakeGame.uuid, fakeUser);

			expect(game).toBeInstanceOf(Game);
			expect(game).toBe(fakeGameParticipant.game);

			expect(gameRepository.getOne).toHaveBeenCalledTimes(2);
			expect(gameRepository.getOne).toHaveBeenNthCalledWith(1, {
				participants: { uuid: fakeUser.uuid },
				status: { $in: [GameStatus.waitingOpponents, GameStatus.inProgress] },
			});
			expect(gameRepository.getOne).toHaveBeenNthCalledWith(2, {
				uuid: fakeGame.uuid,
			});

			expect(gameParticipantRepository.insert).toHaveBeenCalledTimes(1);
			expect(gameParticipantRepository.insert).toHaveBeenCalledWith(fakeGameParticipant);
		});
	});
});
