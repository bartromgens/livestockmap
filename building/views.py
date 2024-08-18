from dataclasses import dataclass

from rest_framework import serializers
from rest_framework import viewsets

from building.models import Address
from building.models import Building
from building.models import Company


@dataclass
class BBox:
    lon_min: float
    lon_max: float
    lat_min: float
    lat_max: float

    @classmethod
    def parse_bbox(cls, bbox_str) -> "BBox":
        values = bbox_str.split(",")
        assert len(values) == 4
        return BBox(
            lon_min=values[0], lat_min=values[1], lon_max=values[2], lat_max=values[3]
        )


class AddressSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Address
        fields = [
            "node_id",
            "street",
            "housenumber",
            "postcode",
            "city",
            "lat",
            "lon",
        ]


class CompanySerializer(serializers.HyperlinkedModelSerializer):
    address = AddressSerializer(many=False, read_only=True)

    class Meta:
        model = Company
        fields = [
            "id",
            "description",
            "active",
            "address",
            "chicken",
            "pig",
            "cattle",
            "sheep",
            "goat",
        ]


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.filter(active=True)
    serializer_class = CompanySerializer

    def get_queryset(self):
        queryset = self.queryset
        bbox_str = self.request.query_params.get("bbox")
        # bbox = min longitude, min latitude, max longitude, max latitude
        if bbox_str is not None:
            bbox = BBox.parse_bbox(bbox_str)
            queryset = (
                queryset.filter(address__lon__gt=bbox.lon_min)
                .filter(address__lon__lt=bbox.lon_max)
                .filter(address__lat__gt=bbox.lat_min)
                .filter(address__lat__lt=bbox.lat_max)
            )
        return queryset.prefetch_related("address")


class BuildingSerializer(serializers.HyperlinkedModelSerializer):
    addresses_nearby = AddressSerializer(many=True, read_only=True)

    class Meta:
        model = Building
        fields = [
            "id",
            "way_id",
            "area",
            "length",
            "width",
            "tags",
            "geometry",
            "addresses_nearby",
            "lon_min",
            "lon_max",
            "lat_min",
            "lat_max",
        ]


class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer

    def get_queryset(self):
        queryset = self.queryset
        bbox_str = self.request.query_params.get("bbox")
        # bbox = min longitude, min latitude, max longitude, max latitude
        if bbox_str is not None:
            bbox = BBox.parse_bbox(bbox_str)
            queryset = (
                queryset.filter(lon_min__gt=bbox.lon_min)
                .filter(lon_max__lt=bbox.lon_max)
                .filter(lat_min__gt=bbox.lat_min)
                .filter(lat_max__lt=bbox.lat_max)
            )
        return queryset.prefetch_related("addresses_nearby")
