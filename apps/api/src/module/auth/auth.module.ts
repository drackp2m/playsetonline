import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { ConfigurationModule } from '../../shared/module/config/configuration.module';
import { ConfigurationService } from '../../shared/module/config/configuration.service';
import { JwtFactory } from '../../shared/module/config/factories/jwt.factory';
import { CheckPasswordUseCase } from '../../shared/use-case/check-password.use-case';
import { UserEntity } from '../user/user.entity';

import { AuthController } from './auth.controller';
import { JwtGuard } from './guard/jwt.guard';
import { JwtStrategyService } from './strategy/jwt.strategy.service';
import { CreateJwtAccessTokenUseCase } from './use-case/create-jwt-access-token.use-case';
import { CreateJwtRefreshTokenUseCase } from './use-case/create-jwt-refresh-token.use-cas';
import { LoginUseCase } from './use-case/login.use-case';
import { LogoutUseCase } from './use-case/logout.use-case';
import { RefreshSessionUseCase } from './use-case/refresh-session.use-case';
import { RegisterUseCase } from './use-case/register.use-case';
import { SetJwtTokenUseCase } from './use-case/set-jwt-token.use-case';

@Module({
	imports: [
		ConfigurationModule,
		JwtModule.registerAsync({
			imports: [ConfigurationModule],
			inject: [ConfigurationService],
			useClass: JwtFactory,
		}),
		MikroOrmModule.forFeature({ entities: [UserEntity] }),
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtGuard,
		},
		JwtStrategyService,
		RegisterUseCase,
		LoginUseCase,
		LogoutUseCase,
		RefreshSessionUseCase,
		CreateJwtAccessTokenUseCase,
		CreateJwtRefreshTokenUseCase,
		SetJwtTokenUseCase,
		CheckPasswordUseCase,
	],
	controllers: [AuthController],
})
export class AuthModule {}
