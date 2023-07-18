import { Entity, Enum, Property } from '@mikro-orm/core';
import { Field, ObjectType } from '@nestjs/graphql';

import { BaseEntity } from '../../shared/utils/base.entity';

import { UserRole } from './definition/user-role.enum';

@Entity({ tableName: 'users' })
@ObjectType({ description: 'user' })
export class UserEntity extends BaseEntity<UserEntity> {
	@Property({ unique: true })
	@Field()
	username!: string;

	@Property()
	password!: string;

	@Property({ unique: true, nullable: true })
	@Field({ nullable: true })
	email?: string;

	@Enum({ items: () => UserRole, default: UserRole.Registered })
	@Field((_type) => UserRole)
	role!: UserRole;
}
