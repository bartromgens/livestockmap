# Generated by Django 5.0.7 on 2024-07-25 06:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("building", "0010_company"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="cattle",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="company",
            name="chicken",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="company",
            name="goat",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="company",
            name="pig",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="company",
            name="sheep",
            field=models.BooleanField(default=False),
        ),
    ]
