/**
 * Values should match those returned by the backend.
 */
export enum AnimalType {
  Cow_Beef = 'COB',
  Cow_Dairy = 'COD',
  Pig = 'PIG',
  Chicken = 'CHI',
  Sheep = 'SHE',
  Goat = 'GOA',
  Combined = 'COM',
}

export function getAnimalTypeFromString(
  animalStr: string,
): AnimalType | undefined {
  if (Object.values(AnimalType).includes(animalStr as AnimalType)) {
    return animalStr as AnimalType;
  }
  return undefined; // Handle invalid cases
}
