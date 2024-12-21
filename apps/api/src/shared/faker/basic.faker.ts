import { randomNumberBetween } from '@playsetonline/lib';

export class BasicFaker {
	static boolean(): boolean {
		return 0.5 > randomNumberBetween(0, 1);
	}

	static randomEnum<T extends object>(enumInstance: T): T[keyof T] {
		const enumKeys = new BasicFaker().getEnumKeys(enumInstance);

		const firstEnumKey = enumKeys[0];

		if (firstEnumKey === undefined) {
			throw new Error('Enum is empty');
		}

		const randomIndex = randomNumberBetween(0, enumKeys.length - 1);
		const randomEnumKey = enumKeys[randomIndex];

		const enumKey = randomEnumKey ?? firstEnumKey;

		return enumInstance[enumKey];
	}

	private getEnumKeys<T extends object>(enumInstance: T): Array<keyof T> {
		const enumKeys = Object.keys(enumInstance) as Array<keyof T>;

		if (0 !== enumKeys.length % 2) {
			return enumKeys;
		}

		let isBasicEnum = true;
		const enumValues = Object.values(enumInstance);

		for (let index = 0; index < enumKeys.length / 2; index++) {
			if (enumKeys[enumKeys.length / 2 + index] !== enumValues[index]) {
				isBasicEnum = false;
			}
		}

		return isBasicEnum ? enumKeys.slice(enumKeys.length / 2) : enumKeys;
	}
}
