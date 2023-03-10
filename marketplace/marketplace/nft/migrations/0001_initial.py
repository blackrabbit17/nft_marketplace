# Generated by Django 4.0 on 2022-02-03 03:35

from django.db import migrations, models
import django.db.models.deletion
import django_quill.fields
import nft.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='ContractTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField()),
                ('created_at', models.DateTimeField()),
                ('content', django_quill.fields.QuillField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='ContractTemplatePlaceholder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('marker', models.TextField()),
                ('data_type', models.IntegerField(choices=[(0, 'String'), (1, 'Datetime'), (2, 'Numeric')])),
                ('description', models.TextField(blank=True, default=None, null=True)),
                ('default_value', models.TextField(blank=True, default=None, null=True)),
                ('contract', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nft.contracttemplate')),
            ],
        ),
        migrations.CreateModel(
            name='NFT',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('title', models.TextField(blank=True, default=None, null=True)),
                ('description', models.TextField(blank=True, default=None, null=True)),
                ('network', models.IntegerField(choices=[(1, 'Ethereum'), (2, 'Binance Smart Chain'), (3, 'Polygon'), (4, 'xDai'), (5, 'Staging EVM')], default=1)),
                ('currency', models.TextField(blank=True, db_index=True, null=True)),
                ('price', models.DecimalField(blank=True, db_index=True, decimal_places=0, default=None, max_digits=64, null=True)),
                ('royalties', models.FloatField(default=0)),
                ('auction_type', models.IntegerField(blank=True, default=None, null=True)),
                ('auction_end', models.BigIntegerField(blank=True, default=None, null=True)),
                ('image_preview', models.TextField(blank=True, default=None, null=True)),
                ('likes_count', models.IntegerField(default=0)),
                ('canonical_uuid', models.TextField(blank=True, db_index=True, default=None, null=True)),
            ],
            bases=(models.Model, nft.models.BlockchainStatusMixin, nft.models.CurrencyFormatterMixin),
        ),
        migrations.CreateModel(
            name='NFTCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('short_ident', models.TextField(unique=True)),
                ('description', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='NFTFav',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('faved_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('nft', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nft.nft')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.user')),
            ],
        ),
        migrations.CreateModel(
            name='NFTVoucher',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('signature', models.TextField()),
                ('nft', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nft.nft')),
            ],
        ),
        migrations.CreateModel(
            name='NFTView',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('viewed_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('nft', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nft.nft')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.user')),
            ],
        ),
        migrations.CreateModel(
            name='NFTTransfer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('blockchain_tx', models.TextField(blank=True, default=None, null=True)),
                ('blockchain_status', models.IntegerField(blank=True, choices=[(0, 'Pending'), (1, 'Submitted'), (2, 'Confirmed')], default=None, null=True)),
                ('nft', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nft.nft')),
                ('source_owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transfer_source_owner', to='auth.user')),
                ('target_owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transfer_target_owner', to='auth.user')),
            ],
            bases=(models.Model, nft.models.BlockchainStatusMixin),
        ),
        migrations.CreateModel(
            name='NFTSale',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('price', models.DecimalField(decimal_places=0, max_digits=64)),
                ('currency', models.TextField(blank=True, db_index=True, null=True)),
                ('blockchain_tx', models.TextField(blank=True, default=None, null=True)),
                ('blockchain_status', models.IntegerField(blank=True, choices=[(0, 'Pending'), (1, 'Submitted'), (2, 'Confirmed')], default=None, null=True)),
                ('nft', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nft.nft')),
                ('source_owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sale_source_owner', to='auth.user')),
                ('target_owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sale_target_owner', to='auth.user')),
            ],
            bases=(models.Model, nft.models.BlockchainStatusMixin, nft.models.CurrencyFormatterMixin),
        ),
        migrations.CreateModel(
            name='NFTOffer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('price', models.DecimalField(decimal_places=0, max_digits=64)),
                ('currency', models.TextField(blank=True, db_index=True, null=True)),
                ('nft', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nft.nft')),
                ('offered_by', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='auth.user')),
            ],
            bases=(models.Model, nft.models.CurrencyFormatterMixin),
        ),
        migrations.CreateModel(
            name='NFTItemActivity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('activity_type', models.IntegerField(choices=[(1, 'Mint'), (4, 'Offer'), (5, 'Favourite'), (6, 'Follow')], db_index=True)),
                ('price', models.DecimalField(blank=True, db_index=True, decimal_places=0, default=None, max_digits=64, null=True)),
                ('blockchain_tx', models.TextField(blank=True, default=None, null=True)),
                ('blockchain_tx_status', models.IntegerField(blank=True, choices=[(0, 'Pending'), (1, 'Submitted'), (2, 'Confirmed')], null=True)),
                ('linked_fav', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='nft.nftfav')),
                ('linked_offer', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='nft.nftoffer')),
                ('nft', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='nft.nft')),
                ('user_from', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='user_from', to='auth.user')),
                ('user_to', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='user_to', to='auth.user')),
            ],
            bases=(models.Model, nft.models.BlockchainStatusMixin),
        ),
        migrations.CreateModel(
            name='NFTInCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nft', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nft.nft')),
                ('nft_category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nft.nftcategory')),
            ],
        ),
        migrations.CreateModel(
            name='NFTCollection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('description', models.TextField(blank=True, default=None, null=True)),
                ('website', models.TextField(blank=True, default=None, null=True)),
                ('discord', models.TextField(blank=True, default=None, null=True)),
                ('twitter', models.TextField(blank=True, default=None, null=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.user')),
            ],
        ),
        migrations.AddField(
            model_name='nft',
            name='collection',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='nft.nftcollection'),
        ),
        migrations.AddField(
            model_name='nft',
            name='contract_template',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='nft.contracttemplate'),
        ),
        migrations.AddField(
            model_name='nft',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.user'),
        ),
        migrations.CreateModel(
            name='ContractVariable',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value_str', models.TextField(blank=True, default=None, null=True)),
                ('value_datetime', models.DateTimeField(blank=True, default=None, null=True)),
                ('value_numeric', models.DecimalField(blank=True, decimal_places=0, default=None, max_digits=64, null=True)),
                ('nft', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nft.nft')),
                ('template_placeholder', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='nft.contracttemplateplaceholder')),
            ],
        ),
    ]
