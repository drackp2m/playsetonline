import { AsyncPipe, JsonPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

import { CardColor, CardShading, CardShape } from '@playsetonline/api-definitions';
import {
	GetPingsGQL,
	GetPingsSubscription,
	GetUserInfoGQL,
} from '@playsetonline/apollo-definitions';

import { CardShapeComponent } from '../../component/card-shape/card-shape.component';
import { MediaDebugComponent } from '../../component/media-debug/media-debug.component';
import { ApiClient } from '../../service/api-client.service';
import { AuthStore } from '../../store/auth.store';
import { UserStore } from '../../store/user.store';

@Component({
	standalone: true,
	templateUrl: './main.layout.html',
	styleUrl: './main.layout.scss',
	imports: [
		RouterModule,
		NgTemplateOutlet,
		MediaDebugComponent,
		NgIf,
		JsonPipe,
		AsyncPipe,
		CardShapeComponent,
	],
	providers: [GetPingsGQL, GetUserInfoGQL],
})
export default class MainLayout implements OnInit {
	private readonly apiClient = inject(ApiClient);
	private readonly router = inject(Router);
	private readonly authStore = inject(AuthStore);
	private readonly userStore = inject(UserStore);
	private readonly getPingsGQL = inject(GetPingsGQL);
	private readonly swUpdate = inject(SwUpdate);

	readonly user = this.userStore.data;
	readonly userError = this.userStore.error;
	readonly getPings = signal<GetPingsSubscription['getPings'] | undefined>(undefined);

	readonly shape = CardShape;
	readonly color = CardColor;
	readonly shading = CardShading;

	ngOnInit(): void {
		this.getPingsGQL.subscribe().subscribe({
			next: (data) => {
				if (data.data) {
					this.getPings.set(data.data.getPings);
				}
			},
			error: (error) => {
				console.log({ xxx: error });

				this.getPings.set(error.message);
			},
		});
	}

	logout() {
		return () =>
			this.apiClient.auth.get('/logout').subscribe({
				next: () => {
					this.authStore.markTokensAs('invalid');
					this.userStore.reset();
					this.userStore.fetchData();

					this.router.navigate(['/login']);
				},
			});
	}

	async serviceWorkerCheckUpdates(): Promise<void> {
		if (this.swUpdate.isEnabled) {
			const haveUpdates = await this.swUpdate.checkForUpdate();

			console.log({ haveUpdates });
		}
	}
}
