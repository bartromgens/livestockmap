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

- [ ] Determine building animal type for companies with multiple
- [ ] Optimize rendering of many markers (especially zooming out)
  - [ ] Use canvas? https://github.com/francoisromain/leaflet-markers-canvas?tab=readme-ov-file 
- [ ] Add diary cow as animal type
- [ ] Change animal colors for better distinction between cow and pig
- [ ] Change sidebar expand button to close button inside sidebar

#### Company information (KvK)

- Search for companies registered at the KvK near a building on the map
- Determine from the registration information what type of livestock is kept (cattle, pigs, chickens, etc).

API options:

- https://developers.kvk.nl/nl/apis (requires a KvK number)
- https://overheid.io/documentatie/v3/openkvk (may not have the same information as the KvK API, more expensive)

Websites:

- https://www.uittrekselregister.nl/zoekresultaten?q=
- https://www.bedrijvenregister.nl/

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
