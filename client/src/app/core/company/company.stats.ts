import { AnimalType, Company } from './company';

export class CompaniesStats {
  cattleCompanies: Company[] = [];
  chickenCompanies: Company[] = [];
  pigCompanies: Company[] = [];
  cowCount: number = 0;
  pigCount: number = 0;
  chickenCount: number = 0;

  constructor(public readonly companies: Company[]) {
    this.createStats();
  }

  private createStats(): any {
    this.cattleCompanies = [];
    this.chickenCompanies = [];
    this.pigCompanies = [];
    for (const company of this.companies) {
      switch (company.animalTypeMain) {
        case AnimalType.Cow:
          this.cattleCompanies.push(company);
          this.cowCount += company.animalCount;
          break;
        case AnimalType.Chicken:
          this.chickenCompanies.push(company);
          this.chickenCount += company.animalCount;
          break;
        case AnimalType.Pig:
          this.pigCompanies.push(company);
          this.pigCount += company.animalCount;
          break;
      }
    }
  }
}
