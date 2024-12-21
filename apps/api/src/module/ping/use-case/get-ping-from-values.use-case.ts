import { Injectable } from '@nestjs/common';

import { GenerateNowDateUseCase } from '../../../shared/use-case/generate-now-date.use-case';
import { CachedPingStatus } from '../definition/cached-ping-status.enum';
import { CachedPing } from '../definition/cached-ping.interface';
import { UserPingValue } from '../definition/user-ping-value.interface';

@Injectable()
export class GetPingFromValuesUseCase {
	constructor(private readonly generateNowDateUseCase: GenerateNowDateUseCase) {}

	async execute(values: UserPingValue[]): Promise<CachedPing> {
		const now = this.generateNowDateUseCase.execute();
		let validPings = 0;
		let pingSum = 0;

		values.forEach((ping) => {
			if (ping.timestamp + 20 * 1000 >= now.getTime()) {
				validPings++;
				pingSum += ping.value;
			}
		});

		const status = this.getPingStatus(validPings);
		const value = Math.round(pingSum / validPings);

		return { values, average: { status, value } };
	}

	private getPingStatus(validPings: number): CachedPingStatus {
		if (1 === validPings) {
			return CachedPingStatus.bad;
		} else if (2 === validPings) {
			return CachedPingStatus.fair;
		} else {
			return CachedPingStatus.good;
		}
	}
}
