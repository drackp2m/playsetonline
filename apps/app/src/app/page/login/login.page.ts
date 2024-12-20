import { JsonPipe } from '@angular/common';
import { Component, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { GetUsersGQL } from '@playsetonline/apollo-definitions';

import { ApiClient } from '../../service/api-client.service';
import { AuthStore } from '../../store/auth.store';
import { UserStore } from '../../store/user.store';

@Component({
	templateUrl: './login.page.html',
	imports: [ReactiveFormsModule, JsonPipe],
	providers: [GetUsersGQL],
})
export class LoginPage implements OnInit {
	private readonly apiClient = inject(ApiClient);
	private readonly router = inject(Router);
	private readonly authStore = inject(AuthStore);
	private readonly userStore = inject(UserStore);
	private readonly getUsersGQL = inject(GetUsersGQL);

	form = new FormGroup({
		username: new FormControl<string>('', [Validators.required]),
		password: new FormControl('', [Validators.required]),
	});

	loading = signal(false);
	usernames: WritableSignal<string[] | undefined> = signal(undefined);
	error = signal<string | undefined>(undefined);

	ngOnInit(): void {
		this.getUsersGQL.fetch().subscribe({
			next: (data) => {
				this.usernames.set(data.data.getUsers.map((user) => user.username));
			},
		});
	}

	onSubmit() {
		const controls = this.form.controls;

		if (null === controls.username.value || null === controls.password.value) {
			return;
		}

		this.loading.set(true);

		this.apiClient.auth
			.post('/login', {
				username: controls.username.value,
				password: controls.password.value,
			})
			.subscribe({
				next: () => {
					this.router.navigate(['/home']);
					this.authStore.markTokensAs('valid');
					this.userStore.fetchData();
				},
				error: (error: unknown) => {
					if (error instanceof Error) {
						this.loading.set(false);
						this.error.set(error.message);
					}
				},
			});
	}
}
