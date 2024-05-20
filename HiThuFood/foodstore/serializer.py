from rest_framework.serializers import ModelSerializer
from .models import User


class CreateUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'number']

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])  # mã hóa trường password
        user.save()  # lưu vào dbs
        return user