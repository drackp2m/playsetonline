/* eslint-disable max-lines */
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { confetti } from '@tsparticles/confetti';

import { CardColor, CardShape } from '@playsetonline/api-definitions';

import { CardComponent } from '../../component/card/card.component';
import { Card } from '../../definition/card.interface';

import { YouWonComponent } from './component/you-won/you-won.component';
import {
	AddCardsToBoardException,
	addCardsToBoardErrorMessage,
} from './error/add-cards-to-board.error';
import { OfflineGameEventType } from './repository/offline-game/definition/offline-game-event-type.enum';
import { OfflineGameEvent } from './repository/offline-game/definition/offline-game-event.interface';
import { OfflineGameStatus } from './repository/offline-game/definition/offline-game-status.enum';
import { OfflineGameRepository } from './repository/offline-game/offline-game.repository';
import { GameOfflineStore } from './store/game-offline.store';

@Component({
	templateUrl: './game.page.html',
	styleUrl: './game.page.scss',
	imports: [CardComponent, YouWonComponent, RouterLink],
})
export class GamePage {
	private readonly gameOfflineStore = inject(GameOfflineStore);
	private readonly activatedRoute = inject(ActivatedRoute);
	private readonly offlineGameRepository = inject(OfflineGameRepository);

	private highlightInterval?: number;

	readonly boardCards = this.gameOfflineStore.boardCards;
	readonly validSets = this.gameOfflineStore.validSets;
	readonly invalidSets = this.gameOfflineStore.invalidSets;
	readonly cardsInDeck = this.gameOfflineStore.cardsInDeck;
	readonly selectedCards = this.gameOfflineStore.selectedCards;
	readonly gameCompleted = computed(() => {
		const game = this.gameOfflineStore.game();

		return (game?.status ?? OfflineGameStatus.COMPLETED) === OfflineGameStatus.COMPLETED;
	});

	readonly boardSet = this.gameOfflineStore.boardSet;
	readonly showSets = signal<number>(0);
	readonly message = signal<string>('');

	private readonly activatedRouteData = toSignal(this.activatedRoute.data);
	readonly avoidStatusBar = computed(() => this.activatedRouteData()?.['avoidStatusBar']);

	constructor() {
		effect(() => {
			const game = this.gameOfflineStore.game();

			if (null === game || game.status === OfflineGameStatus.COMPLETED) {
				this.startConfetti();
			}
		});
	}

	newGame(): void {
		this.gameOfflineStore.newGame();
	}

	cheatGame(): void {
		this.newGame();
		const remainingCardsInDeck = 3;

		for (let i = 0; i < (81 - this.boardCards().length - remainingCardsInDeck) / 3; i++) {
			const boardSet = this.boardSet();

			if (0 === boardSet.length) {
				this.addCardsToBoard();
			}

			const [firstCard, secondCard, thirdCard] = boardSet;
			const allCardsAreDefined =
				firstCard !== undefined && secondCard !== undefined && thirdCard !== undefined;

			if (allCardsAreDefined) {
				this.selectCard(firstCard);
				this.selectCard(secondCard);
				this.selectCard(thirdCard);
			}
		}
	}

	selectCard(card: Card): void {
		this.gameOfflineStore.selectCard(card);
	}

	highlightSet(): void {
		// FixMe => translate this logic to the store, and prevent highlightSet where set are selected
		const game = this.gameOfflineStore.game();
		const boardSet = this.boardSet();
		const showSets = this.showSets();

		if (0 !== showSets) {
			return;
		}

		if (0 === boardSet.length) {
			this.showMessages('There are no sets on the board.');

			return;
		}

		if (null !== game) {
			const uuid = crypto.randomUUID();
			const event: OfflineGameEvent = {
				uuid,
				game_uuid: game.uuid,
				type: OfflineGameEventType.ASK_FOR_HELP,
				created_at: new Date(),
			};

			this.offlineGameRepository.set('offline_game_event', uuid, event);
		}

		this.showSets.set(6);

		this.highlightInterval = window.setInterval(() => {
			const showSets = this.showSets() - 1;

			this.showSets.set(showSets);

			if (0 === showSets) {
				clearInterval(this.highlightInterval);
			}
		}, 300);
	}

	addCardsToBoard(): void {
		this.gameOfflineStore.addCardsToBoard().catch((error) => {
			if (error instanceof AddCardsToBoardException) {
				const errorMessage = addCardsToBoardErrorMessage.get(error.typedError);

				if (errorMessage !== undefined) {
					this.showMessages(errorMessage);
				}
			}
		});
	}

	private showMessages(text: string): void {
		this.message.set(text);

		setTimeout(() => {
			this.message.set('');
		}, text.length * 100);
	}

	private startConfetti(): void {
		confetti('confetti', {
			shapes: ['image'],
			shapeOptions: {
				image: [
					this.getConfettiShapeConfig(CardShape.OVAL, CardColor.RED),
					this.getConfettiShapeConfig(CardShape.OVAL, CardColor.PURPLE),
					this.getConfettiShapeConfig(CardShape.OVAL, CardColor.GREEN),
					this.getConfettiShapeConfig(CardShape.SQUIGGLE, CardColor.RED),
					this.getConfettiShapeConfig(CardShape.SQUIGGLE, CardColor.PURPLE),
					this.getConfettiShapeConfig(CardShape.SQUIGGLE, CardColor.GREEN),
					this.getConfettiShapeConfig(CardShape.DIAMOND, CardColor.RED),
					this.getConfettiShapeConfig(CardShape.DIAMOND, CardColor.PURPLE),
					this.getConfettiShapeConfig(CardShape.DIAMOND, CardColor.GREEN),
				],
			},
			count: 500, // number of confetti particles; default: 50
			angle: 90, // angle of the burst; default: 90
			spread: 180, // spread of confetti particles in degrees; default 45, try 360 for fun
			ticks: 10, // time until confetti disappears; default: 200
			drift: 5, // random drift of confetti particles; default: 0
			gravity: 0.8,
			origin: {
				x: 0.5,
				y: 0,
			},
		});
	}

	private getConfettiShapeConfig(shape: CardShape, color: CardColor) {
		let width;
		let height;

		switch (shape) {
			case CardShape.OVAL:
				width = 54;
				height = 111;
				break;
			case CardShape.DIAMOND:
				width = 57;
				height = 116;
				break;
			case CardShape.SQUIGGLE:
				width = 52;
				height = 105;
				break;
		}

		const shapeName = this.getEnumKeyByValue(CardShape, shape)?.toLocaleLowerCase();
		const cardColor = this.getEnumKeyByValue(CardColor, color)?.toLocaleLowerCase();

		return {
			src: `icons/${shapeName}-solid-${cardColor}.png`,
			width,
			height,
			particles: {
				size: {
					value: 4,
				},
			},
		};
	}

	private getEnumKeyByValue<T extends { [key: string]: string | number }>(
		enumType: T,
		value: T[keyof T],
	): keyof T | undefined {
		return Object.keys(enumType).find((key) => enumType[key] === value);
	}
}
