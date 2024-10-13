import { Coordinate } from '../geo';
import { Address, AddressResource } from '../address';

/**
 * Values should match those returned by the backend.
 */
export enum AnimalType {
  Cow = 'COW',
  Pig = 'PIG',
  Chicken = 'CHI',
  Sheep = 'SHE',
  Goat = 'GOA',
}

export interface CompanyResource {
  id: number;
  description: string;
  active: boolean;
  address: AddressResource;
  animal_type_main: AnimalType;
  animal_count: number;
  chicken: boolean;
  pig: boolean;
  cattle: boolean;
  sheep: boolean;
  goat: boolean;
}

export class Company {
  constructor(
    public id: number,
    public description: string,
    public active: boolean,
    public address: Address,
    public animalTypeMain: AnimalType,
    public animalCount: number,
    public chicken: boolean,
    public pig: boolean,
    public cattle: boolean,
    public sheep: boolean,
    public goat: boolean,
  ) {}

  get coordinate(): Coordinate {
    return this.address.coordinate;
  }

  static fromResource(resource: CompanyResource): Company {
    return new Company(
      Number(resource.id),
      resource.description,
      resource.active,
      Address.fromResource(resource.address),
      <AnimalType>resource.animal_type_main,
      Number(resource.animal_count),
      resource.chicken,
      resource.pig,
      resource.cattle,
      resource.sheep,
      resource.goat,
    );
  }

  static fromResources(resources: CompanyResource[]): Company[] {
    return resources.map((resource) => Company.fromResource(resource));
  }
}
