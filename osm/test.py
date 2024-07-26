from unittest import TestCase

from osm.building import get_address_nearby


class TestGetAddressNearby(TestCase):

    def test_get_address_nodes_nearby(self):
        lat = 52.0988864
        lon = 5.5681605
        distance = 100
        nodes = get_address_nearby(lat, lon, distance)
        self.assertEqual(len(nodes), 3)
