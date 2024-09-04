from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import serializers
from rest_framework import viewsets

from building.models import Address
from building.models import Tile
from geo.utils import BBox
from building.models import Building
from building.models import Company


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
    queryset = Company.livestock_companies()
    serializer_class = CompanySerializer

    @method_decorator(cache_page(60 * 5))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

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
        queryset = self.queryset.filter(company__isnull=False).filter(
            addresses_nearby_count__lte=Building.MAX_ADDRESSES_NEARBY
        )
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


class TileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Tile
        fields = [
            "id",
            "level",
            "lon_min",
            "lon_max",
            "lat_min",
            "lat_max",
            "complete",
            "failed",
        ]


class TileViewSet(viewsets.ModelViewSet):
    queryset = Tile.objects.all()
    serializer_class = TileSerializer
