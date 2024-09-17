from django.test import TestCase

from building.create import BuildingFactory
from building.models import Building
from building.models import Company
from geo.utils import BBox


class BuildingFactoryTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        text_bbox = BBox(
            lat_min=52.092612, lon_min=5.5628603, lat_max=52.094612, lon_max=5.5728603
        )
        BuildingFactory.create_for_bbox(text_bbox)

    @property
    def buildings(self):
        return Building.objects.all()

    def test_building_company_count(self):
        self.assertEqual(self.buildings.count(), 8)
        self.assertEqual(Company.objects.all().count(), 28)

    def test_building_area_width_length(self):
        buildings = sorted(self.buildings, key=lambda b: b.area, reverse=True)
        building_largest = buildings[0]
        self.assertEqual(building_largest.area, 2010.3198927871526)
        self.assertEqual(building_largest.width, 23.62333423088129)
        self.assertEqual(building_largest.length, 87.11061224621811)
