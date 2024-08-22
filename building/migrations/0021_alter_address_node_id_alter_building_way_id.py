# Generated by Django 5.0.7 on 2024-08-21 19:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("building", "0020_address_addresses_nearby_count"),
    ]

    operations = [
        migrations.AlterField(
            model_name="address",
            name="node_id",
            field=models.BigIntegerField(db_index=True, unique=True),
        ),
        migrations.AlterField(
            model_name="building",
            name="way_id",
            field=models.BigIntegerField(db_index=True, unique=True),
        ),
    ]
