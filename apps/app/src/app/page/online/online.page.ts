import { Component, OnInit, WritableSignal, inject, signal } from '@angular/core';

import {
	JoinGameGQL,
	ListGamesGQL,
	ListGamesQuery,
	NewGameGQL,
} from '@playsetonline/apollo-definitions';

@Component({
	templateUrl: './online.page.html',
	styleUrl: './online.page.scss',
	providers: [NewGameGQL, ListGamesGQL, JoinGameGQL],
})
export class OnlinePage implements OnInit {
	private readonly newGameGQL = inject(NewGameGQL);
	private readonly listGamesGQL = inject(ListGamesGQL);
	private readonly joinGameGQL = inject(JoinGameGQL);

	games: WritableSignal<ListGamesQuery['listGames'] | undefined> = signal(undefined);
	error: WritableSignal<string | undefined> = signal(undefined);

	ngOnInit(): void {
		this.listGamesGQL.fetch().subscribe({
			next: (data) => {
				this.games.set(data.data.listGames);
			},
		});

		const data = {
			data: {
				joinGame: {
					participants: [],
				},
			},
		};

		this.games.update((games) => {
			const game = games?.find((game) => game.uuid);

			if (game !== undefined) {
				game.participants = data.data.joinGame.participants;
			}

			return games;
		});
	}

	joinGame(gameToJoin: ListGamesQuery['listGames'][0]): void {
		this.joinGameGQL.mutate({ input: { gameUuid: gameToJoin.uuid } }).subscribe({
			next: (data) => {
				this.games.update((games) => {
					const game = games?.find((game) => game.uuid === gameToJoin.uuid);

					if (game && data.data?.joinGame.participants) {
						game.participants = data.data?.joinGame.participants;
					}

					return games;
				});
			},
			error: (error: unknown) => {
				console.log({ error });
				// const details = error.graphQLErrors[0].extensions.details;

				// this.error.set(JSON.stringify(details));
			},
		});
	}

	newGame(): void {
		this.newGameGQL.mutate().subscribe({
			next: (data) => {
				const game = data.data?.newGame;

				if (game) {
					this.games.update((games) => {
						games?.push(game);

						return games;
					});
				}
			},
			error: (error: unknown) => {
				console.log(error);
				// if (error instanceof GraphQLError) {
				// 	const details = error.graphQLErrors[0].extensions.details;

				// 	this.error.set(JSON.stringify(details));
				// }
			},
		});
	}

	listParticipants(game: ListGamesQuery['listGames'][0]): string {
		return game.participants.map((participant) => participant.username).join(', ');
	}
}
