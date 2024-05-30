from rest_framework import viewsets, generics, parsers, permissions, status
from rest_framework.response import Response
from foodstore.perms import IsObjectOwner, IsUserOwner, IsStoreOwner
from foodstore.serializer import *



class UserViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.UpdateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, ]
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny(), ]
        else:
            return [permissions.IsAuthenticated(), IsUserOwner()]

    def create(self, request):
        instance = request.data
        user = User.objects.create_user(username=instance['username'], password=instance['password'],
                first_name=instance['first_name'], last_name=instance['last_name'],
                is_male=instance['gender'], phone_number=instance['phone_number'], email=instance['email'],
             avatar='https://res.cloudinary.com/dsfdkyanf/image/upload/v1715526627/avatar-trang-4_oe9hyo.jpg')
        return Response(data=UserSerializer(user).data, status=status.HTTP_201_CREATED)

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = ListRetrieveStoreSerializer
    parser_classes = [parsers.MultiPartParser, ]
    def get_queryset(self):
        queryset = self.queryset
        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(name__icontains=q)

        if self.action == 'list':
            queryset = Store.objects.filter(active=True)

        return queryset
    #Giai thích về action retrieve trong view này:
    def get_permissions(self):
        #bất kì ai đều xem đc list store đã active (queryset trả về ở get_queryset trên kia
        if self.action == 'list':
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
            #các action còn lại như destroy, update, create thì theo quyền dưới đây
        return [IsStoreOwner(), permissions.IsAuthenticated(),]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.active = False
        instance.save()
        return Response(data='Cửa hàng đã ngừng hoạt động', status=status.HTTP_204_NO_CONTENT)

    def create(self, request, *args, **kwargs):
        data = request.data
        store = Store.objects.create(name=data['name'], description=data['description'],
                    address_line=data['address_line'], user=request.user,
                    avatar='https://res.cloudinary.com/dsfdkyanf/image/upload/v1716736944/store_ymq0i5.jpg')
        return Response(data=CreateStoreSerializer(store).data, status=status.HTTP_201_CREATED)


class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsObjectOwner()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        data = request.data
        address = Address.objects.create(address_line=data['address_line'], user=request.user)
        return Response(data=AddressSerializer(address).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data

        # Only update provided fields
        if 'address_line' in data:
            instance.address_line = data['address_line']
        if 'X' in data:
            instance.X = data['X']
        if 'Y' in data:
            instance.Y = data['Y']

        instance.save()
        return Response(data=AddressSerializer(instance).data, status=status.HTTP_200_OK)
