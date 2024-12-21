import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

import { AppModule } from './module/app/app.module';
import { BootstrapHelper } from './shared/util/bootstrap.helper';

async function bootstrap(): Promise<void> {
	let app = await NestFactory.create(AppModule);

	const apiConfig = BootstrapHelper.apiConfig(app);

	const allowedDomains = apiConfig.corsAllowedDomains;

	app = await NestFactory.create(AppModule, BootstrapHelper.nestApplicationOptions(apiConfig));

	useContainer(app.select(AppModule), { fallbackOnErrors: true });

	app.setGlobalPrefix(...BootstrapHelper.globalPrefix(apiConfig));
	app.useGlobalPipes(BootstrapHelper.validationPipe);
	app.useGlobalFilters(BootstrapHelper.exceptionsFilter);
	app.enableCors({
		credentials: true,
		origin: (origin: string | undefined, callback) => {
			if (origin === undefined || allowedDomains.includes(origin)) {
				callback(null, true);
			} else {
				Logger.warn(`Origin ${origin} not allowed by CORS policy`);
				callback(null, false);
			}
		},
		methods: 'GET,POST',
	});
	app.use(cookieParser(apiConfig.cookieSecret));

	const port = apiConfig.port;

	await app.listen(port, () => BootstrapHelper.logAppBootstrap(apiConfig));
}

bootstrap().catch((e) => Logger.error(e.message, e));
