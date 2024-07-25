from typing import Dict
from typing import List

from django.db import models
from pydantic import BaseModel

from osm.building import Building as OSMBuilding


class Coordinate(BaseModel):
    lat: float
    lon: float


class Address(models.Model):
    node_id = models.IntegerField(unique=True, null=False, db_index=True)
    lat = models.FloatField(null=False)
    lon = models.FloatField(null=False)
    street = models.CharField(max_length=200)
    housenumber = models.CharField(max_length=200)
    postcode = models.CharField(max_length=200, null=True)
    city = models.CharField(max_length=200, null=True)

    @staticmethod
    def get_or_create_from_node(node) -> "Address":
        tags = node["tags"]
        street = tags.get("addr:street")
        housenumber = tags.get("addr:housenumber")
        postcode = tags.get("addr:postcode")
        city = tags.get("addr:city")
        address, _created = Address.objects.get_or_create(
            node_id=node["id"],
            street=street,
            housenumber=housenumber,
            postcode=postcode,
            city=city,
            lat=node["lat"],
            lon=node["lon"],
        )
        return address

    def __str__(self):
        return f"{self.street} {self.housenumber}, {self.city}"


class Company(models.Model):
    description = models.CharField(max_length=2000, null=False)
    active = models.BooleanField(default=True, null=False)
    address = models.ForeignKey(Address, null=False, on_delete=models.CASCADE)
    chicken = models.BooleanField(default=False, null=False)
    pig = models.BooleanField(default=False, null=False)
    cattle = models.BooleanField(default=False, null=False)
    sheep = models.BooleanField(default=False, null=False)
    goat = models.BooleanField(default=False, null=False)

    @property
    def has_type(self) -> bool:
        return any([self.chicken, self.pig, self.cattle, self.sheep, self.goat])

    def update_type(self) -> None:
        cattle_words = ["melkvee", "rundvee", "kalveren"]
        chicken_words = ["pluimvee", "kippen", "kuikens", "hennen"]
        pig_words = ["varken", "zeug"]
        sheep_words = ["schaap", "schapen"]
        goat_words = ["geit"]
        description = self.description.lower()
        self.cattle = any(word in description for word in cattle_words)
        self.chicken = any(word in description for word in chicken_words)
        self.pig = any(word in description for word in pig_words)
        self.sheep = any(word in description for word in sheep_words)
        self.goat = any(word in description for word in goat_words)


class Building(models.Model):
    way_id = models.IntegerField(unique=True, null=False, db_index=True)
    osm_raw = models.JSONField()
    area = models.FloatField()  # in m^2
    length = models.FloatField()  # in m
    width = models.FloatField()  # in m
    lon_min = models.FloatField()
    lon_max = models.FloatField()
    lat_min = models.FloatField()
    lat_max = models.FloatField()
    addresses_nearby = models.ManyToManyField(Address)

    @property
    def geometry(self) -> List[Dict[str, float]]:
        return self.osm_raw["geometry"]

    @property
    def center(self) -> Coordinate:
        lat = abs(self.lat_max - self.lat_min) / 2 + self.lat_min
        lon = abs(self.lon_max - self.lon_min) / 2 + self.lon_min
        return Coordinate(lat=lat, lon=lon)

    @property
    def tags(self) -> Dict[str, str]:
        return self.osm_raw["tags"]

    @classmethod
    def create_from_osm(cls, osm_building: OSMBuilding) -> "Building":
        length, width = osm_building.length_width
        return Building.objects.create(
            way_id=osm_building.id,
            osm_raw=osm_building.raw,
            lon_min=osm_building.raw["bounds"]["minlon"],
            lon_max=osm_building.raw["bounds"]["maxlon"],
            lat_min=osm_building.raw["bounds"]["minlat"],
            lat_max=osm_building.raw["bounds"]["maxlat"],
            area=osm_building.area_square_meters,
            length=length,
            width=width,
        )
