import { Message } from '@set-online/api-definitions';

import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get('hello')
	getData(): Message {
		return this.appService.getData();
	}
}
