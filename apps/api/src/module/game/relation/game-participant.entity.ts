import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { GenerateNowDateUseCase } from '../../../shared/use-case/generate-now-date.use-case';
import { User } from '../../user/user.entity';
import { Game } from '../game.entity';

import { GameParticipantRepository } from './game-participant.repository';

@Entity({ repository: () => GameParticipantRepository })
export class GameParticipant {
	@ManyToOne({ entity: () => Game, primary: true, deleteRule: 'cascade' })
	game?: Game;

	@ManyToOne({ entity: () => User, primary: true, deleteRule: 'cascade' })
	user?: User;

	@Property()
	createdAt: Date = new GenerateNowDateUseCase().execute();

	constructor(init?: Partial<GameParticipant>) {
		if (init !== undefined) {
			Object.assign(this, init);
		}
	}
}
