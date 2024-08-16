import logging
import math
import time
from typing import Dict
from typing import List

from django.db import models
from pydantic import BaseModel

from company.kvk import get_companies_for_address
from osm.building import OSMBuilding
from osm.building import get_address_nearby


logger = logging.getLogger(__name__)


class Coordinate(BaseModel):
    lat: float
    lon: float

    def distance_to(self, coordinate: "Coordinate") -> float:
        return self.distance(self, coordinate)

    @classmethod
    def to_radians(cls, degrees: float) -> float:
        return degrees * (math.pi / 180)

    @classmethod
    def distance(cls, coord1: "Coordinate", coord2: "Coordinate") -> float:
        """
        The haversine distance between two coordinates
        """
        R = 6371 * 1000  # Radius of the Earth in meters

        dLat = cls.to_radians(coord2.lat - coord1.lat)
        dLon = cls.to_radians(coord2.lon - coord1.lon)
        rLat1 = cls.to_radians(coord1.lat)
        rLat2 = cls.to_radians(coord2.lat)

        a = math.sin(dLat / 2) * math.sin(dLat / 2) + math.sin(dLon / 2) * math.sin(
            dLon / 2
        ) * math.cos(rLat1) * math.cos(rLat2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c


class Address(models.Model):
    node_id = models.IntegerField(unique=True, null=False, db_index=True)
    lat = models.FloatField(null=False, db_index=True)
    lon = models.FloatField(null=False, db_index=True)
    street = models.CharField(max_length=200)
    housenumber = models.CharField(max_length=200)
    postcode = models.CharField(max_length=200, null=True)
    city = models.CharField(max_length=200, null=True)

    @property
    def coordinate(self) -> Coordinate:
        return Coordinate(lat=self.lat, lon=self.lon)

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

    @classmethod
    def update_companies(cls, addresses: List["Address"]) -> List["Company"]:
        companies = []
        # TODO BR: (optionally) only update addresses without related company
        for i, address in enumerate(addresses):
            logger.info(f"finding company for address {i+1}/{len(addresses)}")
            companies_kvk = get_companies_for_address(str(address))
            for c in companies_kvk:
                company, _created = Company.objects.get_or_create(
                    address=address, description=c.description, active=c.active
                )
                companies.append(company)
            time.sleep(0.2)  # rate limit to prevent unintentional DOS
        return companies


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

    @property
    def coordinate(self) -> Coordinate:
        return self.address.coordinate

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

    @classmethod
    def update_types(cls, companies: List["Company"]) -> None:
        for i, company in enumerate(companies):
            logger.info(f"determining type for company {i+1}/{len(companies)}")
            company.update_type()
            company.save()


class Building(models.Model):
    way_id = models.IntegerField(unique=True, null=False, db_index=True)
    osm_raw = models.JSONField()
    area = models.FloatField(db_index=True)  # in m^2
    length = models.FloatField()  # in m
    width = models.FloatField()  # in m
    lon_min = models.FloatField(db_index=True)
    lon_max = models.FloatField(db_index=True)
    lat_min = models.FloatField(db_index=True)
    lat_max = models.FloatField(db_index=True)
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
        building, _created = Building.objects.get_or_create(
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
        return building

    @classmethod
    def update_nearby_addresses(
        cls, buildings: List["Building"], limit=5
    ) -> List[Address]:
        addresses = []
        for i, building in enumerate(buildings):
            logger.info(f"finding address for building {i+1}/{len(buildings)}")
            nodes = get_address_nearby(
                building.center.lat, building.center.lon, distance=100
            )
            if len(nodes) == 0:
                nodes = get_address_nearby(
                    building.center.lat, building.center.lon, distance=200
                )
            addresses_nearby = [Address.get_or_create_from_node(node) for node in nodes]
            addresses_nearby = cls.filter_nearest(
                building, addresses_nearby, limit=limit
            )
            building.addresses_nearby.set(addresses_nearby)
            building.save()
            addresses += addresses_nearby
        return addresses

    @classmethod
    def filter_nearest(
        cls, building, addresses: List[Address], limit=5
    ) -> List[Address]:
        count = min(limit, len(addresses))
        return sorted(
            addresses,
            key=lambda a: a.coordinate.distance_to(building.center),
        )[:count]
