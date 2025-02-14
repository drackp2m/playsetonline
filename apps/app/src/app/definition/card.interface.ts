import { CardColor, CardShading, CardShape } from '@playsetonline/api-definitions';

export interface Card {
	id: string;
	shape: CardShape;
	color: CardColor;
	shading: CardShading;
	number: number;
}
