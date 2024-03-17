import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import * as Apollo from 'apollo-angular';

export type Maybe<T> = T | null;

export type InputMaybe<T> = Maybe<T>;

export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };

export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };

export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
	[_ in K]?: never;
};

export type Incremental<T> =
	| T
	| { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: { input: string; output: string };
	String: { input: string; output: string };
	Boolean: { input: boolean; output: boolean };
	Int: { input: number; output: number };
	Float: { input: number; output: number };
	/** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
	DateTime: { input: Date; output: Date };
};

/** game */
export type Game = {
	__typename?: 'Game';
	createdAt: Scalars['DateTime']['output'];
	expiresOn: Scalars['DateTime']['output'];
	participants: Array<User>;
	status: GameStatus;
	tableCards: Array<Scalars['String']['output']>;
	updatedAt: Scalars['DateTime']['output'];
	uuid: Scalars['ID']['output'];
};

export enum GameStatus {
	Completed = 'Completed',
	Expired = 'Expired',
	InProgress = 'InProgress',
	WaitingOpponents = 'WaitingOpponents',
}

export type JoinGameInput = {
	gameUuid: Scalars['String']['input'];
};

export type Mutation = {
	__typename?: 'Mutation';
	joinGame: Game;
	newGame: Game;
};

export type MutationjoinGameArgs = {
	input: JoinGameInput;
};

export type Query = {
	__typename?: 'Query';
	getUserInfo: User;
	getUsers: Array<User>;
	listGames: Array<Game>;
	validateUserConstraints: Scalars['Boolean']['output'];
};

export type QueryvalidateUserConstraintsArgs = {
	input: ValidateUserConstraintsInput;
};

export type Subscription = {
	__typename?: 'Subscription';
	getManySubscription?: Maybe<Scalars['String']['output']>;
};

/** user */
export type User = {
	__typename?: 'User';
	createdAt: Scalars['DateTime']['output'];
	email?: Maybe<Scalars['String']['output']>;
	games: Array<Game>;
	role: UserRole;
	updatedAt: Scalars['DateTime']['output'];
	username: Scalars['String']['output'];
	uuid: Scalars['ID']['output'];
};

export enum UserRole {
	Admin = 'Admin',
	Guest = 'Guest',
	Registered = 'Registered',
}

export type ValidateUserConstraintsInput = {
	email?: InputMaybe<Scalars['String']['input']>;
	username?: InputMaybe<Scalars['String']['input']>;
};

export interface PossibleTypesResultData {
	possibleTypes: {
		[key: string]: string[];
	};
}
const result: PossibleTypesResultData = {
	possibleTypes: {},
};

export default result;

export type GameFieldsFragment = {
	__typename?: 'Game';
	uuid: string;
	tableCards: Array<string>;
	status: GameStatus;
	expiresOn: Date;
	createdAt: Date;
	updatedAt: Date;
	participants: Array<{ __typename?: 'User'; uuid: string; username: string }>;
};

export type JoinGameMutationVariables = Exact<{
	input: JoinGameInput;
}>;

export type JoinGameMutation = {
	__typename?: 'Mutation';
	joinGame: {
		__typename?: 'Game';
		uuid: string;
		tableCards: Array<string>;
		status: GameStatus;
		expiresOn: Date;
		createdAt: Date;
		updatedAt: Date;
		participants: Array<{ __typename?: 'User'; uuid: string; username: string }>;
	};
};

export type NewGameMutationVariables = Exact<{ [key: string]: never }>;

export type NewGameMutation = {
	__typename?: 'Mutation';
	newGame: {
		__typename?: 'Game';
		uuid: string;
		tableCards: Array<string>;
		status: GameStatus;
		expiresOn: Date;
		createdAt: Date;
		updatedAt: Date;
		participants: Array<{ __typename?: 'User'; uuid: string; username: string }>;
	};
};

export type ListGamesQueryVariables = Exact<{ [key: string]: never }>;

export type ListGamesQuery = {
	__typename?: 'Query';
	listGames: Array<{
		__typename?: 'Game';
		uuid: string;
		tableCards: Array<string>;
		status: GameStatus;
		expiresOn: Date;
		createdAt: Date;
		updatedAt: Date;
		participants: Array<{ __typename?: 'User'; uuid: string; username: string }>;
	}>;
};

export type UserFieldsFragment = {
	__typename?: 'User';
	uuid: string;
	username: string;
	email?: string | null;
	role: UserRole;
	createdAt: Date;
	updatedAt: Date;
};

export type GetUserInfoQueryVariables = Exact<{ [key: string]: never }>;

export type GetUserInfoQuery = {
	__typename?: 'Query';
	getUserInfo: {
		__typename?: 'User';
		uuid: string;
		username: string;
		email?: string | null;
		role: UserRole;
		createdAt: Date;
		updatedAt: Date;
	};
};

export type GetUsersQueryVariables = Exact<{ [key: string]: never }>;

export type GetUsersQuery = {
	__typename?: 'Query';
	getUsers: Array<{
		__typename?: 'User';
		uuid: string;
		username: string;
		email?: string | null;
		role: UserRole;
		createdAt: Date;
		updatedAt: Date;
	}>;
};

export type ValidateUserConstraintsQueryVariables = Exact<{
	input: ValidateUserConstraintsInput;
}>;

export type ValidateUserConstraintsQuery = {
	__typename?: 'Query';
	validateUserConstraints: boolean;
};

export const GameFieldsFragmentDoc = gql`
	fragment GameFields on Game {
		uuid
		tableCards
		participants {
			uuid
			username
		}
		status
		expiresOn
		createdAt
		updatedAt
	}
`;

export const UserFieldsFragmentDoc = gql`
	fragment UserFields on User {
		uuid
		username
		email
		role
		createdAt
		updatedAt
	}
`;

export const JoinGameDocument = gql`
	mutation JoinGame($input: JoinGameInput!) {
		joinGame(input: $input) {
			...GameFields
		}
	}
	${GameFieldsFragmentDoc}
`;

@Injectable({
	providedIn: 'root',
})
export class JoinGameGQL extends Apollo.Mutation<JoinGameMutation, JoinGameMutationVariables> {
	override document = JoinGameDocument;

	constructor(apollo: Apollo.Apollo) {
		super(apollo);
	}
}

export const NewGameDocument = gql`
	mutation NewGame {
		newGame {
			...GameFields
		}
	}
	${GameFieldsFragmentDoc}
`;

@Injectable()
export class NewGameGQL extends Apollo.Mutation<NewGameMutation, NewGameMutationVariables> {
	override document = NewGameDocument;

	constructor(apollo: Apollo.Apollo) {
		super(apollo);
	}
}

export const ListGamesDocument = gql`
	query ListGames {
		listGames {
			...GameFields
		}
	}
	${GameFieldsFragmentDoc}
`;

@Injectable({
	providedIn: 'root',
})
export class ListGamesGQL extends Apollo.Query<ListGamesQuery, ListGamesQueryVariables> {
	override readonly document = ListGamesDocument;
}

export const GetUserInfoDocument = gql`
	query GetUserInfo {
		getUserInfo {
			...UserFields
		}
	}
	${UserFieldsFragmentDoc}
`;

@Injectable({
	providedIn: 'root',
})
export class GetUserInfoGQL extends Apollo.Query<GetUserInfoQuery, GetUserInfoQueryVariables> {
	override document = GetUserInfoDocument;
}

export const GetUsersDocument = gql`
	query GetUsers {
		getUsers {
			...UserFields
		}
	}
	${UserFieldsFragmentDoc}
`;

@Injectable({
	providedIn: 'root',
})
export class GetUsersGQL extends Apollo.Query<GetUsersQuery, GetUsersQueryVariables> {
	override document = GetUsersDocument;

	constructor(apollo: Apollo.Apollo) {
		super(apollo);
	}
}

export const ValidateUserConstraintsDocument = gql`
	query ValidateUserConstraints($input: ValidateUserConstraintsInput!) {
		validateUserConstraints(input: $input)
	}
`;

@Injectable({
	providedIn: 'root',
})
export class ValidateUserConstraintsGQL extends Apollo.Query<
	ValidateUserConstraintsQuery,
	ValidateUserConstraintsQueryVariables
> {
	override readonly document = ValidateUserConstraintsDocument;
}
