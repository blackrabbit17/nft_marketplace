# Generated by Django 4.0 on 2022-02-16 02:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nft', '0006_alter_nft_network'),
    ]

    operations = [
        migrations.AddField(
            model_name='nft',
            name='on_sale',
            field=models.BooleanField(default=True),
        ),
    ]