import json
from unittest import TestCase

from geo.utils import BBox
from osm.building import get_address_nearby
from osm.building import get_buildings_batches


class TestGetAddressNearby(TestCase):

    def test_get_address_nodes_nearby(self):
        lat = 52.0988864
        lon = 5.5681605
        distance = 100
        nodes = get_address_nearby(lat, lon, distance)
        self.assertEqual(len(nodes), 3)

    def test_get_address_nodes_nearby_belgium(self):
        lat = 51.0874
        lon = 3.448
        distance = 100
        nodes = get_address_nearby(lat, lon, distance)
        self.assertEqual(len(nodes), 12)


class TestGetBuildings(TestCase):

    def test_get_buildings(self):
        bbox = BBox(
            lat_min=51.85313692843858,
            lon_min=6.493391839225318,
            lat_max=51.86140663964038,
            lon_max=6.500762549598242,
        )
        buildings = get_buildings_batches(bbox)
        self.assertGreater(len(buildings), 8)
        self.assertLessEqual(len(buildings), 20)
