# Generated by Django 5.0.7 on 2024-08-18 18:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("building", "0016_tile_duration"),
    ]

    operations = [
        migrations.AddField(
            model_name="tile",
            name="building_count",
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name="tile",
            name="company_count",
            field=models.IntegerField(null=True),
        ),
    ]
