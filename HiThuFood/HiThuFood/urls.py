from django.contrib import admin
from django.urls import path, include, re_path

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from foodstore.admin import hithu_admin

#swagger
schema_view = get_schema_view(
    openapi.Info(
        title= 'HithuFood API',
        default_version= 'v1',
        description= 'APIs for HithuFood',
        contact=openapi.Contact(email='hieucuteom@gmail.com'),
        license=openapi.License(name='Duong Hi@2024'),
    ),
    public=True,
    permission_classes=[permissions.AllowAny,],
)

urlpatterns = [
    path('', include('foodstore.urls')),
    path('admin/', hithu_admin.urls),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),

    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc')
]
