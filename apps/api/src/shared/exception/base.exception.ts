import { HttpException } from '@nestjs/common';

export class BaseException extends HttpException {
	constructor(message: string, httpCode: number, details?: string, origin?: string) {
		const responseWithDtoKey = origin !== undefined ? { [origin]: details } : (details ?? message);

		super(responseWithDtoKey, httpCode);

		this.message = message;
	}
}
