import { Component } from '@angular/core';

@Component({
	selector: 'app-splash-screen',
	template: `
		<div class="splash-screen">
			<div class="center-content">
				<div class="wave"></div>
				<div class="wave"></div>
				<div class="wave"></div>
				<div class="wave"></div>
				<div class="wave"></div>
				<div class="wave"></div>
				<img src="icon.svg" alt="logo" class="logo" />
			</div>
		</div>
	`,
	styleUrl: './splash-screen.component.scss',
})
export class SplashScreenComponent {}
