// TODO BR: Move this to the backend (and remove here)

export interface AnimalConfig {
  minimalSquareMeterPerAnimal: number;
}

export const defaultAnimalConfig = {
  minimalSquareMeterPerAnimal: 0.8,
};

export const pigConfig = {
  minimalSquareMeterPerAnimal: 0.8, // https://www.rvo.nl/onderwerpen/dieren-houden-verkopen-verzorgen/welzijnseisen-varkens
};

export const cowConfig = {
  minimalSquareMeterPerAnimal: 1.7, // https://www.nvwa.nl/onderwerpen/runderen/regels-voor-rundveehouders
};

export const chickenConfig = {
  minimalSquareMeterPerAnimal: 0.04, // https://www.rvo.nl/onderwerpen/dieren-houden-verkopen-verzorgen/welzijnseisen-vleeskuikens
};

export const sheepConfig = {
  minimalSquareMeterPerAnimal: 0.6,
};

export const goatConfig = {
  minimalSquareMeterPerAnimal: 0.5,
};
