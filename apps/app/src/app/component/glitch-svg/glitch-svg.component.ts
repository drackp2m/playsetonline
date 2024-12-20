import { NgStyle } from '@angular/common';
import { Component, OnInit, computed, input } from '@angular/core';

import { randomNumberBetween } from '@playsetonline/lib/generator/random-number-between';

@Component({
	selector: 'app-glitch-svg',
	templateUrl: './glitch-svg.component.html',
	styleUrl: './glitch-svg.component.scss',
	imports: [NgStyle],
})
export class GlitchSvgComponent implements OnInit {
	readonly svgPath = input.required<string>();
	readonly imgAlt = input.required<string>();
	readonly maskPath = input<string>();
	readonly offset = input<number>(2);
	readonly duration = input<number>(1);

	readonly maskUrl = computed(() => {
		const svgUrl = this.svgPath();
		const maskUrl = this.maskPath();

		return `url(${maskUrl ?? svgUrl})`;
	});

	private readonly glitchSteps = 14;
	readonly framesCssVariables = new Map<string, number>();

	ngOnInit(): void {
		this.addDurationCssVariable();
		this.addFpsCssVariable();
		this.addGlitchEffectCssVariables();

		setInterval(() => {
			this.addGlitchEffectCssVariables();
		}, this.duration() * 2000);
	}

	private getRandomNumber(max: number): number {
		return randomNumberBetween(0, max);
	}

	private addCssVariable(name: string, value: number): void {
		this.framesCssVariables.set(`--${name}`, value);
	}

	private addDurationCssVariable(): void {
		const duration = this.duration();

		this.addCssVariable('glitch-duration', duration);
	}

	private addFpsCssVariable(): void {
		const fps = this.duration();

		this.addCssVariable('glitch-fps', fps);
	}

	private addGlitchEffectCssVariables(): void {
		for (let i = 0; i <= this.glitchSteps; i++) {
			const leftTop = this.getRandomNumber(100);
			const leftBottom = this.getRandomNumber(100 - leftTop);
			// const leftTop = 20;
			// const leftBottom = 55;

			this.addCssVariable(`left-top-frame-${i}`, leftTop);
			this.addCssVariable(`left-bottom-frame-${i}`, leftBottom);

			const rightTop = 100 - this.getRandomNumber(100);
			const rightBottom = 100 - this.getRandomNumber(100 - rightTop);
			// const rightTop = 40;
			// const rightBottom = 80;

			this.addCssVariable(`right-top-frame-${i}`, rightTop);
			this.addCssVariable(`right-bottom-frame-${i}`, rightBottom);

			const { top: overlapTop, bottom: overlapBottom } = this.getOverlap(
				leftTop,
				leftBottom,
				rightTop,
				rightBottom,
			);

			this.addCssVariable(`overlap-top-frame-${i}`, overlapTop);
			this.addCssVariable(`overlap-bottom-frame-${i}`, overlapBottom);

			this.addCssVariable('glitch-offset', this.offset());
			this.addCssVariable(`random-z-index-frame-${i}`, this.getRandomNumber(2));
			this.addCssVariable(`random-glitch-offset-frame-${i}`, this.getRandomNumber(this.offset()));
		}
	}

	private getOverlap(
		leftTop: number,
		leftBottom: number,
		rightTop: number,
		rightBottom: number,
	): { top: number; bottom: number } {
		const sortedPositions = [
			{ side: 'left', value: leftTop },
			{ side: 'left', value: leftBottom },
			{ side: 'right', value: rightTop },
			{ side: 'right', value: rightBottom },
		].sort((a, b) => a.value - b.value);

		if (
			sortedPositions[0] === undefined ||
			sortedPositions[1] === undefined ||
			sortedPositions[2] === undefined ||
			sortedPositions[0].side === sortedPositions[1].side
		) {
			return { top: 0, bottom: 0 };
		}

		return { top: sortedPositions[1].value, bottom: sortedPositions[2].value };
	}
}
