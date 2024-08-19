from unittest import TestCase

from company.kvk import UittrekselRegisterScraper


class TestScrapeKVKOmschrijving(TestCase):
    def test_scrape_company_description(self):
        address = "Postweg 227 Lunteren"
        companies = UittrekselRegisterScraper.get_companies_for_address(address)
        self.assertEqual(3, len(companies))
        self.assertEqual(
            "Landbouwbedrijf, bestaande uit een melkveehouderij.",
            companies[1].description,
        )
        self.assertFalse(companies[2].active)

    def test_no_result(self):
        address = "Pietjepuk 227 Lunteren"
        companies = UittrekselRegisterScraper.get_companies_for_address(address)
        self.assertEqual(0, len(companies))
