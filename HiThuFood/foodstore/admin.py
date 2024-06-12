from django import forms
from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path
from foodstore.models import *
from django.utils.html import mark_safe


class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'id', 'first_name', 'last_name', 'gender', 'email', 'phone_number',
                    'created_date', 'is_active', 'is_staff', 'is_store_owner', 'store']
    search_fields = ['username', 'first_name', 'last_name', 'phone_number', 'email']


class StoreAdmin(admin.ModelAdmin):
    list_display = ['name', 'id', 'created_date', 'active', 'average_rating', 'address_line', 'X', 'Y', 'user']
    search_fields = ['name', 'user', 'address_line']

    class Media:
        css = {
            'all': ('/static/css/style.css',)
        }


class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'id']


class ToppingInlineFood(admin.StackedInline):
    model = Topping
    fk_name = 'food'


class FoodAdmin(admin.ModelAdmin):
    list_display = ['name', 'id', 'active', 'price', 'average_rating', 'store']
    inlines = [ToppingInlineFood,]


class SellingTimeAdmin(admin.ModelAdmin):
    list_display = ['name', 'start', 'end']


class AddressAdmin(admin.ModelAdmin):
    list_display = ['id', 'address_line', 'X', 'Y', 'user']


class FollowAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'store', 'followed_at']


admin.site.register(Category, CategoryAdmin)
admin.site.register(User, UserAdmin)
admin.site.register(Store, StoreAdmin)
admin.site.register(Food, FoodAdmin)
admin.site.register(Address, AddressAdmin)
admin.site.register(SellingTime, SellingTimeAdmin)
admin.site.register(UserFollowedStore, FollowAdmin)
