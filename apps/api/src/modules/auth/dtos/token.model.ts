import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenModel {
	@Field()
	token: string;

	constructor(token: TokenModel) {
		Object.assign(this, token);
	}
}
