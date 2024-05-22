from rest_framework.serializers import ModelSerializer
from .models import *

class ItemSerializer(ModelSerializer):
    def to_representation(self, instance):
        req = super().to_representation(instance)
        req['image'] = instance.image.url
        return req

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'password', 'gender', 'email', 'phone_number', 'avatar']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])  # mã hóa trường password
        user.save()  # lưu vào dbs
        return user

class StoreSerializer(ModelSerializer):
    class Meta:
        model = Store
        fields = ['id', 'name', 'description', 'active', 'created_date', 'avatar', 'user']


