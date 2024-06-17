from rest_framework import permissions

from foodstore.models import Store


class IsStoreOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.user == request.user


class IsUserOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.id == request.user.id


class IsObjectOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_staff or
            (obj.user and obj.user == request.user)
        )


class IsCommentOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_staff or
            obj.users == request.user
        )


class IsOrderOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        try:
            has_store = request.user.store
        # neu user ko co store, suy ra, order khong thuoc ve store cua user
        except Store.DoesNotExist:
            # neu order cũng không phải của user thì:
            if obj.user != request.user:
                return False
            else:
                return True
        # user có store thi kiem tra order co thuoc store khong
        else:
            if request.user.store != obj.store:
                # neu ko thuộc store của user thì xem user này có phải người đặt hàng ko (kiểm tra order của user hay ko)
                if obj.user != request.user:
                    return False
                return True
            # nếu order thuoc store thi tra ra data
            else:
                return True
