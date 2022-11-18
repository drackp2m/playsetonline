import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { UnauthorizedException } from '../../../common/exceptions';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
	public getRequest(context: ExecutionContext): Request {
		const gqlContext = GqlExecutionContext.create(context);

		return gqlContext.getContext<{ req: Request }>().req;
	}

	public handleRequest<User>(error: Error, user: User): User | undefined {
		console.log({ error, user });
		if (error) {
			throw new UnauthorizedException('invalid bearer', 'authorization');
		}

		return user || undefined;
	}
}