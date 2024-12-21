import { Injectable } from '@nestjs/common';

import { NotFoundException } from '../../../shared/exception/not-found.exception';
import { PreconditionFailedException } from '../../../shared/exception/precondition-failed.exception';
import { ShuffleArrayUseCase } from '../../../shared/use-case/shuffle-array.use-case';
import { EditableDate } from '../../../shared/util/editable-date';
import { User } from '../../user/user.entity';
import { Game } from '../game.entity';
import { GameRepository } from '../game.repository';
import { GameParticipant } from '../relation/game-participant.entity';
import { GameParticipantRepository } from '../relation/game-participant.repository';

import { GenerateGameCardsUseCase } from './generate-game-cards.use-case';

@Injectable()
export class CreateGameUseCase {
	constructor(
		private readonly generateGameCardsUseCase: GenerateGameCardsUseCase,
		private readonly shuffleArrayUseCase: ShuffleArrayUseCase,
		private readonly gameRepository: GameRepository,
		private readonly gameParticipantRepository: GameParticipantRepository,
	) {}

	async execute(participant: User): Promise<Game> {
		try {
			await this.gameRepository.getOne({
				participants: { uuid: participant.uuid },
			});
		} catch (error) {
			if (error instanceof NotFoundException) {
				// FixMe => add try catch in current catch? Hmmm...
				const expiresOn = new EditableDate().edit('day', 1);

				const gameCards = this.generateGameCardsUseCase.execute();
				const shuffledGameCards = this.shuffleArrayUseCase.execute(gameCards);

				shuffledGameCards.reverse();

				const newGame = new Game({
					tableCards: ['a', 'b', 'c'],
					deckCards: ['d', 'e', 'f'],
					expiresOn,
				});

				const gameParticipant = new GameParticipant({ game: newGame, user: participant });

				await this.gameParticipantRepository.insert(gameParticipant);

				newGame.participants.add(participant);

				return newGame;
			}
		}

		throw new PreconditionFailedException('already in a game', 'user');
	}
}
