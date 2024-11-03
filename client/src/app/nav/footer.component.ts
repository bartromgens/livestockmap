import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

import { CompaniesStats, Company } from '../core/company';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatToolbarModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private _companies: Company[] = [];
  stats: CompaniesStats | null = null;

  @Input()
  set companies(companies: Company[]) {
    this._companies = companies;
    this.update();
  }

  private update(): void {
    console.log(this._companies);
    const stats = new CompaniesStats(this._companies);
    this.stats = stats;
  }
}
