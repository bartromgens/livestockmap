import logging
import math
import time
from dataclasses import dataclass
from typing import Dict
from typing import List
from typing import Optional

from django.conf import settings
from django.db import models
from django.db.models import Q
from django.db.models import QuerySet
from django.utils.translation import gettext_lazy as _
from pydantic import BaseModel

from company.kvk import ScraperMalfunction
from company.kvk import UittrekselRegisterScraper
from geo.utils import BBox
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


class Tile(models.Model):
    level = models.IntegerField(null=False, db_index=True)
    lon_min = models.FloatField(null=False, db_index=True)
    lon_max = models.FloatField(null=False, db_index=True)
    lat_min = models.FloatField(null=False, db_index=True)
    lat_max = models.FloatField(null=False, db_index=True)
    complete = models.BooleanField(default=False, db_index=True)
    failed = models.BooleanField(default=False, db_index=True)
    error = models.CharField(null=False, default="", max_length=10000, blank=True)
    duration = models.FloatField(null=True)
    building_count = models.IntegerField(null=True)
    company_count = models.IntegerField(null=True)
    datetime_created = models.DateTimeField(auto_now_add=True, null=False)
    datetime_updated = models.DateTimeField(auto_now=True, null=False)

    LEVEL_DEFAULT = 10

    @classmethod
    def from_bbox(cls, bbox: BBox) -> "Tile":
        tile, _created = cls.objects.get_or_create(
            level=cls.LEVEL_DEFAULT,
            lon_min=bbox.lon_min,
            lon_max=bbox.lon_max,
            lat_min=bbox.lat_min,
            lat_max=bbox.lat_max,
        )
        return tile

    def to_bbox(self) -> BBox:
        return BBox(
            lon_min=self.lon_min,
            lon_max=self.lon_max,
            lat_min=self.lat_min,
            lat_max=self.lat_max,
        )


class Address(models.Model):
    node_id = models.BigIntegerField(unique=True, null=False, db_index=True)
    lat = models.FloatField(null=False, db_index=True)
    lon = models.FloatField(null=False, db_index=True)
    street = models.CharField(max_length=200)
    housenumber = models.CharField(max_length=200)
    postcode = models.CharField(max_length=200, null=True)
    city = models.CharField(max_length=200, null=True)
    addresses_nearby_count = models.IntegerField(null=True)

    @property
    def coordinate(self) -> Coordinate:
        return Coordinate(lat=self.lat, lon=self.lon)

    @staticmethod
    def get_or_create_from_node(node) -> Optional["Address"]:
        tags = node["tags"]
        street = tags.get("addr:street")
        housenumber = tags.get("addr:housenumber")
        if street is None or housenumber is None:
            return None
        postcode = tags.get("addr:postcode")
        city = tags.get("addr:city")
        address, _created = Address.objects.update_or_create(
            node_id=node["id"],
            defaults=dict(
                street=street,
                housenumber=housenumber,
                postcode=postcode,
                city=city,
                lat=node["lat"],
                lon=node["lon"],
            ),
        )
        return address

    def __str__(self):
        return f"{self.street} {self.housenumber}, {self.city}"

    def __key(self):
        return self.street, self.housenumber, self.city

    def __hash__(self):
        return hash(self.__key())

    def __eq__(self, other):
        if isinstance(other, Address):
            return self.__key() == other.__key()
        return NotImplemented

    def update_addresses_nearby_count(self):
        nodes = get_address_nearby(self.lat, self.lon, distance=100)
        self.addresses_nearby_count = len(nodes)
        self.save()

    @classmethod
    def update_companies(cls, addresses: List["Address"]) -> List["Company"]:
        companies = []
        # TODO BR: (optionally) only update addresses without related company
        for i, address in enumerate(addresses):
            logger.info(f"finding company for address {i+1}/{len(addresses)}")
            if i % 20 == 0:
                if not UittrekselRegisterScraper.check_is_working():
                    raise ScraperMalfunction("Scraper is not giving expected results!")
            companies_kvk = UittrekselRegisterScraper.get_companies_for_address(
                str(address)
            )
            for c in companies_kvk:
                company, _created = Company.objects.get_or_create(
                    address=address, description=c.description, active=c.active
                )
                companies.append(company)
            # rate limit to prevent unintentional DOS
            time.sleep(settings.KVK_SCRAPE_SLEEP_SEC)
            if (i + 1) % 250 == 0:
                logger.info(f"time to sleep a few minutes")
                time.sleep(60)
        return companies


class Animal(models.TextChoices):
    COW = "COW", _("Cow")
    PIG = "PIG", _("Pig")
    CHICKEN = "CHI", _("Chicken")
    SHEEP = "SHE", _("Sheep")
    GOAT = "GOA", _("Goat")


@dataclass
class AnimalConfig:
    minimal_square_meter_per_animal: float


