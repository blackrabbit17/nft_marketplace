# Generated by Django 4.0 on 2022-01-16 22:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('news', '0004_newspost_author'),
    ]

    operations = [
        migrations.AddField(
            model_name='newspost',
            name='category',
            field=models.TextField(blank=True, default=None, null=True),
        ),
    ]
