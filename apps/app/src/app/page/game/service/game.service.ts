import { Injectable } from '@angular/core';

import { CardColor, CardShading, CardShape } from '@playsetonline/api-definitions';
import { randomNumberBetween } from '@playsetonline/lib';

import { Card } from '../../../definition/card.interface';
import { AddCardsToBoardError, AddCardsToBoardException } from '../error/add-cards-to-board.error';
import { OfflineGameSet } from '../repository/offline-game/definition/offline-game-set.interface';

@Injectable({
	providedIn: 'root',
})
export class GameService {
	getNewCards(revealedCards: Card[], quantity: number): Card[] {
		const cardsToReturn: Card[] = [];

		for (let i = 0; i < quantity; i++) {
			cardsToReturn.push(this.getValidCard([...revealedCards, ...cardsToReturn]));
		}

		return cardsToReturn;
	}

	toggleCardSelection(card: Card, selectedCards: Card[]): Card[] {
		if (selectedCards.includes(card)) {
			return selectedCards.filter((c) => c !== card);
		} else {
			return [...selectedCards, card];
		}
	}

	checkSet(selectedCards: Card[]): boolean {
		const [firstCard, secondCard, thirdCard] = selectedCards;
		const allCardsAreDefined =
			firstCard !== undefined && secondCard !== undefined && thirdCard !== undefined;

		const result = allCardsAreDefined && this.isSet(firstCard, secondCard, thirdCard);

		return result;
	}

	// FixMe: replace with fillBoardGaps (nulls) on big board (more than 12 cards)
	getUpdatedBoardCards(
		boardCards: Card[],
		setCards: OfflineGameSet[],
		selectedCards: Card[],
	): Card[] {
		const flatSetCards = setCards
			.filter((set) => set.valid)
			.map((set) => set.cards)
			.flat();

		const removeCards = 12 < boardCards.length || 81 === flatSetCards.length + boardCards.length;

		let updatedBoardCards = boardCards;

		selectedCards.forEach((card) => {
			const newCard = removeCards ? null : this.getValidCard(updatedBoardCards);
			updatedBoardCards = this.replaceCard(updatedBoardCards, card, newCard);
		});

		return updatedBoardCards;
	}

	searchSetOnBoard(boardCards: Card[]): Card[] {
		for (let i = 0; i < boardCards.length - 2; i++) {
			for (let j = i + 1; j < boardCards.length - 1; j++) {
				for (let k = j + 1; k < boardCards.length; k++) {
					const firstCard = boardCards[i];
					const secondCard = boardCards[j];
					const thirdCard = boardCards[k];

					const allCardsAreDefined =
						firstCard !== undefined && secondCard !== undefined && thirdCard !== undefined;

					if (allCardsAreDefined && this.isSet(firstCard, secondCard, thirdCard)) {
						return [firstCard, secondCard, thirdCard];
					}
				}
			}
		}

		return [];
	}

	canAddCardsToBoard(
		boardHasSet: boolean,
		boardCardsCount: number,
		remainingCardsCount: number,
	): boolean {
		if (0 === remainingCardsCount) {
			throw new AddCardsToBoardException(AddCardsToBoardError.DECK_EMPTY);
		} else if (15 <= boardCardsCount) {
			throw new AddCardsToBoardException(AddCardsToBoardError.ALREADY_ADDED);
		} else if (boardHasSet) {
			throw new AddCardsToBoardException(AddCardsToBoardError.HAS_SET);
		} else {
			return true;
		}
	}

	private replaceCard(boardCards: Card[], currentCard: Card, newCard: Card | null): Card[] {
		return boardCards
			.map((card) => (card.id === currentCard.id ? newCard : card))
			.filter((c) => null !== c) as Card[];
	}

	private isSet(first: Card, second: Card, third: Card): boolean {
		return (
			this.isSameOrDifferent(first.shape, second.shape, third.shape) &&
			this.isSameOrDifferent(first.color, second.color, third.color) &&
			this.isSameOrDifferent(first.shading, second.shading, third.shading) &&
			this.isSameOrDifferent(first.number, second.number, third.number)
		);
	}

	private isSameOrDifferent(first: unknown, second: unknown, third: unknown): boolean {
		return (
			(first === second && second === third) ||
			(first !== second && second !== third && third !== first)
		);
	}

	private getValidCard(cardsToAvoid: Card[]): Card {
		let card = this.generateCard();

		while (cardsToAvoid.find((c) => c.id === card.id)) {
			card = this.generateCard();
		}

		return card;
	}

	private generateCard(): Card {
		const shape = this.randomEnum(CardShape);
		const color = this.randomEnum(CardColor);
		const shading = this.randomEnum(CardShading);
		const number = randomNumberBetween(1, 3);
		const id = `a${shape}b${color}c${shading}d${number}`;

		return { id, shape, color, shading, number };
	}

	// FixMe => move this to lib
	private randomEnum<T extends object>(enumInstance: T): T[keyof T] {
		const enumKeys = this.getEnumKeys(enumInstance);

		const firstEnumKey = enumKeys[0];

		if (firstEnumKey === undefined) {
			throw new Error('Enum is empty');
		}

		const randomIndex = randomNumberBetween(0, enumKeys.length - 1);
		const randomEnumKey = enumKeys[randomIndex ?? 0];

		const enumKey = randomEnumKey ?? firstEnumKey;

		return enumInstance[enumKey];
	}

	// FixMe => move this to lib
	private getEnumKeys<T extends object>(enumInstance: T): Array<keyof T> {
		const enumKeys = Object.keys(enumInstance) as Array<keyof T>;

		if (0 !== enumKeys.length % 2) {
			return enumKeys;
		}

		let isBasicEnum = true;
		const enumValues = Object.values(enumInstance);

		for (let index = 0; index < enumKeys.length / 2; index++) {
			if (enumKeys[enumKeys.length / 2 + index] !== enumValues[index]) {
				isBasicEnum = false;
			}
		}

		return isBasicEnum ? enumKeys.slice(enumKeys.length / 2) : enumKeys;
	}
}
