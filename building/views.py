from rest_framework import serializers
from rest_framework import viewsets

from building.models import Building


class BuildingSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Building
        fields = ["url", "way_id", "area", "length", "width"]


class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
