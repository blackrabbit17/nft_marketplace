# Generated by Django 4.0 on 2022-02-09 04:16

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('nft', '0004_nft_pending_itemactivity_nftitemactivity_wallet_from_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='nft',
            name='creator',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='creator', to='auth.user'),
        ),
    ]
