from rest_framework import viewsets, generics, parsers, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from foodstore import paginators
from foodstore.perms import IsObjectOwner, IsUserOwner, IsStoreOwner
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
        if (self.action == 'list' and not q) or self.action == 'follow':
            queryset = Store.objects.filter(active=True)

        return queryset
    #Giai thích về action retrieve trong view này:
    def get_permissions(self):
        #bất kì ai đều xem đc list store và food của store đã active (queryset trả về ở get_queryset trên kia)
        if self.action in ['list', 'get_food']:
            return [permissions.AllowAny(),]
        # đối với retrieve, thì tất cả user dc xem các store có active = true
        if self.action == 'retrieve':
            #instance = self.get_object()   #ko dung cau lenh nay vi gay ra loi lặp vô tận trong đệ quy
            id = self.kwargs.get('pk')  #self.kwargs.get('pk') trả về 1 str
            instance = Store.objects.get(pk=id)
            if instance.active == True:
                return [permissions.AllowAny()]
            # với các store có active=False thì chỉ có user chủ cửa hàng xem dc thôi
            else:
                return [IsStoreOwner()]
        #neu muon follow thi phai login
        if self.action in ['follow']:
            return [permissions.IsAuthenticated()]
        #các action còn lại như destroy, update, create, add_food thì theo quyền dưới đây
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

    #không biết nguyên do tại sao mà khi cùng url_path với add_food thì get_permission không nhận diện dc get_food
    #cụ thể khi url_path của get_food là 'food' thì nó ko thỏa đk để vào block của if này
    #if self.action in ['list', 'get_food']:
    #khi đổi thành foods nó mới thỏa điều kiện
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

        if not created: #created does not exist (tức là đã follow rồi)
            follow.delete()
            return Response(data='Đã hủy theo dõi!', status=status.HTTP_204_NO_CONTENT)

        return Response(FollowSerializer(follow).data, status=status.HTTP_201_CREATED)


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


class FoodViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.ListAPIView):
    queryset = Food.objects.filter(active=True)
    serializer_class = FoodSerializer
    parser_classes = [parsers.MultiPartParser, ]

    def get_permissions(self):
        if self.action in ['list'] or (self.action == 'add_get_topping' and self.request.method == 'GET'):
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

