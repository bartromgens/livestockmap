from django.contrib import admin

from building.models import Address
from building.models import Building


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
        "street",
        "housenumber",
        "postcode",
        "city",
    ]


# Register your models here.
admin.site.register(Building, BuildingAdmin)
admin.site.register(Address, AddressAdmin)
