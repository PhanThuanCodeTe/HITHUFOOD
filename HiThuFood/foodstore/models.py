from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Avg

from foodstore.utils import get_default_avatar_url


class User(AbstractUser):
    avatar = CloudinaryField()
    created_date = models.DateTimeField(auto_now_add=True)
    phone_number = models.CharField(max_length=12, unique=True)
    is_staff = models.BooleanField(default=False)
    # cho biết là tài khoản người dùng cá nhân hay không, False la nguoi dung ca nhan
    is_store_owner = models.BooleanField(default=False)
    # cho biết là tài khoản vai trò cửa hàng hay không
    # Cần admin xác nhân mới đc là True
    gender = models.BooleanField(null=False, default=True)
    #True la Nam
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
    avatar = CloudinaryField()
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

    def update_average_rating(self):
        avg_rating = self.comments.aggregate(Avg('rating'))['rating__avg']
        self.average_rating = avg_rating if avg_rating else 0
        self.save()

class UserFollowedStore(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='storesthatuserfollowed')
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    followed_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('user', 'store')

# User đánh giá Store
class Comment(models.Model):
    users = models.ForeignKey(User, on_delete=models.CASCADE)
    stores = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='comments')
    rating = models.IntegerField(default=5)
    content = models.TextField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)



class Address(models.Model):
    store = models.OneToOneField('Store', on_delete=models.CASCADE, related_name='address')
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='addresses', null=True)
    # Dòng địa chỉ đầy đủ
    address_line = models.CharField(max_length=255)
    X = models.CharField(max_length=10)
    Y = models.CharField(max_length=10)

class Food(BaseItem):
    image = CloudinaryField()
    description = models.TextField(blank=True, null=True)
    price = models.IntegerField(default=0)
    average_rating = models.FloatField(default=0)
    times = models.ManyToManyField('SellingTime', null=True, blank=True, related_name='dishes')
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='foods', null=True)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True)
    users_review = models.ManyToManyField(User, through='Review', blank=True, null=True)

    def update_average_rating(self):
        avg_rating = self.reviews.aggregate(Avg('rating'))['rating__avg']
        self.average_rating = avg_rating if avg_rating else 0
        self.save()

class SellingTime(models.Model):
    name = models.CharField(max_length=50,)
    start = models.TimeField()
    end = models.TimeField()

class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='orders_by_user')
    store = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='orders_for_store')
    order_date = models.DateTimeField(auto_now_add=True)
    shipping_fee = models.IntegerField(default=15000)

    @property
    def total_cost(self):
        total = sum(item.total_price for item in self.items.all())
        return total + self.shipping_fee

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    foods = models.ForeignKey(Food, on_delete=models.CASCADE)
    #PositiveIntegerField chỉ nhận số không âm
    quantity = models.PositiveIntegerField(default=1)
    unit_price_at_order = models.IntegerField()

    @property
    def total_price(self):
        return self.unit_price_at_order * self.quantity

#user danh gia mon an
class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    food = models.ForeignKey(Food, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True)
    image = CloudinaryField()
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        #1 user chỉ đánh giá 1 lần
        unique_together = ('user', 'food')





