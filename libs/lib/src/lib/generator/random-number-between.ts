export const randomNumberBetween = (min: number, max: number): number => {
	if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const random = array[0];

    if (random === undefined) {
      return NaN;
    }

    const randomNumber = Math.floor((random / (0xffffffff + 1)) * (max - min + 1)) + min;

    return randomNumber;
  } else if (typeof require !== 'undefined' && process.versions && process.versions.node) {
    const crypto = require('crypto');
    const random = crypto.randomInt(min, max + 1);
		return random;
  } else {
    throw new Error('No suitable crypto API available.');
  }
}
