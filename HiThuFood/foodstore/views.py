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
        
        return Response(data=UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            # gán các trường bằng giá trị trong request.data
            for field, value in request.data.items():
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
            Address.objects.create(address_line=data['address_line'], user=user)
            return Response(UserAddressSerializer(user).data, status=status.HTTP_201_CREATED)

        if request.method.__eq__('GET'):
            return Response(AddressSerializer(user.addresses, many=True).data, status=status.HTTP_200_OK)


class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = ListRetrieveStoreSerializer
    parser_classes = [parsers.MultiPartParser, ]
    def get_queryset(self):
        queryset = self.queryset
        q = self.request.query_params.get('q')
        if q:
            queryset = Store.objects.filter(active=True).filter(name__icontains=q)

        # vì action khi lọc theo q cũng là list nên phải thêm dk q ko tồn tại == True
        # nếu ko kiểm tra q có tồn tại hay k, thì khi q tồn tại đã lọc ra queryset ở trên rồi, xuống dươi
        # ktra action == list nữa, thì nó vẫn đúng
        if self.action == 'list' and not q:
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
        # if self.action == 'get_food':
        #     print(f"====================Action: {self.action}, Permissions: AllowAny")
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

    @action(methods=['get'], url_path='foods', detail=True)
    def get_food(self, request, pk):
        instance = self.get_object()
        foods = instance.foods
        return Response(data=FoodSerializer(foods, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='food', detail=True)
    def add_food(self, request, pk):
        instance = self.get_object()
        data = request.data
        try:
            category = Category.objects.get(id=data['category'])
            food = instance.foods.create(name=data['name'], image=data['image'], description=data['description'],
                        price=data['price'], store=instance, category=category)

        except KeyError:
            return Response(data='Hãy nhập đầy đủ các trường: name, image, description, price và category',
                            status=status.HTTP_400_BAD_REQUEST)
        except Category.DoesNotExist:
            return Response(data='Category không tồn tại', status=status.HTTP_400_BAD_REQUEST)

        return Response(data=FoodSerializer(food).data, status=status.HTTP_201_CREATED)




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

    @action(methods=['get'], url_path='food', detail=True)
    def get_food(self, request, pk):
        cate = self.get_object()
        foods = cate.food_set.select_related('category')
        paginator = paginators.FoodPaginator()
        page = paginator.paginate_queryset(foods, request)
        if page is not None:
            serializer = FoodInCategory(page, many=True)
            return paginator.get_paginated_response(data=serializer.data)
        # neu page = None thì trả hết food ra
        return Response(data=FoodInCategory(foods, many=True).data, status=status.HTTP_200_OK)


class FoodViewSet(viewsets.ViewSet, generics.DestroyAPIView):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer
