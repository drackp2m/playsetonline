import { Injectable } from '@nestjs/common';

import { PreconditionFailedException } from '../../../shared/exception/precondition-failed.execption';
import { UserEntity } from '../../user/user.entity';
import { GameEntity } from '../game.entity';
import { GameRepository } from '../game.repository';

@Injectable()
export class CreateGameUseCase {
	constructor(private readonly gameRepository: GameRepository) {}

	async execute(participant: UserEntity): Promise<GameEntity> {
		const existingGame = await this.gameRepository.getOne({
			participants: { uuid: participant.uuid },
		});

		if (existingGame) {
			throw new PreconditionFailedException('already in a game', 'user');
		}

		const expiresOnDate = new Date();
		expiresOnDate.setDate(expiresOnDate.getDate() + 1);

		const newGame = new GameEntity({
			tableCards: ['a', 'b', 'c'],
			deckCards: ['d', 'e', 'f'],
			expiresOn: expiresOnDate,
		});

		newGame.participants.add(participant);

		return this.gameRepository.insert(newGame);
	}
}