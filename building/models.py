from typing import Dict
from typing import List

from django.db import models

from osm.building import Building as OSMBuilding


class Building(models.Model):
    way_id = models.IntegerField(unique=True, null=False)
    osm_raw = models.JSONField()
    area = models.FloatField()  # in m^2
    length = models.FloatField()  # in m
    width = models.FloatField()  # in m
    lon_min = models.FloatField()
    lon_max = models.FloatField()
    lat_min = models.FloatField()
    lat_max = models.FloatField()

    @property
    def geometry(self) -> List[Dict[str, float]]:
        return self.osm_raw["geometry"]

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
