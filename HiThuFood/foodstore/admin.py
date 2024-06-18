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
    list_display = ['name', 'id', 'start', 'end']


class AddressAdmin(admin.ModelAdmin):
    list_display = ['id', 'address_line', 'X', 'Y', 'user']


class FollowAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'store', 'followed_at']


class ToppingAdmin(admin.ModelAdmin):
    list_display = ['name', 'id', 'price', 'food']


class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'users', 'stores', 'rating', 'created_date', 'updated_date']


class OrderItemInlineAdmin(admin.StackedInline):
    model = OrderItem
    fk_name = 'order'


class OrderAdmin(admin.ModelAdmin):
    list_display = ['user', 'store', 'id', 'status', 'order_date', 'shipping_fee', 'total']
    inlines = [OrderItemInlineAdmin, ]


class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'food', 'rating', 'created_date', 'updated_date']


class HithuAdminSite(admin.AdminSite):
    site_header = "Quản lý HiThuFood"
    site_title = "HiThuFood Admin"
    index_title = "Chào mừng đến với HiThuFood Admin"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('revenue/', self.revenue_view),
        ]
        return custom_urls + urls

    def revenue_view(self, request):
        return TemplateResponse(request, template='admin/revenue.html')


hithu_admin = HithuAdminSite(name='custom_admin')


hithu_admin.register(Category, CategoryAdmin)
hithu_admin.register(User, UserAdmin)
hithu_admin.register(Store, StoreAdmin)
hithu_admin.register(Food, FoodAdmin)
hithu_admin.register(Address, AddressAdmin)
hithu_admin.register(SellingTime, SellingTimeAdmin)
hithu_admin.register(UserFollowedStore, FollowAdmin)
hithu_admin.register(Topping, ToppingAdmin)
hithu_admin.register(Comment, CommentAdmin)
hithu_admin.register(Order, OrderAdmin)
hithu_admin.register(Review, ReviewAdmin)
