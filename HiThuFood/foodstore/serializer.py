from django.db.models import Count
from rest_framework import serializers
from .models import *


# định dạng các trường hình ảnh trả về link cloudinary
class ImageSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        req = super().to_representation(instance)
        req['image'] = instance.image.url
        return req


class AvatarSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        req = super().to_representation(instance)
        # Khi để client gởi 1 hình ảnh lên thì instance.avatar là 1 media object trên cloudinary
        # nên sẽ có thuộc tính url. Nhưng nếu client ko gởi ảnh mà để link ảnh mặc định như trong code
        #Nó là kiểu str, nên ko có thuộc tính url, vì thế instance.avatar là 1 str
        if type(instance.avatar) != str:
            req['avatar'] = instance.avatar.url
        else:
            req['avatar'] = instance.avatar
        return req


class UserSerializer(AvatarSerializer):
    #khi tạo 1 instance SerializerMethodField thì phải có def phương thức get_<ten instance>
    gender = serializers.SerializerMethodField()
    #và tham số object phải là tên của model viết thường, VD: muốn truyền 1 object User thì ghi là user
    def get_gender(self, user):
        if user.is_male in ['1', 'True']:   #khi trả json thì nó chỉ hiểu định dạng str nên True và 1 phải để trong ''
            return 'Nam'
        return 'Nữ'

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'gender', 'email',
                  'phone_number', 'avatar', 'is_store_owner', 'store']
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'read_only': True}
        }
        #khác với # read_only_fields = ['username']
        #chỉ định username: {read_only: True} vẫn có thể truyền username khi create, còn update thì ko nhận

    def create(self, validated_data):
        user = User(**validated_data)
        user.is_male = validated_data['gender']
        user.set_password(validated_data['password'])  # mã hóa trường password
        user.save()  # lưu vào dbs
        return user

    def update(self, instance, validated_data):
        #nếu client có update password thì mới mã hóa và lưu xuống db
        # nếu ko có lệnh if dưới đây, server sẽ hiện lôi KeyError: 'password'
        if 'password' in validated_data.keys():
            instance.set_password(validated_data['password'])
        instance.save()
        return instance


class StoreSerializer(AvatarSerializer):
    follower_number = serializers.SerializerMethodField()

    def get_follower_number(self, store):
        return UserFollowedStore.objects.filter(store=store).count()

    class Meta:
        model = Store
        fields = ['id', 'name',  'description', 'avatar', 'active', 'address_line', 'X', 'Y', 'user', 'follower_number']
        # read_only_fields = ['name', 'active', 'user']  # Không cho phép cập nhật trường active và user qua serializer này

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if 'active' in validated_data and request.user.is_staff:
            instance.active = validated_data.pop('active')
            if instance.active:
                instance.user.is_store_owner = True
                instance.user.save()
        return super().update(instance, validated_data)


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'address_line', 'X', 'Y', 'user']


class SellingTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellingTime
        fields = ['id', 'name']


class SellingTimeDetailSerializer(SellingTimeSerializer):
    class Meta:
        model = SellingTime
        fields = SellingTimeSerializer.Meta.fields + ['start', 'end']


class ReviewSerializer(ImageSerializer):
    class Meta:
        model = Review
        fields = ['user', 'rating', 'comment', 'image', 'created_date']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class FoodSerializer(ImageSerializer):
    times = serializers.SerializerMethodField()

    def get_times(self, food):
        return SellingTimeSerializer(food.times, many=True).data

    category = serializers.SerializerMethodField()

    def get_category(self, food):
        return CategorySerializer(food.category, many=True).data

    class Meta:
        model = Food
        fields = ['id', 'name', 'image', 'active', 'description', 'price', 'average_rating', 'times', 'store',
                  'category']


class FoodInCategory(ImageSerializer):
    class Meta:
        model = Food
        fields = ['id', 'name', 'image', 'price', 'average_rating', 'store']


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFollowedStore
        fields = ['id', 'user', 'store', 'followed_at']


class ToppingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topping
        fields = ['id', 'name', 'price', 'food']


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
