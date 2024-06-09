# Generated by Django 5.0.6 on 2024-06-09 19:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("building", "0003_rename_geometry_raw_building_osm_raw"),
    ]

    operations = [
        migrations.AddField(
            model_name="building",
            name="area",
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="building",
            name="length",
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="building",
            name="width",
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
    ]
