from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    avatar = models.ImageField(upload_to='uploads/%Y/%m/%d/')
    phone = models.CharField(max_length=10, blank=False, null=False, unique=True)


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    house_number = models.CharField(max_length=50, blank=True, unique=True)
    street = models.CharField(max_length=50, blank=True, unique=True)
    ward = models.CharField(max_length=50, blank=False, unique=False)
    district = models.CharField(max_length=50, blank=False, unique=False)
    province = models.CharField(max_length=50, blank=False, unique=False)


class Category(models.Model):
    name = models.CharField(null=False, unique=True, max_length=10)


class Store(models.Model):
    name = models.CharField(null=False, unique=True, max_length=255)
    address = models.CharField(null=False, unique=True, max_length=255)
    avatar = models.ImageField(upload_to='uploads/%Y/%m/%d/', null=False, blank=False)
    wallpaper = models.ImageField(upload_to='uploads/%Y/%m/%d/', null=False, blank=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE)
    following = models.ForeignKey(Store, on_delete=models.CASCADE)


class food(models.Model):
    name = models.CharField(null=False, unique=False, max_length=255)
    image = models.ImageField(upload_to='uploads/%Y/%m/%d/', null=False, blank=False)
    status = models.BooleanField(default=True, null=False, blank=False)
    discription = models.TextField(null=True, blank=True)