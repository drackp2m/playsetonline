import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SendPingGQL } from '@playsetonline/apollo-definitions';

import { pingValue } from './app.config';

@Component({
	standalone: true,
	selector: 'app-root',
	template: `<router-outlet />`,
	imports: [RouterOutlet],
	providers: [SendPingGQL],
})
export class AppComponent {
	private readonly sendPing = inject(SendPingGQL);

	private readonly pingValue = pingValue;

	title = 'app';

	constructor() {
		effect(() => {
			const pingValue = this.pingValue();

			if (pingValue !== undefined) {
				this.sendPing.mutate({ input: { pingValue } }).subscribe();
			}
		});
	}
}
