import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';

import { NotFoundException } from '../../shared/exception/not-found.exception';
import { AppModule } from '../app/app.module';
import { AuthModule } from '../auth/auth.module';

import { User } from './user.entity';
import { UserModule } from './user.module';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
	let userRepository: UserRepository;

	const authModule = mock<AuthModule>();

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AppModule, UserModule],
			providers: [
				UserRepository,
				{
					provide: AuthModule,
					useValue: authModule,
				},
			],
		}).compile();

		userRepository = await module.resolve(UserRepository);
	});

	beforeEach(async () => {
		await userRepository.deleteMany({});
	});

	it('should be defined', () => {
		expect(userRepository).toBeDefined();
	});

	describe('getOne', () => {
		it('throw NotFoundException when user not exists', () => {
			const searchedUser = userRepository.getOne({ username: 'drackp2m' });

			expect(searchedUser).rejects.toThrow(NotFoundException);
			expect(searchedUser).rejects.toMatchObject({ response: { user: 'not exists' } });
		});

		it('should return User instance when exists', async () => {
			await userRepository.insert(
				new User({
					username: 'drackp2m',
					password: 'password',
				}),
			);

			const searchedUser = await userRepository.getOne({ username: 'drackp2m' });

			expect(searchedUser).toBeInstanceOf(User);
			expect(searchedUser.username).toStrictEqual('drackp2m');
		});
	});

	describe('insertOne', () => {
		it('should insert a user in the test database', async () => {
			const insertedUser = await userRepository.insert(
				new User({
					username: 'drackp2m',
					password: 'password',
				}),
			);

			const list = await userRepository.getMany();

			expect(list.length).toStrictEqual(1);
			expect(insertedUser.username).toStrictEqual('drackp2m');
		});
	});
});
