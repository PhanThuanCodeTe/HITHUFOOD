# Generated by Django 5.0.6 on 2024-05-31 04:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('foodstore', '0002_remove_useraddress_user_store_x_store_y_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='food',
            name='name',
            field=models.CharField(max_length=255),
        ),
    ]