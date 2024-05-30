from django import forms
from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse
from django.urls import path
from foodstore.models import *
from django.utils.html import mark_safe

class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'avatar', 'first_name', 'last_name', 'gender', 'email', 'phone_number',
                    'created_date', 'is_active', 'is_staff', 'is_store_owner', 'store']
    search_fields = ['username', 'first_name', 'last_name', 'phone_number', 'email']


class StoreAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_date', 'active', 'average_rating', 'address_line', 'X', 'Y', 'user']
    search_fields = ['name', 'user', 'address_line']

    class Media:
        css = {
            'all': ('/static/css/style.css',)
        }


class ToppingInlineFood(admin.StackedInline):
    model = Topping
    fk_name = 'food'
class FoodAdmin(admin.ModelAdmin):
    list_display = ['name', 'active', 'price', 'average_rating', 'store', 'category']
    inlines = [ToppingInlineFood,]

class SellingTimeAdmin(admin.ModelAdmin):
    list_display = ['name', 'start', 'end']




admin.site.register(Category)
admin.site.register(User, UserAdmin)
admin.site.register(Store, StoreAdmin)
admin.site.register(Food, FoodAdmin)
admin.site.register(SellingTime, SellingTimeAdmin)