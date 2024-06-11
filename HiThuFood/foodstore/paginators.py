from rest_framework import pagination


class FoodPaginator(pagination.PageNumberPagination):
    page_size = 10
