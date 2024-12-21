import { Test, TestingModule } from '@nestjs/testing';
import { ValidationArguments } from 'class-validator';
import { mock } from 'jest-mock-extended';

import { NotFoundException } from '../../../shared/exception/not-found.exception';
import { UserFaker } from '../factory/user.faker';
import { UserRepository } from '../user.repository';

import { IsUniqueUserPropRule } from './is-unique-user-prop';

describe('IsUniqueUserPropRule', () => {
	let validator: IsUniqueUserPropRule;
	const userEntityRepository = mock<UserRepository>();

	const validateArgs = mock<ValidationArguments>({ property: 'username' });

	const fakeUuid = '00000000-0000-4000-0000-000000000000';
	const fakeUser = UserFaker.makeOne({ uuid: fakeUuid }, { createdSince: '2010' });

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				IsUniqueUserPropRule,
				{ provide: UserRepository, useValue: userEntityRepository },
			],
		}).compile();

		validator = module.get<IsUniqueUserPropRule>(IsUniqueUserPropRule);
	});

	it('should be defined', () => {
		expect(validator).toBeDefined();
	});

	describe('validate', () => {
		it('should return True when UserService.getOne throw exception', async () => {
			userEntityRepository.getOne.mockRejectedValueOnce(NotFoundException);

			const result = await validator.validate('admin', validateArgs);

			expect(result).toStrictEqual(true);

			expect(userEntityRepository.getOne).toHaveBeenCalledTimes(1);
			expect(userEntityRepository.getOne).toHaveBeenCalledWith({ username: 'admin' });
		});

		it('should return False when UserService.getOne return a UserEntity', async () => {
			userEntityRepository.getOne.mockResolvedValueOnce(fakeUser);

			const result = await validator.validate('admin', validateArgs);

			expect(result).toStrictEqual(false);

			expect(userEntityRepository.getOne).toHaveBeenCalledTimes(1);
			expect(userEntityRepository.getOne).toHaveBeenCalledWith({ username: 'admin' });
		});
	});

	describe('defaultMessage', () => {
		it('should return valid messages when property is username', async () => {
			const result = validator.defaultMessage({
				property: 'username',
			} as ValidationArguments);

			expect(result).toStrictEqual('username already exists');
		});

		it('should return valid messages when property is email', async () => {
			validateArgs.property = 'email';

			const result = validator.defaultMessage(validateArgs);

			expect(result).toStrictEqual('email already exists');
		});
	});
});
