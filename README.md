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

### TODO
- [ ] Limit nearby addresses to the first nearest N (3?) to limit the search for too many companies in case of a populated area.

### Ideas

#### Company information (KvK)
- Search for companies registered at the KvK near a building on the map
- Determine from the registration information what type of livestock is kept (cattle, pigs, chickens, etc).

API options:
- https://developers.kvk.nl/nl/apis (requires a KvK number)
- https://overheid.io/documentatie/v3/openkvk (may not have the same information as the KvK API, more expensive)

Websites:
- https://www.uittrekselregister.nl/zoekresultaten?q=

### Tools

#### Overpas-turbo
Use https://overpass-turbo.eu/ to test OSM queries.

Example query:
```osmquery
[out:json][timeout:25];
way[building]["building"!~"^(house|apartments)$"]({{bbox}});
out geom;
```

#### geojson.io

Use https://geojson.io to test visualizing geojson data on an interactive map.


#### Icons

https://www.vecteezy.com is used to find images and icons with a free license.
