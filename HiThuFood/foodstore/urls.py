from django.urls import path, include
from rest_framework.routers import DefaultRouter
from foodstore import views

router = DefaultRouter()
router.register('user', views.UserViewSet)
router.register('store', views.StoreViewSet)
router.register('address', views.AddressViewSet)

urlpatterns = [
    path('', include(router.urls)),
]