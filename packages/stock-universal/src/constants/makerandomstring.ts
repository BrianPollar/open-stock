// This file imports the `Tmkrandomstringhow` type from the `union.types` file.
import { Tmkrandomstringhow } from '../types/union.types';

// This function generates a random string of a specified length and type.
/** */
/**
 * Generates a random string of a specified length and type.
 * @param length - The length of the random string.
 * @param how - The type of the random string.
 * @returns The generated random string.
 */
export const makeRandomString = (
  // The length of the random string.
  length: number,
  // The type of the random string.
  how: Tmkrandomstringhow
): string => {
  // The output string.
  let outString = '';
  // The characters that the random string can be made of.
  let inOptions;

  // Switch on the `how` parameter to determine the type of random string to generate.
  switch (how) {
    case 'numbers':
      // The random string will be made of numbers.
      inOptions = '0123456789';
      break;
    case 'letters':
      // The random string will be made of letters.
      inOptions = 'abcdefghijklmnopqrstuvwxyz';
      break;
    case 'combined':
      // The random string will be made of numbers and letters.
      inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
      break;
  }

  // Loop through the length of the random string and generate a random character.
  for (let i = 0; i < length; i++) {
    // Get a random character from the `inOptions` string.
    outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
  }

  // Return the output string.
  return outString;
};
