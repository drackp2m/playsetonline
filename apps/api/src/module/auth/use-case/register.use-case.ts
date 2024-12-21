import { Injectable } from '@nestjs/common';

import { PreconditionFailedException } from '../../../shared/exception/precondition-failed.exception';
import { User } from '../../user/user.entity';
import { UserRepository } from '../../user/user.repository';
import { RegisterRequestDto } from '../dto/request/register-request.dto';

import { HashPasswordUseCase } from './hash-password.use-case';

@Injectable()
export class RegisterUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly hashPasswordUseCase: HashPasswordUseCase,
	) {}

	async execute(registerRequest: RegisterRequestDto): Promise<User> {
		const userExists = await this.userRepository.getMany({
			$or: [
				{ username: registerRequest.username },
				{
					...(registerRequest.email !== undefined ? { email: registerRequest.email } : {}),
				},
			],
		});

		if (userExists[0]) {
			const field = userExists[0].username === registerRequest.username ? 'username' : 'email';

			throw new PreconditionFailedException('already exists', field);
		}

		registerRequest.password = await this.hashPasswordUseCase.execute(registerRequest.password);

		const user = new User(registerRequest);

		return this.userRepository.insert(user);
	}
}