ANIMAL_CONFIG = {
    None: AnimalConfig(0.8),
    Animal.COW: AnimalConfig(
        1.7
    ),  # https://www.nvwa.nl/onderwerpen/runderen/regels-voor-rundveehouders
    Animal.PIG: AnimalConfig(
        0.8
    ),  # https://www.rvo.nl/onderwerpen/dieren-houden-verkopen-verzorgen/welzijnseisen-varkens
    Animal.CHICKEN: AnimalConfig(
        0.04
    ),  # https://www.rvo.nl/onderwerpen/dieren-houden-verkopen-verzorgen/welzijnseisen-vleeskuikens
    Animal.SHEEP: AnimalConfig(0.6),
    Animal.GOAT: AnimalConfig(0.5),
}


class Company(models.Model):
    description = models.CharField(max_length=5000, null=False)
    active = models.BooleanField(default=True, null=False, db_index=True)
    address = models.ForeignKey(Address, null=False, on_delete=models.CASCADE)
    chicken = models.BooleanField(default=False, null=False, db_index=True)
    pig = models.BooleanField(default=False, null=False, db_index=True)
    cattle = models.BooleanField(default=False, null=False, db_index=True)
    sheep = models.BooleanField(default=False, null=False, db_index=True)
    goat = models.BooleanField(default=False, null=False, db_index=True)
    animal_type_main = models.CharField(max_length=3, choices=Animal, null=True)
    animal_count = models.IntegerField(null=False, default=0)

    @property
    def has_type(self) -> bool:
        return any([self.chicken, self.pig, self.cattle, self.sheep, self.goat])

    @property
    def coordinate(self) -> Coordinate:
        return self.address.coordinate

    @property
    def animal_config(self) -> AnimalConfig:
        return ANIMAL_CONFIG.get(self.animal_type_main)

    @classmethod
    def livestock_companies(cls) -> QuerySet["Company"]:
        return Company.objects.filter(active=True).filter(
            Q(chicken=True) | Q(pig=True) | Q(cattle=True)
        )

    def update(self, save=True):
        self._update_animal_type()
        self._update_animal_count()
        if save:
            self.save()

    @classmethod
    def update_companies(cls, companies: List["Company"]) -> None:
        for i, company in enumerate(companies):
            if i % 100 == 0:
                logger.info(f"determining type for company {i+1}/{len(companies)}")
            company.update(save=True)

    def _update_animal_type(self) -> None:
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
        self.animal_type_main = self._determine_main_type()

    def _determine_main_type(self) -> Animal:
        main_type = None
        if self.chicken:
            main_type = Animal.CHICKEN
        elif self.pig:
            main_type = Animal.PIG
        elif self.cattle:
            main_type = Animal.COW
        elif self.sheep:
            main_type = Animal.SHEEP
        elif self.goat:
            main_type = Animal.GOAT
        return main_type

    def _update_animal_count(self) -> None:
        animal_count = 0
        for building in self.building_set.all():
            animal_count += (
                building.area / self.animal_config.minimal_square_meter_per_animal
            )
        self.animal_count = animal_count


class Building(models.Model):
    way_id = models.BigIntegerField(unique=True, null=False, db_index=True)
    osm_raw = models.JSONField()
    area = models.FloatField(db_index=True)  # in m^2
    length = models.FloatField()  # in m
    width = models.FloatField()  # in m
    lon_min = models.FloatField(db_index=True)
    lon_max = models.FloatField(db_index=True)
    lat_min = models.FloatField(db_index=True)
    lat_max = models.FloatField(db_index=True)
    company = models.ForeignKey(Company, null=True, on_delete=models.SET_NULL)
    addresses_nearby = models.ManyToManyField(Address)
    addresses_nearby_count = models.IntegerField(null=False, default=0)

    MAX_ADDRESSES_NEARBY = 10

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
        building, _created = Building.objects.update_or_create(
            way_id=osm_building.id,
            defaults=dict(
                osm_raw=osm_building.raw,
                lon_min=osm_building.raw["bounds"]["minlon"],
                lon_max=osm_building.raw["bounds"]["maxlon"],
                lat_min=osm_building.raw["bounds"]["minlat"],
                lat_max=osm_building.raw["bounds"]["maxlat"],
                area=osm_building.area_square_meters,
                length=length,
                width=width,
            ),
        )
        return building

    def update_company(self, save=True):
        for address in self.addresses_nearby.all():
            companies = Company.livestock_companies()
            companies = companies.filter(address=address)
            if companies:
                # TODO BR: what if there are more companies found?
                self.company = companies[0]
                break
        if save:
            self.save()

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
            addresses_nearby = [a for a in addresses_nearby if a is not None]
            addresses_nearby = cls.filter_nearest(
                building, addresses_nearby, limit=limit
            )
            building.addresses_nearby_count = len(nodes)
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
