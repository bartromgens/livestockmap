from rest_framework import serializers
from rest_framework import viewsets

from building.models import Address
from building.models import Building


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
