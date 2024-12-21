import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

import { ApiProtocol } from './api-protocol.type';
import { JwtAlgorithm } from './jwt-algorithm.type';
import { NodeEnv } from './node-env.type';

import 'dotenv/config';

class EnvironmentVariables {
	@IsString()
	@IsNotEmpty()
	NODE_ENV!: NodeEnv;

	@IsString()
	@IsNotEmpty()
	DB_HOST!: string;

	@IsNumber()
	DB_PORT!: number;

	@IsString()
	@IsNotEmpty()
	DB_USER!: string;

	@IsString()
	@IsNotEmpty()
	DB_PASS!: string;

	@IsString()
	@IsNotEmpty()
	DB_NAME!: string;

	@IsString()
	@IsNotEmpty()
	DB_NAME_TEST!: string;

	@IsString()
	@IsNotEmpty()
	DB_CERT!: string;

	@IsString()
	@IsNotEmpty()
	API_PROTOCOL!: ApiProtocol;

	@IsString()
	@IsNotEmpty()
	API_DOMAIN!: string;

	@IsNumber()
	API_PORT!: number;

	@IsString()
	@IsNotEmpty()
	API_PREFIX!: string;

	@IsNumber()
	API_DEBUG_PORT?: number;

	@IsString()
	@IsNotEmpty()
	API_CORS_ALLOWED_DOMAINS!: string;

	@IsString()
	@IsNotEmpty()
	API_COOKIE_SECRET!: string;

	@IsString()
	@IsNotEmpty()
	API_COOKIE_DOMAIN!: string;

	@IsString()
	API_NODE_CACHE_PING_PREFIX!: string;

	@IsString()
	@IsNotEmpty()
	JWT_ID!: string;

	@IsString()
	@IsNotEmpty()
	JWT_ALGORITHM!: JwtAlgorithm;

	@IsString()
	@IsNotEmpty()
	JWT_ISSUER!: string;

	@IsString()
	@IsNotEmpty()
	JWT_AUDIENCE!: string;

	@IsString()
	@IsNotEmpty()
	JWT_ACCESS_TOKEN_EXPIRES_IN!: string;

	@IsString()
	@IsNotEmpty()
	JWT_REFRESH_TOKEN_EXPIRES_IN!: string;

	@IsString()
	@IsNotEmpty()
	JWT_SECRET!: string;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
	const validatedConfig = plainToInstance(EnvironmentVariables, config, {
		enableImplicitConversion: true,
	});

	const errors = validateSync(validatedConfig, {
		skipMissingProperties: true,
	});

	if (0 < errors.length) {
		throw new Error(errors.toString());
	}

	return validatedConfig;
}
