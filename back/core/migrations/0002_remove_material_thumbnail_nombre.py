# Generated by Django 5.2.4 on 2025-07-22 18:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='material',
            name='thumbnail_nombre',
        ),
    ]
