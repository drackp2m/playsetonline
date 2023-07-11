/* eslint-disable max-lines */
import { Component, OnInit } from '@angular/core';

import { CardColorEnum, CardShadingEnum, CardShapeEnum } from '@set-online/api-definitions';

import { CardInterface } from '../../shared/definitions/card.interface';

@Component({
	templateUrl: './game.page.html',
	styleUrls: ['./game.page.scss'],
})
export default class GamePage implements OnInit {
	private readonly shapes: (keyof typeof CardShapeEnum)[] = ['oval', 'squiggle', 'diamond'];
	private readonly colors: (keyof typeof CardColorEnum)[] = ['red', 'purple', 'green'];
	private readonly shadings: (keyof typeof CardShadingEnum)[] = ['solid', 'striped', 'outlined'];
	private readonly counts: number[] = [1, 2, 3];

	boardCards: CardInterface[] = [];

	sets: CardInterface[] = [];

	cardsInSets: CardInterface[] = [];

	selectedCards: CardInterface[] = [];

	wrongSetsCount = 0;

	showSets = false;

	message = '';

	ngOnInit(): void {
		for (let i = 0; i < 12; i++) {
			this.boardCards.push(this.getValidCard());
		}

		this.checkIfSetExists();
	}

	isSelected(card: CardInterface): boolean {
		return this.selectedCards.includes(card);
	}

	selectCard(card: CardInterface): void {
		if (this.selectedCards.includes(card)) {
			this.selectedCards = this.selectedCards.filter((c) => c !== card);
		} else {
			this.selectedCards.push(card);
		}

		this.checkSet();
	}

	imInSet(card: CardInterface): boolean {
		return this.cardsInSets.includes(card);
	}

	checkIfSetExists(): void {
		const cards = this.boardCards;

		this.cardsInSets = [];

		for (let i = 0; i < cards.length - 2; i++) {
			for (let j = i + 1; j < cards.length - 1; j++) {
				for (let k = j + 1; k < cards.length; k++) {
					if (this.isSet(cards[i], cards[j], cards[k])) {
						// this.cardsInSets.push(cards[i], cards[j], cards[k]);
						this.cardsInSets = [cards[i], cards[j], cards[k]];
					}
				}
			}
		}

		if (this.sets.length + this.boardCards.length === 81 && this.cardsInSets.length === 0) {
			this.showMessages('You won!');
		}
	}

	addExtraCards(): void {
		if (this.boardCards.length >= 15) {
			this.showMessages('You can only add extra cards once per game!');

			return;
		}

		if (this.cardsInSets.length > 0) {
			this.showMessages('Yes there is, keep looking.');

			return;
		}

		for (let i = 0; i < 3; i++) {
			this.boardCards.push(this.getValidCard());
		}

		this.checkIfSetExists();
	}

	toggleShowSets(): void {
		this.showSets = !this.showSets;
	}

	private getValidCard(): CardInterface {
		const currentCards = [...this.boardCards, ...this.sets];

		let card = this.generateCard();

		while (currentCards.find((c) => c.id === card.id)) {
			card = this.generateCard();
		}

		return card;
	}

	private generateCard(): CardInterface {
		const shape = this.getRandomShape();
		const color = this.getRandomColor();
		const shading = this.getRandomShading();
		const number = this.getRandomNumber();
		const id = `${CardShadingEnum[shading]}${CardColorEnum[color]}${CardShapeEnum[shape]}${number}`;

		return { id, shape, color, shading, number };
	}

	private getRandomShape(): keyof typeof CardShapeEnum {
		return this.shapes[Math.floor(Math.random() * this.shapes.length)];
	}

	private getRandomColor(): keyof typeof CardColorEnum {
		return this.colors[Math.floor(Math.random() * this.colors.length)];
	}

	private getRandomShading(): keyof typeof CardShadingEnum {
		return this.shadings[Math.floor(Math.random() * this.shadings.length)];
	}

	private getRandomNumber(): number {
		return this.counts[Math.floor(Math.random() * this.counts.length)];
	}

	private checkSet(): void {
		if (this.selectedCards.length !== 3) {
			return;
		}

		const [first, second, third] = this.selectedCards;

		if (this.isSet(first, second, third)) {
			this.sets.push(...this.selectedCards);

			const removeCards =
				this.boardCards.length > 12 || this.sets.length + this.boardCards.length > 81;

			this.selectedCards.forEach((card) => {
				const newCard = removeCards ? null : this.getValidCard();
				this.replaceCard(card, newCard);
			});

			this.selectedCards = [];

			this.checkIfSetExists();

			return;
		}

		this.wrongSetsCount++;

		this.selectedCards = [];
	}

	private isSet(first: CardInterface, second: CardInterface, third: CardInterface): boolean {
		return (
			this.isSameOrDifferent<keyof typeof CardShapeEnum>(first.shape, second.shape, third.shape) &&
			this.isSameOrDifferent<keyof typeof CardColorEnum>(first.color, second.color, third.color) &&
			this.isSameOrDifferent<keyof typeof CardShadingEnum>(
				first.shading,
				second.shading,
				third.shading,
			) &&
			this.isSameOrDifferent<number>(first.number, second.number, third.number)
		);
	}

	private isSameOrDifferent<T>(first: T, second: T, third: T): boolean {
		return (
			(first === second && second === third) ||
			(first !== second && second !== third && first !== third)
		);
	}

	private replaceCard(card: CardInterface, replace: CardInterface | null): void {
		this.boardCards = this.boardCards
			.map((c) => {
				if (c.id === card.id) {
					return replace;
				}

				return c;
			})
			.filter((c) => c !== null) as CardInterface[];
	}

	private showMessages(text: string): void {
		this.message = text;
		setTimeout(() => {
			this.message = '';
		}, text.length * 100);
	}
}