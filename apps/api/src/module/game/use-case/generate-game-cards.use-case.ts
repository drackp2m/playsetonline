import { Injectable } from '@nestjs/common';

import { cardColors } from '../definition/card-color.enum';
import { CardProperties } from '../definition/card-properties.enum';
import { cardShadings } from '../definition/card-shading.enum';
import { cardShapes } from '../definition/card-shape.enum';

@Injectable()
export class GenerateGameCardsUseCase {
	execute(): string[] {
		const cards: string[] = [];

		cardShapes.forEach((_shapeValue, shapeKey) => {
			const shape = `:${CardProperties['shape']}${shapeKey}:`;

			cardColors.forEach((_colorValue, colorKey) => {
				let color = shape;

				color += `:${CardProperties['color']}${colorKey}:`;

				[1, 2, 3].forEach((numberKey) => {
					let number = color;

					number += `:${CardProperties['number']}${numberKey}:`;

					this.generateCardShadings(number, cards);
				});
			});
		});

		return cards;
	}

	private generateCardShadings(currentName: string, currentCardsArray: string[]): void {
		cardShadings.forEach((_shadingValue, shadingKey) => {
			let updatedName = currentName;

			updatedName += `:${CardProperties['shading']}${shadingKey}:`;

			currentCardsArray.push(updatedName);
		});
	}
}
