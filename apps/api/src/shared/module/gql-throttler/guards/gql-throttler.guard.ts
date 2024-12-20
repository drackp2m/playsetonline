import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

import { TooManyRequestsException } from '../../../exception/too-many-requests.exception';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
	getRequestResponse(context: ExecutionContext) {
		const gqlCtx = GqlExecutionContext.create(context);
		const ctx = gqlCtx.getContext();

		return { req: ctx.req, res: ctx.req ?? { header: () => null } };
	}

	protected throwThrottlingException(): Promise<void> {
		throw new TooManyRequestsException('Too many requests', 'throttling');
	}
}
