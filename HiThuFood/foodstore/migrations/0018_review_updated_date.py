# Generated by Django 5.0.6 on 2024-06-17 05:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('foodstore', '0017_order_address'),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='updated_date',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
