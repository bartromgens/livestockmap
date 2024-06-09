from django.contrib import admin

from building.models import Building


class BuildingAdmin(admin.ModelAdmin):
    list_display = [
        "way_id",
        "area",
        "width",
        "length",
    ]


# Register your models here.
admin.site.register(Building, BuildingAdmin)
