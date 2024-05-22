from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, generics, parsers, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import NotAuthenticated
from rest_framework.response import Response

from .models import User
from .serializer import *


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveAPIView, generics.UpdateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser, ]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        else:
            return [permissions.IsAuthenticated()]

    def get_object(self):
        pk = self.kwargs.get('pk')
        obj = get_object_or_404(User, pk=pk)

        # Kiểm tra xem người dùng hiện tại có quyền truy cập vào đối tượng hay không
        user = self.request.user
        if user.is_authenticated and obj.pk != user.pk:
            raise NotAuthenticated() #loi 401_UNAUTHORIZED

        self.check_object_permissions(self.request, obj)
        return obj

    # Giải thích:
    # Trong phương thức get_object, sau khi lấy đối tượng User tương ứng với pk được truyền trong URL,
    # chúng ta kiểm tra xem người dùng hiện tại có xác thực và pk của đối tượng có khớp với pk của người dùng hiện tại hay không.
    # Nếu người dùng đã xác thực và pk của đối tượng không khớp với pk của người dùng hiện tại,
    # chúng ta gây ra ngoại lệ NotAuthenticated (lôi 401 - Unauthorized).
    # Nếu không có ngoại lệ xảy ra, chúng ta tiếp tục gọi check_object_permissions
    # để kiểm tra quyền truy cập như bình thường.
    #
    # Với cách này, nếu người dùng đã đăng nhập và yêu cầu lấy thông tin của một người dùng khác,
    # nó sẽ gây ra ngoại lệ PermissionDenied và trả về mã lỗi 401 (Unauthorized).
    # Chỉ khi pk của đối tượng khớp với pk của người dùng hiện tại,
    # họ mới có thể xem và cập nhật thông tin.

class StoreViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.RetrieveUpdateAPIView):
    queryset = Store.objects.filter(active=True)
    serializer_class = StoreSerializer
    parser_classes = [parsers.MultiPartParser, ]

    def destroy(self, request, pk):
        l = Store.objects.get(pk=pk)
        l.active = False
        l.save()
        return Response(status=status.HTTP_204_NO_CONTENT)




