from django.urls import path, include
from rest_framework.routers import DefaultRouter
from foodstore import views

router = DefaultRouter()
router.register('user', views.UserViewSet)
# POST: /user/ | GET/PUT/PATCH: /user/{pk}

router.register('store', views.StoreViewSet)
# POST: /store/ | GET/PUT/PATCH/DELETE: /store/{pk}


urlpatterns = [
    path('', include(router.urls)),
]