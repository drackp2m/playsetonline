import { DatePipe } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SendPingGQL } from '@playsetonline/apollo-definitions';

import { pingValue as pingValueConfig } from './app.config';
import { SplashScreenComponent } from './component/splash-screen/splash-screen.component';
import { AppLoaderService } from './service/app-loader.service';
import { UserStore } from './store/user.store';

import { version } from '@package';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
	imports: [RouterOutlet, SplashScreenComponent],
	providers: [SendPingGQL, DatePipe],
})
export class AppComponent implements OnInit {
	private readonly sendPing = inject(SendPingGQL);
	private readonly userStore = inject(UserStore);
	private readonly appLoaderService = inject(AppLoaderService);
	private readonly datePipe = inject(DatePipe);

	readonly version = version;
	readonly loadFinish = this.appLoaderService.loadFinish;

	messages = signal<string[]>([]);

	constructor() {
		this.fetchUserStoreData();

		effect(() => {
			const pingValue = pingValueConfig();

			if (pingValue !== undefined) {
				this.sendPing.mutate({ input: { pingValue } }).subscribe();
			}
		});
	}

	ngOnInit(): void {
		this.checkPageVisibility();
	}

	checkPageVisibility() {
		document.addEventListener('visibilitychange', () => {
			const date = this.datePipe.transform(new Date(), 'HH:mm:ss');
			if (document.hidden) {
				this.messages.update((messages) => [
					`[${date}] - La aplicación está en segundo plano.`,
					...messages,
				]);
			} else {
				this.messages.update((messages) => [
					`[${date}] - La aplicación está en primer plano.`,
					...messages,
				]);
			}
		});
	}

	private fetchUserStoreData() {
		this.userStore.fetchData();
	}
}
