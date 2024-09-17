import { Company } from './company';

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
