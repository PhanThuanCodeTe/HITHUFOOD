from rest_framework import viewsets, generics, parsers, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from foodstore import paginators, utils
from foodstore.perms import IsObjectOwner, IsStoreOwner, IsCommentOwner, IsOrderOwner
from foodstore.serializer import *


class UserViewSet(viewsets.ViewSet):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, ]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny(), ]
        else:
            return [permissions.IsAuthenticated()]

    def create(self, request):
        instance = request.data
        user = User.objects.create_user(username=instance['username'], password=instance['password'],
                first_name=instance['first_name'], last_name=instance['last_name'],
                is_male=instance['gender'], phone_number=instance['phone_number'], email=instance['email'],
             avatar='https://res.cloudinary.com/dsfdkyanf/image/upload/v1715526627/avatar-trang-4_oe9hyo.jpg')
        if instance.get('avatar'):
            instance.avatar = instance['avatar']
            instance.save()
        
        return Response(data=UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        data = request.data
        if request.method.__eq__('PATCH'):
            # gán các trường bằng giá trị trong request.data
            if 'is_male' in data:
                return Response('Trường \'is_male\' không tồn tại', status=status.HTTP_400_BAD_REQUEST)
            if 'gender' in data:
                user.is_male = data['gender']
            for field, value in data.items():
                # set attribute
                setattr(user, field, value)

                # goi phuong thuc update de password dc ma hoa và lưu lại
            UserSerializer().update(instance=user, validated_data=request.data)
        return Response(UserSerializer(user).data)

    @action(methods=['post', 'get'], url_path='current-user/address', detail=False)
    def add_get_address(self, request):
        user = request.user
        data = request.data
        if request.method.__eq__('POST'):
            address = Address.objects.create(address_line=data['address_line'], X=data['X'], Y=data['Y'], user=user)
            return Response(AddressSerializer(address).data, status=status.HTTP_201_CREATED)

        if request.method.__eq__('GET'):
            return Response(AddressSerializer(user.addresses, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='current-user/followed-store', detail=False)
    def get_followed_store(self, request):
        user = request.user
        return Response(FollowSerializer(user.storesthatuserfollowed, many=True).data,
                        status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='current-user/my-order', detail=False)
    def get_order(self, request):
        return Response(OrderSerializer(request.user.orders_by_user, many=True).data, status=status.HTTP_200_OK)


class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    parser_classes = [parsers.MultiPartParser, ]
    def get_queryset(self):
        queryset = self.queryset
        q = self.request.query_params.get('q')
        if q:
            queryset = Store.objects.filter(active=True).filter(name__icontains=q)

        # vì action khi lọc theo q cũng là list nên phải thêm dk q ko tồn tại == True
        # nếu ko kiểm tra q có tồn tại hay k, thì khi q tồn tại đã lọc ra queryset ở trên rồi, xuống dươi
        # ktra action == list nữa, thì nó vẫn đúng
        # điều kiện thứ 2: khi add hay get comment chỉ khi store có active=True
        if (self.action == 'list' and not q) or self.action in ['follow', 'comment']:
            queryset = Store.objects.filter(active=True)

        return queryset

    #Giai thích về action retrieve trong view này:
    def get_permissions(self):
        # bất kì ai đều xem đc list store và food của store đã active (queryset trả về ở get_queryset trên kia)
        if self.action in ['list', 'get_food'] or (self.action == 'comment' and self.request.method == 'GET'):
            return [permissions.AllowAny(),]
        # đối với retrieve, thì tất cả user dc xem các store có active = true
        if self.action == 'retrieve':
            # instance = self.get_object()   #ko dung cau lenh nay vi gay ra loi lặp vô tận trong đệ quy
            id = self.kwargs.get('pk')  # self.kwargs.get('pk') trả về 1 str
            instance = Store.objects.get(pk=id)
            if instance.active == True:
                return [permissions.AllowAny()]
            # với các store có active=False thì chỉ có user chủ cửa hàng xem dc thôi
            else:
                return [IsStoreOwner()]
        # neu muon follow thi phai login
        if self.action in ['follow'] or (self.action == 'comment' and self.request.method == 'POST'):
            return [permissions.IsAuthenticated()]
        # các action còn lại như destroy, update, create, add_food thì theo quyền dưới đây
        return [IsStoreOwner(), permissions.IsAuthenticated(),]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.active = False
        instance.save()
        return Response(data='Cửa hàng đã ngừng hoạt động', status=status.HTTP_204_NO_CONTENT)

    def create(self, request, *args, **kwargs):
        data = request.data
        store = Store.objects.create(name=data['name'], description=data['description'],
                    address_line=data['address_line'], user=request.user, X=data['X'], Y=data['Y'],
                    avatar='https://res.cloudinary.com/dsfdkyanf/image/upload/v1716736944/store_ymq0i5.jpg')
        if data.get('avatar'):
            store.avatar = data['avatar']
            store.save()

        return Response(data=StoreSerializer(store).data, status=status.HTTP_201_CREATED)

    # không biết nguyên do tại sao mà khi cùng url_path với add_food thì get_permission không nhận diện dc get_food
    # cụ thể khi url_path của get_food là 'food' thì nó ko thỏa đk để vào block của if này
    # if self.action in ['list', 'get_food']:
    # khi đổi thành foods nó mới thỏa điều kiện
    @action(methods=['get'], url_path='foods', detail=True)
    def get_food(self, request, pk):
        instance = self.get_object()
        foods = None
        if instance.user == request.user:
            foods = instance.foods
        else:
            foods = instance.foods.filter(active=True)
        return Response(data=FoodSerializer(foods, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='food', detail=True)
    def add_food(self, request, pk):
        instance = self.get_object()
        data = request.data
        try:
            food = instance.foods.create(name=data['name'], image=data['image'], description=data['description'],
                        price=data['price'], store=instance)
            data['category'] = data.get('category').split(',')
            food.category.set(data['category'])

        except KeyError:
            return Response(data='Hãy nhập đầy đủ các trường: name, image, description, price và category',
                            status=status.HTTP_400_BAD_REQUEST)
        except Category.DoesNotExist:
            return Response(data='Category không tồn tại', status=status.HTTP_400_BAD_REQUEST)

        return Response(data=FoodSerializer(food).data, status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='follow', detail=True)
    def follow(self, request, pk):
        if request.user == self.get_object().user:
            return Response(data='Không thể follow cửa hàng của mình')

        follow, created = UserFollowedStore.objects.get_or_create(store=self.get_object(), user=request.user)

        if not created: # created does not exist (tức là đã follow rồi)
            follow.delete()
            return Response(data='Đã hủy theo dõi!', status=status.HTTP_204_NO_CONTENT)

        return Response(FollowSerializer(follow).data, status=status.HTTP_201_CREATED)

    @action(methods=['post', 'get'], url_path='comment', detail=True)
    def comment(self, request, pk):
        store = self.get_object()
        user = request.user
        data = request.data
        if request.method.__eq__('POST'):
            c = store.comments.create(users=user, rating=data['rating'], content=data['content'])
            return Response(CommentSerializer(c).data, status=status.HTTP_201_CREATED)
        if request.method.__eq__('GET'):
            return Response(data=CommentSerializer(store.comments, many=True).data, status=status.HTTP_200_OK)


class DidFollow(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, store_id):
        user = request.user
        did_user_follow = UserFollowedStore.objects.filter(store=store_id, user=user).exists()
        # phương thức exists() chỉ sử dụng được khi dùng filter(), nếu dùng get() thì bị lỗi
        return Response(did_user_follow)


class AddressViewSet(viewsets.ViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    parser_classes = [parsers.MultiPartParser]
    permission_classes = [permissions.IsAuthenticated, IsObjectOwner]

    def partial_update(self, request, pk):
        data = request.data
        address = Address.objects.get(pk=pk)
        # Only update provided fields
        if 'address_line' in data:
            address.address_line = data['address_line']
        if 'X' in data:
            address.X = data['X']
        if 'Y' in data:
            address.Y = data['Y']

        address.save()
        return Response(data=AddressSerializer(address).data, status=status.HTTP_200_OK)

    def destroy(self, request, pk):
        address = Address.objects.get(pk=pk)
        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    @action(methods=['get'], url_path='food', detail=True)
    def get_food(self, request, pk):
        cate = self.get_object()
        foods = cate.food_set.filter(active=True).prefetch_related('category')
        paginator = paginators.FoodPaginator()
        page = paginator.paginate_queryset(foods, request)
        if page is not None:
            serializer = FoodInCategory(page, many=True)
            return paginator.get_paginated_response(data=serializer.data)
        # neu page = None thì trả hết food ra
        return Response(data=FoodInCategory(foods, many=True).data, status=status.HTTP_200_OK)


class FoodViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Food.objects.filter(active=True)
    serializer_class = FoodSerializer
    parser_classes = [parsers.MultiPartParser, ]

    def get_permissions(self):
        if self.action in ['list', 'retrieve'] or (self.action == 'add_get_topping' and self.request.method == 'GET'):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = self.queryset
        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(name__icontains=q)
        # mặc kệ food có active là gì, miễn là chủ store thì có thể xóa đc
        if self.action in ['delete_topping', 'partial_update']:
            queryset = Food.objects.all()
        # nếu là chủ store và thực hiện action lấy danh sách topping của food, thì trả ra tất cả food
        if self.action in ['add_get_topping'] and self.request.method == 'GET'\
            and self.request.user == User.objects.get(id=Food.objects.get(id=self.kwargs.get('pk')).store.user.id):
            queryset = Food.objects.all()
        return queryset

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if self.get_object().store.user != user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        food = self.get_object()
        food.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

    def partial_update(self, request, pk):
        food = self.get_object()
        user = request.user
        if food.store.user != user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        # Chỉ cập nhật các trường cụ thể
        allowed_fields = {'name', 'image', 'description', 'active', 'price', 'times', 'category'}
        data = {key: value for key, value in request.data.items() if key in allowed_fields}

        # nếu có tồn tại mới split, chứ ko tồn tại (None) thì sẽ lỗi vì NoneType ko có split method
        if data.get('times'):
            data['times'] = data.get('times').split(',')    #data['times'] bay gio la 1 list, ko phai str nua
        if data.get('category'):
            data['category'] = data.get('category').split(',')

        for key, value in data.items():
            if key == 'times':
                food.times.set(data['times'])
                continue
            if key == 'category':
                food.category.set(data.get('category'))
                continue

            setattr(food, key, value)
        food.save()

        return Response(data=FoodSerializer(food).data, status=status.HTTP_200_OK)

    @action(methods=['post', 'get'], url_path='topping', detail=True)
    def add_get_topping(self, request, pk):
        food = self.get_object()
        user = request.user
        if request.method.__eq__('POST'):
            data = request.data
            if food.store.user != user:
                return Response(status=status.HTTP_403_FORBIDDEN)
            topping = Topping.objects.create(name=data['name'], price=data['price'], food=food)
            return Response(data=ToppingSerializer(topping).data, status=status.HTTP_201_CREATED)

        if request.method.__eq__('GET'):
            return Response(data=ToppingSerializer(food.toppings, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['delete'], url_path='topping/(?P<topping_id>[^/.]+)', detail=True)
    def delete_topping(self, request, pk, topping_id):
        food = self.get_object()
        user = request.user
        if food.store.user != user:
            return Response(status=status.HTTP_403_FORBIDDEN)

        try:
            topping = Topping.objects.get(id=topping_id)
        except Topping.DoesNotExist:
            return Response(f'Topping với ID {topping_id} không tồn tại.', status=status.HTTP_404_NOT_FOUND)

        if not food.toppings.filter(id=topping_id).exists():
            return Response(f'Món \'{food.name}\' của cửa hàng \'{food.store.name}\' không có topping này',
                            status=status.HTTP_404_NOT_FOUND)

        topping.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SellingTimeViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = SellingTime.objects.all()
    serializer_class = SellingTimeDetailSerializer
    permission_classes = [permissions.AllowAny]


class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCommentOwner]
    queryset = Comment.objects.all()
    parser_classes = [parsers.MultiPartParser]
    serializer_class = CommentSerializer


class OrderViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.action in ['retrieve', 'cancel_order']:
            return [permissions.IsAuthenticated(), IsOrderOwner(), ]
        return [permissions.IsAuthenticated(), ]

    def create(self, request, *args, **kwargs):
        """
        {
            "address": 1
            "store": 1,
            "shipping_fee": 15000,
            "items":
                [
                    {
                        "food": 3,
                        "quantity": 2,
                        "order_item_topping":
                            [
                                {
                                  "topping": 1
                                },
                                {
                                  "topping": 2
                                }
                            ]
                    },
                    {
                        "food": 4,
                        "quantity": 1,
                        "order_item_topping": []
                    }
                ]
        }
        """
        data = request.data
        try:
            try:
                store = Store.objects.get(id=data['store'], active=True)
                address = Address.objects.get(id=data['address'])
                if request.user == store.user:
                    raise Exception('This user cannot place orders in their own store')
            except Store.DoesNotExist:
                raise Exception('Store not found')

            order = Order.objects.create(user=request.user, store=store, total=0, shipping_fee=data['shipping_fee'],
                                         address=address)
            items_order = data['items']  # this is a list
            for item in items_order:  # item is a dictionary
                try:
                    food = Food.objects.get(id=item['food'], active=True)
                    if food.store != store:
                        raise Exception(f'Food with id {item["food"]} does not belong to the specified store')
                except Food.DoesNotExist:
                    raise Exception(f'Food with id {item["food"]} not found')

                order_item = OrderItem.objects.create(order=order, food=food, quantity=item['quantity'],
                                                      unit_price_at_order=food.price)
                order.total += order_item.unit_price_at_order

                toppings_data = item.pop('order_item_topping')  # this is a list
                for topping_data in toppings_data:  # topping_data is a dictionary
                    try:
                        topping = Topping.objects.get(id=topping_data['topping'])
                        if topping.food != food:
                            raise Exception(
                                f'Topping with id {topping_data["topping"]} does not belong to the specified food')
                    except Topping.DoesNotExist:
                        raise Exception(f'Topping with id {topping_data["topping"]} not found')
                    else:
                        order_item_topping = Order_Item_Topping.objects.create(order_item=order_item, topping=topping,
                                                          unit_price_at_order=topping.price)
                        order.total += order_item_topping.unit_price_at_order
                order.total *= order_item.quantity

            order.total += data['shipping_fee']
            order.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Xóa các đối tượng đã tạo trong khối try nếu có bất kì ngoại lệ nào được raise
            # vì khi có ngoại lệ xảy ra thì các đối tượng order, order_item hay order_item_topping được lưu
            # trước đó (vì ko có ngoại lệ) sẽ trở nên vô nghĩa
            if 'order' in locals(): # locals(): 1 hàm trả về dictionary chứa các biến local trong scope này
                # chỉ cần xóa order thì các order_item sẽ xóa theo vì thiết lâp on_delete là CASCADE
                order.delete()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], url_path='pending-order-of-my-store', detail=False)
    def get_order(self, request):
        try:
            my_store = request.user.store
        except Store.DoesNotExist:
            return Response('Error: You do not have a store', status=status.HTTP_404_NOT_FOUND)
        # tra ve cac order của store của request.user
        return Response(OrderSerializer(my_store.orders_for_store.filter(status='PENDING'), many=True).data,
                        status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='confirm-order')
    def confirm_order(self, request, pk):
        order = self.get_object()
        try:
            my_store = request.user.store
        except Store.DoesNotExist:
            return Response('Error: You do not have a store', status=status.HTTP_404_NOT_FOUND)
        if order.store != my_store:
            return Response(f'Error: This order with id {order.id} does not belong to your store',
                            status=status.HTTP_404_NOT_FOUND)
        if order.status != 'PENDING':
            return Response('Error: Chỉ được confirm các order có status là Pending', status=status.HTTP_400_BAD_REQUEST)
        order.status = 'DELIVERING'
        order.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['delete'], url_path='cancel-order')
    def cancel_order(self, request, pk):
        order = self.get_object()
        if order.status != 'PENDING':
            return Response('Error: Chỉ được hủy các order có status là Pending',
                            status=status.HTTP_400_BAD_REQUEST)
        # sau khi kiểm tra quyền đối với order thì giờ chỉ có thể có 1 người có thể truy cập vào
        # giờ phải kiểm tra ngươi đó là user đặt hàng hay user chủ store được đặt hàng
        # mỗi người sẽ có cách xử lý khác nhau
        if utils.is_user_order_owner(order=order, user=request.user) is True:
            order.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        if utils.is_store_order_owner(order=order, store=request.user.store) is True:
            order.status = 'CANCELLED'
            order.save()
            return Response({'status': 'Order cancelled'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='confirm-receipt')
    def complete_order(self, request, pk):
        order = self.get_object()
        if utils.is_user_order_owner(order=order, user=request.user) is False:
            return Response(f'Error: This order with id {order.id} does not belong to you',
                     status=status.HTTP_403_FORBIDDEN)
        if order.status != 'DELIVERING':
            return Response('Error: Store has not confirmed', status=status.HTTP_400_BAD_REQUEST)
        order.status = 'DELIVERED'
        order.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    parser_classes = [parsers.MultiPartParser ]
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsObjectOwner]

    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            food = Food.objects.get(id=data['food'])
        except Exception as e:
            return Response(f'Error: {str(e)}', status=status.HTTP_400_BAD_REQUEST)
        try:
            OrderItem.objects.filter(order__user=request.user, food=food)
        except OrderItem.DoesNotExist:
            return Response('Error: Bạn chưa mua món này', status=status.HTTP_403_FORBIDDEN)
        else:
            try:
                existence = Review.objects.get(user=request.user, food=food)
            except Review.DoesNotExist:
                review = Review.objects.create(user=request.user, food=food, rating=data['rating'],
                                               comment=data['comment'], image=None)
                if 'image' in data:
                    review.image = data['image']
                return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
            else:
                return Response({'Error': 'Bạn đã đánh giá món này rồi', 'id': existence.id},
                                status=status.HTTP_400_BAD_REQUEST)


