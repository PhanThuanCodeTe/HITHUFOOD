from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Avg, signals
from django.dispatch import receiver


class User(AbstractUser):
    avatar = CloudinaryField()
    created_date = models.DateTimeField(auto_now_add=True)
    phone_number = models.CharField(max_length=12, unique=True)
    is_staff = models.BooleanField(default=False)
    # cho biết là tài khoản người dùng cá nhân hay không, False la nguoi dung ca nhan
    is_store_owner = models.BooleanField(default=False)
    # cho biết là tài khoản vai trò cửa hàng hay không
    # Cần admin xác nhân mới đc là True
    is_male = models.BooleanField(null=False, default=True)
    #True la Nam
    followed_stores = models.ManyToManyField('Store', through='UserFollowedStore',
                                             related_name='followers', blank=True, null=True)

    def __str__(self):
        return self.username
    def gender(self):
        if self.is_male == True:
            return 'Nam'
        return 'Nữ'


class BaseItem(models.Model):
    name = models.CharField(unique=True, max_length=255, null=False)
    created_date = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True

class Store(BaseItem):
    description = models.TextField(blank=True, null=True)
    avatar = CloudinaryField()
    active = models.BooleanField(default=False)
    #can admin accept
    average_rating = models.FloatField(blank=True, null=True)
    #user nào là chủ cửa hàng
    user = models.OneToOneField(User, on_delete=models.CASCADE,
                                related_name='store', null=True, blank=True)
    address_line = models.CharField(max_length=255, default='Ho Chi Minh City')
    X = models.CharField(max_length=10, null=True)
    Y = models.CharField(max_length=10, null=True)

    def __str__(self):
        return self.name

    def update_average_rating(self):
        avg_rating = self.comments.aggregate(Avg('rating'))['rating__avg']
        self.average_rating = avg_rating if avg_rating else 0
        self.save()

# Xử lý admin gán Store.active = true thì user mà nó có khóa ngoại sẽ tự động gán is_store_owner = true
# khi admin cập nhật trường active trên adminsite
# Signal handler
@receiver(signals.post_save, sender=Store)
def set_store_owner(sender, instance, **kwargs):
    if instance.active:
        user = instance.user
        user.is_store_owner = True
        user.save()

# Connect the signal
signals.post_save.connect(set_store_owner, sender=Store)


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
    rating = models.PositiveSmallIntegerField(default=5)
    content = models.TextField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)



class Address(models.Model):
    # Dòng địa chỉ đầy đủ
    address_line = models.CharField(max_length=255)
    X = models.CharField(max_length=10, null=True)
    Y = models.CharField(max_length=10, null=True)
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='addresses', null=True)

    def __str__(self):
        return self.address_line



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

    def __str__(self):
        return self.name

class SellingTime(models.Model):
    name = models.CharField(max_length=50,)
    start = models.TimeField()
    end = models.TimeField()
    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='orders_by_user')
    store = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='orders_for_store')
    order_date = models.DateTimeField(auto_now_add=True)
    shipping_fee = models.IntegerField(null=True)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    foods = models.ForeignKey(Food, on_delete=models.CASCADE)
    #PositiveIntegerField chỉ nhận số không âm
    quantity = models.PositiveIntegerField(default=1)
    unit_price_at_order = models.IntegerField()

class Order_Item_Topping(models.Model):
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='order_item_topping')
    toppings = models.ForeignKey('Topping', on_delete=models.SET_NULL, null=True)


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

class Topping(models.Model):
    name = models.CharField(max_length=200)
    price = models.IntegerField(default=0)
    food = models.ForeignKey(Food, on_delete=models.CASCADE, related_name='toppings')

    def __str__(self):
        return self.name