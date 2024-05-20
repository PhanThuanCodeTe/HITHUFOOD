from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import viewsets, generics
from .models import User
from .serializer import *


# Create your views here.

class CreateUserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = CreateUserSerializer