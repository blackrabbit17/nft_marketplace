# Generated by Django 4.0 on 2022-02-14 06:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nft', '0005_nft_creator'),
    ]

    operations = [
        migrations.AlterField(
            model_name='nft',
            name='network',
            field=models.IntegerField(choices=[(1, 'Ethereum'), (2, 'Binance Smart Chain'), (3, 'Polygon'), (4, 'xDai'), (5, 'Development EVM')], default=1),
        ),
    ]
