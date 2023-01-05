# Generated by Django 4.0 on 2022-02-03 07:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nft', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='nftvoucher',
            name='min_price',
            field=models.DecimalField(blank=True, decimal_places=0, default=None, max_digits=64, null=True),
        ),
        migrations.AddField(
            model_name='nftvoucher',
            name='token_id',
            field=models.BigIntegerField(blank=True, default=None, null=True),
        ),
        migrations.AddField(
            model_name='nftvoucher',
            name='uri',
            field=models.TextField(blank=True, default=None, null=True),
        ),
    ]