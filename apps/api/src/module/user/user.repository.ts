import { Injectable } from '@nestjs/common';

import { BaseRepository } from '../../shared/util/custom.repository';

import { UserEntity } from './user.entity';

@Injectable()
export class UserEntityRepository extends BaseRepository<UserEntity> {
	findActiveUsers(): UserEntity[] {
		throw new Error('Method not implemented.');
	}
}