import calendar
from collections import defaultdict
from datetime import datetime

from django import forms
from django.contrib import admin
from django.db.models import Count, Sum
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
        # Lấy dữ liệu thống kê
        current_year = datetime.now().year
        user_store = Store.objects.filter(user=request.user).first()
        store_start_year = user_store.created_date.year

        # Lấy năm được chọn từ request.GET hoặc sử dụng năm hiện tại nếu không có
        selected_year = request.GET.get('yearSelect', str(current_year))

        # Lấy tất cả đơn hàng của cửa hàng
        all_orders = Order.objects.filter(store=user_store)

        # Tính toán dữ liệu cho biểu đồ hàng tháng
        monthly_data = [0] * 12
        for order in all_orders:
            month = order.order_date.month - 1
            year = order.order_date.year
            if str(year) == selected_year:
                monthly_data[month] += order.total

        monthly_labels = [calendar.month_name[i] for i in range(1, 13)]

        # Tính toán dữ liệu cho biểu đồ hàng quý
        quarterly_data = [0] * 4
        for order in all_orders:
            quarter = (order.order_date.month - 1) // 3
            year = order.order_date.year
            if str(year) == selected_year:
                quarterly_data[quarter] += order.total

        quarterly_labels = [f'Quý {i}' for i in range(1, 5)]

        # Tính toán dữ liệu cho biểu đồ hàng năm
        yearly_revenue = defaultdict(int)
        for order in all_orders:
            year = order.order_date.year
            yearly_revenue[year] += order.total

        yearly_labels = sorted(yearly_revenue.keys())
        yearly_data = [yearly_revenue[year] for year in yearly_labels]

        # Lấy danh sách các năm có sẵn
        available_years = range(store_start_year, current_year + 1)

        context = {
            'monthly_labels': monthly_labels,
            'monthly_data': monthly_data,
            'quarterly_labels': quarterly_labels,
            'quarterly_data': quarterly_data,
            'yearly_labels': yearly_labels,
            'yearly_data': yearly_data,
            'current_year': current_year,
            'available_years': available_years,
            'selected_year': selected_year,
        }
        return TemplateResponse(request, 'admin/revenue.html', context)

    # def revenue_view(self, request):
    #     # Lấy dữ liệu thống kê
    #     current_year = datetime.now().year
    #     user_store = Store.objects.filter(user=request.user).first()
    #
    #     # Lấy tất cả đơn hàng của cửa hàng
    #     all_orders = Order.objects.filter(store=user_store)
    #
    #     # Tính toán dữ liệu cho biểu đồ hàng tháng
    #     monthly_data = [0] * 12
    #     for order in all_orders:
    #         month = order.order_date.month - 1
    #         year = order.order_date.year
    #         if year == current_year:
    #             monthly_data[month] += order.total
    #
    #     monthly_labels = [calendar.month_name[i] for i in range(1, 13)]
    #
    #     # Tính toán dữ liệu cho biểu đồ hàng quý
    #     quarterly_data = [0] * 4
    #     for order in all_orders:
    #         quarter = (order.order_date.month - 1) // 3
    #         year = order.order_date.year
    #         if year == current_year:
    #             quarterly_data[quarter] += order.total
    #
    #     quarterly_labels = [f'Quý {i}' for i in range(1, 5)]
    #
    #     # Tính toán dữ liệu cho biểu đồ hàng năm
    #     yearly_revenue = defaultdict(int)
    #     for order in all_orders:
    #         year = order.order_date.year
    #         yearly_revenue[year] += order.total
    #
    #     yearly_labels = sorted(yearly_revenue.keys())
    #     yearly_data = [yearly_revenue[year] for year in yearly_labels]
    #
    #     context = {
    #         'monthly_labels': monthly_labels,
    #         'monthly_data': monthly_data,
    #         'quarterly_labels': quarterly_labels,
    #         'quarterly_data': quarterly_data,
    #         'yearly_labels': yearly_labels,
    #         'yearly_data': yearly_data,
    #         'current_year': current_year,
    #     }
    #     return TemplateResponse(request, 'admin/revenue.html', context)


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
