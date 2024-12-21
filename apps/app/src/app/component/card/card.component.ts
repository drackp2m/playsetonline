import { Component, computed, input } from '@angular/core';

import { CardColor, CardShading, CardShape } from '@playsetonline/api-definitions';

import { CardShapeComponent } from '../card-shape/card-shape.component';

@Component({
	selector: 'app-card',
	templateUrl: './card.component.html',
	styleUrl: './card.component.scss',
	imports: [CardShapeComponent],
})
export class CardComponent {
	shape = input.required<CardShape>();
	color = input.required<CardColor>();
	shading = input.required<CardShading>();
	count = input.required<number>();

	selected = input(false);
	highlighted = input(false);
	vertical = input(false, {
		transform: (value: boolean | string) => ('string' === typeof value ? '' === value : value),
	});

	repetitions = computed(() => {
		const count = this.count();

		return Array.from({ length: count });
	});
}
