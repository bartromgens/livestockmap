import {Address, AddressResource, Coordinate} from "./building";

export interface CompanyResource {
  "id": number;
  "description": string;
  "active": boolean;
  "address": AddressResource;
  "chicken": boolean;
  "pig": boolean;
  "cattle": boolean;
  "sheep": boolean;
  "goat": boolean;
}

export class Company {
  constructor(
    public id: number,
    public description: string,
    public active: boolean,
    public address: Address,
    public chicken: boolean,
    public pig: boolean,
    public cattle: boolean,
    public sheep: boolean,
    public goat: boolean,
  ) {
  }

  get coordinate(): Coordinate {
    return this.address.coordinate;
  }

  static fromResource(resource: CompanyResource): Company {
    return new Company(
      Number(resource.id),
      resource.description,
      resource.active,
      Address.fromResource(resource.address),
      resource.chicken,
      resource.pig,
      resource.cattle,
      resource.sheep,
      resource.goat,
    )
  }

  static fromResources(resources: CompanyResource[]): Company[] {
    return resources.map(resource => Company.fromResource(resource));
  }
}

export class CompaniesStats {
  cattleCompanies: Company[] = [];
  chickenCompanies: Company[] = [];
  pigCompanies: Company[] = [];

  constructor(public readonly companies: Company[]) {
    this.createStats();
  }

  private createStats(): any {
    this.cattleCompanies = [];
    this.chickenCompanies = [];
    this.pigCompanies = [];
    for (const company of this.companies) {
      if (company.cattle) {
        this.cattleCompanies.push(company);
      }
      if (company.chicken) {
        this.chickenCompanies.push(company);
      }
      if (company.pig) {
        this.pigCompanies.push(company);
      }
    }
  }
}
