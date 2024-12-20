/* eslint-disable max-lines */
import { Injectable, computed, inject } from '@angular/core';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { Card } from '../../../definition/card.interface';
import { AddCardsToBoardException } from '../error/add-cards-to-board.error';
import { OfflineGameEventType } from '../repository/offline-game/definition/offline-game-event-type.enum';
import { OfflineGameEvent } from '../repository/offline-game/definition/offline-game-event.interface';
import { OfflineGameSet } from '../repository/offline-game/definition/offline-game-set.interface';
import { OfflineGameStatus } from '../repository/offline-game/definition/offline-game-status.enum';
import { OfflineGame } from '../repository/offline-game/definition/offline-game.interface';
import { OfflineGameRepository } from '../repository/offline-game/offline-game.repository';
import { GameService } from '../service/game.service';

type GameOfflineStoreProps = {
	game: OfflineGame | null;
	selectedCards: Card[];
	sets: OfflineGameSet[];
	boardSet: Card[];
	isLoading: boolean;
};

const initialState: GameOfflineStoreProps = {
	game: null,
	selectedCards: [],
	sets: [],
	boardSet: [],
	isLoading: false,
};

@Injectable({
	providedIn: 'root',
})
export class GameOfflineStore extends signalStore(
	{ protectedState: false },
	withState(initialState),
) {
	private readonly gameService = inject(GameService);
	private readonly offlineGameRepository = inject(OfflineGameRepository);

	boardCards = computed(() => {
		const game = this.game();

		return game?.board_cards ?? [];
	});

	validSets = computed(() => {
		return this.sets().filter((set) => set.valid);
	});

	invalidSets = computed(() => {
		return this.sets().filter((set) => !set.valid);
	});

	cardsInDeck = computed(() => {
		const boardCards = this.boardCards();
		const validSets = this.validSets();

		return 81 - boardCards.length - validSets.length * 3;
	});

	constructor() {
		super();

		patchState(this, { isLoading: true });

		this.restoreInProgressGame();
	}

	async newGame(): Promise<void> {
		const boardCards = this.gameService.getNewCards([], 12);

		const game = await this.offlineGameRepository.setNewGame(boardCards);

		patchState(this, { ...initialState, game });

		this.searchSetOnBoard();
	}

	async selectCard(card: Card): Promise<void> {
		const game = this.game();

		if (null === game) {
			return;
		}

		const currentSelectedCards = this.selectedCards();
		const selectedCards = this.gameService.toggleCardSelection(card, currentSelectedCards);

		if (3 !== selectedCards.length) {
			patchState(this, { selectedCards });
		} else {
			patchState(this, { selectedCards: [] });

			const isSet = this.gameService.checkSet(selectedCards);

			if (isSet) {
				const boardCards = game.board_cards;
				const sets = this.validSets();
				const updatedBoardCards = this.gameService.getUpdatedBoardCards(
					boardCards,
					sets,
					selectedCards,
				);

				game.board_cards = updatedBoardCards;
				game.updated_at = new Date();

				await this.offlineGameRepository.set('offline_game', game.uuid, game);

				patchState(this, { game: { ...game } });

				this.searchSetOnBoard();
			}

			const selectedSet = await this.offlineGameRepository.setSelectedSet(
				game.uuid,
				selectedCards,
				isSet,
			);

			const sets = this.sets();

			patchState(this, {
				sets: [...sets, selectedSet],
			});

			const boardSet = this.boardSet();
			const cardsInDeck = this.cardsInDeck();

			if (0 === cardsInDeck && 0 === boardSet.length) {
				game.status = OfflineGameStatus.COMPLETED;

				this.offlineGameRepository.set('offline_game', game.uuid, game);

				patchState(this, { game: { ...game } });
			}
		}
	}

	async addCardsToBoard(): Promise<void> {
		const game = this.game();

		if (null === game) {
			return;
		}

		const boardSet = this.boardSet();
		const sets = this.sets();

		const boardCards = game.board_cards;
		const setCards = sets.map((set) => set.cards).flat();
		const boardHasSet = 0 < boardSet.length;
		const remainingCardsCount = 81 - boardCards.length - setCards.length;

		const revealedCards = [...boardCards, ...setCards];

		const uuid = crypto.randomUUID();
		const created_at = new Date();

		try {
			this.gameService.canAddCardsToBoard(boardHasSet, boardCards.length, remainingCardsCount);

			const newCards = this.gameService.getNewCards(revealedCards, 3);

			game.board_cards = [...boardCards, ...newCards];
			game.updated_at = new Date();

			const event: OfflineGameEvent = {
				uuid,
				game_uuid: game.uuid,
				type: OfflineGameEventType.ADD_CARDS,
				details: { cards: newCards, error: null },
				created_at,
			};

			await this.offlineGameRepository.beginTransaction(['offline_game', 'offline_game_event']);

			this.offlineGameRepository.set('offline_game', game.uuid, game);

			this.offlineGameRepository.set('offline_game_event', uuid, event);

			await this.offlineGameRepository.commitTransaction();

			patchState(this, { game: { ...game } });

			this.searchSetOnBoard();
		} catch (error) {
			if (error instanceof AddCardsToBoardException) {
				const event: OfflineGameEvent = {
					uuid,
					game_uuid: game.uuid,
					type: OfflineGameEventType.ADD_CARDS,
					details: { cards: [], error: error.typedError },
					created_at,
				};

				this.offlineGameRepository.set('offline_game_event', uuid, event);

				throw error;
			}
		}
	}

	private searchSetOnBoard(): void {
		const game = this.game();

		if (null === game) {
			return;
		}

		const boardCards = game.board_cards;
		const boardSet = this.gameService.searchSetOnBoard(boardCards);

		patchState(this, { boardSet });
	}

	private restoreInProgressGame(): void {
		this.offlineGameRepository.getInProgressGame().then((getInProgressGame) => {
			if (getInProgressGame !== undefined) {
				const [game, sets] = getInProgressGame;

				patchState(this, { game, sets });

				this.searchSetOnBoard();
			}

			patchState(this, { isLoading: false });
		});
	}
}
