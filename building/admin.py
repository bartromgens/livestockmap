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
    ]


class CompanyAdmin(admin.ModelAdmin):
    list_filter = ["active", "chicken", "pig", "cattle", "sheep", "goat"]
    list_display = [
        "id",
        "address",
        "description",
        "active",
        "chicken",
        "pig",
        "cattle",
        "sheep",
        "goat",
    ]


class TileAdmin(admin.ModelAdmin):
    list_filter = ["complete"]
    list_display = [
        "id",
        "complete",
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
    ]


# Register your models here.
admin.site.register(Building, BuildingAdmin)
admin.site.register(Address, AddressAdmin)
admin.site.register(Company, CompanyAdmin)
admin.site.register(Tile, TileAdmin)
