import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { User } from '../../user/user.entity';
import { UserFaker } from '../../user/user.faker';
import { UserService } from '../../user/user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { JwtStrategyService } from './jwt.strategy.service';

const uuid = '433b2725-c483-46b2-8b80-1b944158e04c';

jest.mock('uuid', () => ({
	v4: () => uuid,
}));

const jwtMock: JwtPayload = {
	iat: 648600120,
	nbf: 648600120,
	exp: 1974062562,
	aud: 'Jest',
	iss: 'You',
	sub: '42',
	jti: 'c85e8f94-8777-4e3a-bebf-f8b886ea6d9e',
};

describe('JwtStrategyService', () => {
	let service: JwtStrategyService;
	let configService: jest.Mocked<Partial<ConfigService>>;
	let userService: jest.Mocked<Partial<UserService>>;

	const userFaker = new UserFaker();
	const fakeUser: User = userFaker.makeOne(
		{ uuid },
		{ createdFrom: '2010' },
	) as User;

	beforeAll(async () => {
		configService = {
			get: jest.fn(),
		};

		configService.get.mockReturnValueOnce({ secret: '1234' });

		userService = {
			getOneBy: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				JwtStrategyService,
				{ provide: ConfigService, useValue: configService },
				{ provide: UserService, useValue: userService },
			],
		}).compile();

		service = module.get<JwtStrategyService>(JwtStrategyService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('validate', () => {
		it('should throw NotFoundException when EntityManager.getOneBy throw NotFoundException', async () => {
			userService.getOneBy.mockRejectedValueOnce(() => {
				throw new NotFoundException();
			});

			const user = service.validate(jwtMock);

			await expect(user).rejects.toThrow(NotFoundException);
		});
	});

	it('should throw NotFoundException when EntityManager.getOneBy throw NotFoundException', async () => {
		userService.getOneBy.mockResolvedValueOnce(fakeUser);

		const user = await service.validate(jwtMock);

		expect(user).toStrictEqual(fakeUser);
	});
});
