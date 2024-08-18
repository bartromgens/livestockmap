import logging
from typing import List

import requests
from lxml import html
from pydantic import BaseModel


logger = logging.getLogger(__name__)


class Company(BaseModel):
    description: str
    active: bool


class UittrekselRegisterScraper:

    @classmethod
    def get_companies_for_address(cls, address: str) -> List[Company]:
        url = f"https://www.uittrekselregister.nl/zoekresultaten?q={address}"
        logger.info(f"Requesting {url}")
        response = requests.get(url)
        assert response.status_code == 200, f"{response.status_code}"
        logger.info(f"Received response for {url}")
        tree = html.fromstring(response.text)

        # Extract the content after the "Omschrijving" field and check for "Niet actief"
        result_blocks = tree.xpath('//div[@class="result-block"]')
        companies = []

        for block in result_blocks:
            omschrijving = block.xpath(
                './/div[contains(@class, "detail-block mt-4")]/div[contains(text(), "Omschrijving:")]/following-sibling::span[@class="value-column"]/text()'
            )
            niet_actief = block.xpath('.//span[contains(@class, "inactive")]/text()')

            omschrijving_text = omschrijving[0].strip() if omschrijving else ""
            active = not bool(niet_actief)
            if omschrijving_text:
                companies.append(Company(description=omschrijving_text, active=active))
        logger.info(f"{len(companies)} companies found for {address}")
        return companies

    @classmethod
    def check_is_working(cls) -> bool:
        companies = cls.get_companies_for_address("Postweg 227 Lunteren")
        return len(companies) == 3
