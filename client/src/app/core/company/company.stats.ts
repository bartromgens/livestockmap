import { Company } from './company';
import { AnimalType } from '../animal';

export class CompaniesStats {
  companyCount = 0;
  cattleCompanies: Company[] = [];
  chickenCompanies: Company[] = [];
  pigCompanies: Company[] = [];
  cowCount = 0;
  pigCount = 0;
  chickenCount = 0;

  constructor(public readonly companies: Company[]) {
    this.createStats();
  }

  private createStats(): any {
    this.companyCount = this.companies.length;
    this.cattleCompanies = [];
    this.chickenCompanies = [];
    this.pigCompanies = [];
    this.cowCount = 0;
    this.pigCount = 0;
    this.chickenCount = 0;
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
