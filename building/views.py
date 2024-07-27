from rest_framework import serializers
from rest_framework import viewsets

from building.models import Address
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
    queryset = Company.objects.filter(active=True)
    serializer_class = CompanySerializer


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
