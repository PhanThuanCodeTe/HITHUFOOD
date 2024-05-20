from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models
from foodstore.utils import get_default_avatar_url


class User(AbstractUser):
    avatar = CloudinaryField('image/upload/avatar_default')
    created_date = models.DateTimeField(auto_now_add=True)
    number = models.CharField(max_length=12, unique=True)
    is_staff = models.BooleanField(default=True)
    # cho biết là tài khoản người dùng cá nhân hay không
    is_store_owner = models.BooleanField(default=False)
    # cho biết là tài khoản vai trò cửa hàng hay không
    # Cần admin xác nhân mới đc là True
    followed_stores = models.ManyToManyField('Store', through='UserFollowedStore',
                                             related_name='followers', blank=True, null=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.avatar:
            self.avatar = CloudinaryField(get_default_avatar_url())


class BaseItem(models.Model):
    name = models.CharField(unique=True, max_length=255, null=False)
    created_date = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True

class Store(BaseItem):
    description = models.TextField(blank=True, null=True)
    avatar = CloudinaryField('image/upload/avatar_default')
    average_rating = models.FloatField(default=None, null=True)
    #user nào là chủ cửa hàng
    user = models.OneToOneField(User, on_delete=models.CASCADE,
                                related_name='store', null=True, blank=True)
    #vì CloudinaryImage ko có thuộc tính default để thiết lập avatar mặc đinh
    # nên phải tạo hàm __init__
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # nếu instance ko gán giá trị cho trươờng avatar
        # thì gán 1 hình ảnh trên cloudinary làm avatar mặc định
        if not self.avatar:
            self.avatar = CloudinaryField(get_default_avatar_url())

class UserFollowedStore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='storesthatuserfollowed')
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    followed_at = models.DateTimeField(auto_now_add=True)

#User đánh giá Store
# class Comment(models.Model):
#     users = models.ForeignKey(User, on_delete=models.CASCADE)
#     stores = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='comments')
#     rating = models.IntegerField(default=5)
#     content = models.TextField(null=True, blank=True)
#     created_date = models.DateTimeField(auto_now_add=True)
#     updated_date = models.DateTimeField(auto_now=True)



class Address(models.Model):
    store = models.OneToOneField('Store', on_delete=models.CASCADE, related_name='address')
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='addresses', null=True)
    # Dòng địa chỉ đầy đủ
    address_line = models.CharField(max_length=255)
    X = models.CharField(max_length=10)
    Y = models.CharField(max_length=10)


