# livestockmap

An interactive map of buildings where livestock is kept in the Netherlands.

## Data

livestockmap uses [OpenStreetMap](https://www.openstreetmap.org) as base for its livestock building data.
It also aims to improve OpenStreetMap data on livestock buildings by providing tools and automation
to tag livestock buildings.

The most important tags for this project are the `livestock=` tags.
See [buildings=livestock](https://wiki.openstreetmap.org/wiki/Tag:building%3Dlivestock)
for more information on how these are to be used.

## Development

### Ideas

#### TODO

- [ ] Optimize rendering of many markers (especially zooming out)
  - [ ] Use canvas? https://github.com/francoisromain/leaflet-markers-canvas?tab=readme-ov-file
- [ ] Change animal colors for better distinction between cow and pig
- [ ] Add about page
- [ ] Add link to GitHub repo
- [ ] Improve layout and styling of footer statistics
  - [ ] Fix footer visibility on small screens 
- [ ] Add and use [SBI-codes](https://www.kvk.nl/over-het-handelsregister/overzicht-standaard-bedrijfsindeling-sbi-codes-voor-activiteiten/) to company data 

#### Livestock data 

Livestock animals in the Netherlands [source](https://longreads.cbs.nl/nederland-in-cijfers-2021/hoeveel-landbouwdieren-telt-ons-land/)
- 11.4 million pigs
- 3.8 million cattle [source](https://www.cbs.nl/nl-nl/nieuws/2023/11/nauwelijks-minder-melkkoeien-in-2022-wel-minder-varkens)
  - 2.55 million dairy cattle (including young)
  - 1.21 million beef cattle (including young)
- 99.9 million chickens
- 0.85 million sheep
- 0.48 million goats

Number of livestock companies [source](https://www.staatvanlandbouwnatuurenvoedsel.nl/kerncijfers/aantal-bedrijven/#Groepen) [source2](https://agrimatie.nl/SectorResultaat.aspx?subpubID=2232&sectorID=2430)
- 2026 pigs
- 13215 dairy cattle
- 1451 beef cattle [source](https://agrimatie.nl/SectorResultaat.aspx?subpubID=2232&sectorID=2430&themaID=2286)
- 3041 combined
- 1488 chicken (or other)
  - 733 eggs [source](https://agrimatie.nl/SectorResultaat.aspx?subpubID=2232&sectorID=2249&themaID=2286)
  - 613 meat [source](https://agrimatie.nl/SectorResultaat.aspx?subpubID=2232&sectorID=2249&themaID=2286)
- 11198 other grazing (goat, sheep, horse, other)
  - 651 goat [source](https://agrimatie.nl/SectorResultaat.aspx?subpubID=2232&sectorID=2430)
  - 8141 sheep [source](https://agrimatie.nl/SectorResultaat.aspx?subpubID=2232&sectorID=2430)

Vergunningen:
- https://krd.igoview.nl/ (Gelderland, Limburg, Noord-Brabant en Twente)

#### Company information (KvK)

- Search for companies registered at the KvK near a building on the map
- Determine from the registration information what type of livestock is kept (cattle, pigs, chickens, etc).

API options:

- https://developers.kvk.nl/nl/apis (requires a KvK number)
- https://overheid.io/documentatie/v3/openkvk (may not have the same information as the KvK API, more expensive)

Websites:

- https://www.uittrekselregister.nl/zoekresultaten?q=
- https://www.bedrijvenregister.nl/
- https://www.transfirm.nl/index

### Tools

#### Overpas-turbo

Use https://overpass-turbo.eu/ to test OSM queries.

Example query:

```osmquery
[out:json][timeout:25];
area["ISO3166-1"="NL"];
way[building]["building"!~"^(house|apartments)$"]({{bbox}})(area);
out geom;
```

#### geojson.io

Use https://geojson.io to test visualizing geojson data on an interactive map.

#### Icons

https://www.vecteezy.com is used to find images and icons with a free license.

#### Colors

https://paletton.com to select [3 colors](https://paletton.com/#uid=5000A0kRrUXo7Tmv7UvUjxWSNph):

- FF8300
- FF0000
- F300B0

#### Data

- https://agrimatie.nl/
- https://www.staatvanlandbouwnatuurenvoedsel.nl/kerncijfers/
- https://data.emissieregistratie.nl/emissies/grafiek?s=tq5t3cVjA
