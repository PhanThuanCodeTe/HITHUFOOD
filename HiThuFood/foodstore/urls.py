from django.urls import path, include
from rest_framework.routers import DefaultRouter
from foodstore import views

router = DefaultRouter()
router.register('create-user', views.CreateUserViewSet)
urlpatterns = [
    path('', include(router.urls)),
]