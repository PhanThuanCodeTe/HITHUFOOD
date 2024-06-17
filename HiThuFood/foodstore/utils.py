from datetime import datetime, time
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect
from .models import Order, OrderItem, Order_Item_Topping, Store


def compare_times(time1, time2):
    """
    Return 1 if time1 < time2
    timeline: ----|----------|-------
                time1      time2

    Return -1 if time1 > time2, (nếu cùng số giờ và số phút, vẫn trả về -1)
    """
    if time1.hour < time2.hour:
        return 1

    if time1.hour == time2.hour:
        if time1.minute < time2.minute:
            return 1
        else:
            return -1
    else:
        return -1


def is_user_order_owner(order, user):
    if order.store == user:
        return True
    return False


def is_store_order_owner(order, store):
    if order.store == store:
        return True
    return False


if __name__ == '__main__':
    now = datetime.now().time() # time object

    n= time(hour=14, minute=35, second=0)
    print(now)
    print(compare_times(time1=now, time2=n))
