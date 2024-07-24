from unittest import TestCase

from company.kvk import get_companies_for_address


class TestScrapeKVKOmschrijving(TestCase):
    def test_scrape_company_description(self):
        address = "Postweg 227 Lunteren"
        companies = get_companies_for_address(address)
        for company in companies:
            print(company)
        self.assertEqual(3, len(companies))
        self.assertEqual(
            "Landbouwbedrijf, bestaande uit een melkveehouderij.",
            companies[1].description,
        )
        self.assertFalse(companies[2].active)
