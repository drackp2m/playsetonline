import { DateSetterMethods } from '../definition/date-setter-methods.type';
import { ManipulationDateAttribute } from '../definition/manipulation-date-attribute.type';
import { GenerateNowDateUseCase } from '../use-case/generate-now-date.use-case';

export class EditableDate extends Date {
	constructor(initialDate = new GenerateNowDateUseCase().execute()) {
		super(initialDate);
	}

	edit(attribute: ManipulationDateAttribute, value: number): this {
		this.manipulatedDate(attribute, value);

		return this;
	}

	set(attribute: ManipulationDateAttribute, value: number): this {
		this.manipulatedDate(attribute, value, true);

		return this;
	}

	private manipulatedDate(
		attribute: ManipulationDateAttribute,
		value: number,
		replace = false,
	): void {
		const currentValue = this[`getUTC${this.manipulationDateAttributeMethod(attribute)}`]();

		this[`setUTC${this.manipulationDateAttributeMethod(attribute)}`](
			(replace ? 0 : currentValue) + this.fixValue(attribute, value, replace),
		);
	}

	// FixMe => duplicated code on apps/api/src/shared/faker/date.faker.ts
	private manipulationDateAttributeMethod(attribute: ManipulationDateAttribute): DateSetterMethods {
		switch (attribute) {
			case 'year':
				return 'FullYear';
			case 'month':
				return 'Month';
			case 'day':
				return 'Date';
			case 'hour':
				return 'Hours';
			case 'minute':
				return 'Minutes';
			case 'second':
				return 'Seconds';
			case 'millisecond':
				return 'Milliseconds';
		}
	}

	private fixValue(attribute: ManipulationDateAttribute, value: number, replace: boolean): number {
		if (replace && 'month' === attribute) {
			return value - 1;
		}

		return value;
	}
}
