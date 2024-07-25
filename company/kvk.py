from typing import List

import requests
from lxml import html
from pydantic import BaseModel


class Company(BaseModel):
    description: str
    active: bool


def get_companies_for_address(address: str) -> List[Company]:
    url = f"https://www.uittrekselregister.nl/zoekresultaten?q={address}"
    response = requests.get(url)
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
        companies.append(Company(description=omschrijving_text, active=active))
    return companies
