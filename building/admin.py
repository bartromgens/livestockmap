from django.contrib import admin

from building.models import Address
from building.models import Building
from building.models import Company
from building.models import Tile


class BuildingAdmin(admin.ModelAdmin):
    list_display = [
        "way_id",
        "area",
        "width",
        "length",
        "company",
        "addresses_nearby_count",
        "get_addresses_nearby",
    ]

    def get_addresses_nearby(self, obj):
        return "; ".join([str(address) for address in obj.addresses_nearby.all()])


class AddressAdmin(admin.ModelAdmin):
    list_display = [
        "node_id",
        "street",
        "housenumber",
        "postcode",
        "city",
        "lat",
        "lon",
        "addresses_nearby_count",
    ]


class CompanyAdmin(admin.ModelAdmin):
    list_filter = [
        "active",
        "animal_type_main",
        "chicken",
        "pig",
        "cattle",
        "sheep",
        "goat",
    ]
    list_display = [
        "id",
        "address",
        "description",
        "active",
        "animal_type_main",
        "animal_count",
        "chicken",
        "pig",
        "cattle",
        "sheep",
        "goat",
    ]


class TileAdmin(admin.ModelAdmin):
    list_filter = ["complete", "failed"]
    list_display = [
        "id",
        "complete",
        "failed",
        "level",
        "lon_min",
        "lon_max",
        "lat_min",
        "lat_max",
        "datetime_created",
        "datetime_updated",
        "duration",
        "building_count",
        "company_count",
        "error",
    ]


# Register your models here.
admin.site.register(Building, BuildingAdmin)
admin.site.register(Address, AddressAdmin)
admin.site.register(Company, CompanyAdmin)
admin.site.register(Tile, TileAdmin)
