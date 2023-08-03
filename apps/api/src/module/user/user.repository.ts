import { Injectable } from '@nestjs/common';

import { BaseRepository } from '../../shared/util/custom.repository';

import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
	findActiveUsers(): UserEntity[] {
		return [];
	}
}
