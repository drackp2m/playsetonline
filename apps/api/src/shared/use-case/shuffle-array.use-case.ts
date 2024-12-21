import { randomNumberBetween } from '@playsetonline/lib/generator/random-number-between';

export class ShuffleArrayUseCase {
	execute<T>(array: T[]): T[] {
		const shuffledArray = structuredClone(array);

		for (let i = shuffledArray.length - 1; 0 < i; i--) {
			const j = randomNumberBetween(0, i + 1);

			const valueAtPositionI = shuffledArray[i];
			const valueAtPositionJ = shuffledArray[j];

			if (valueAtPositionI !== undefined && valueAtPositionJ !== undefined) {
				[shuffledArray[i], shuffledArray[j]] = [valueAtPositionJ, valueAtPositionI];
			}
		}

		return shuffledArray;
	}
}
