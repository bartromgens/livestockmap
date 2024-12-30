import { Coordinate } from '../geo';
import { Address, AddressResource } from '../address';
import { AnimalType } from '../animal';

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
  cattle_dairy: boolean;
  cattle_beef: boolean;
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
    public cattleDairy: boolean,
    public cattleBeef: boolean,
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
      resource.cattle_dairy,
      resource.cattle_beef,
      resource.sheep,
      resource.goat,
    );
  }

  static fromResources(resources: CompanyResource[]): Company[] {
    return resources.map((resource) => Company.fromResource(resource));
  }

  static groupCompaniesByAnimalType(companies: Company[]) {
    // Initialize each key with an empty list
    const companiesGrouped: Record<AnimalType, Company[]> = Object.values(
      AnimalType,
    ).reduce(
      (map, key) => {
        map[key as AnimalType] = [];
        return map;
      },
      {} as Record<AnimalType, any[]>,
    );

    for (const company of companies) {
      companiesGrouped[company.animalTypeMain].push(company);
    }
    return companiesGrouped;
  }
}
