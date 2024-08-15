import axios from "axios";

const BASE_URL = "https://chalf333.pythonanywhere.com/";

export const endpoints = {
  register: "/user/",
  login: "/o/token/",
  "current-user": "/user/current-user/",
  "store-create": "/store/",
  "current-store": (id) => `/store/${id}/`,
  "curent-store-food": (id) => `/store/${id}/foods/`,
  "create-food": (id) => `/store/${id}/food/`,
  "update-food": (id) => `/food/${id}/`,
  "current-user-address": "/user/current-user/address/",
  "change-address": (id) => `/address/${id}/`,
  store: "/store/",
  "food-topping": (id) => `/food/${id}/topping/`,
  "delete-topping": (foodId, toppingId) =>
    `/food/${foodId}/topping/${toppingId}/`,
  category: "/category/",
  time:"/times/",
  "show-follow-store": "/user/current-user/followed-store/",
  "follow-store": (id) => `/store/${id}/follow/`,
  "store-comment": (id) => `/store/${id}/comment/`,
  "is-follow": (id) => `/store/${id}/didfollow/`,
  "search-food": (query) => `${BASE_URL}/food/?q=${query}`,
  "search-store": (query) => `${BASE_URL}/store/?q=${query}`,
  food: "/food/",
  "food-category": (id) => `/category/${id}/food/`,
  "store-comment": (id) => `/store/${id}/comment/`,
  "food-info": (id) => `/food/${id}/`,
  "order": "/order/",
  "store-order":"/order/pending-order-of-my-store/",
  "my-order":"/user/current-user/my-order/",
  "confirm-order": (id) => `/order/${id}/confirm-order/`,
  "confirm-recieve": (id) => `/order/${id}/confirm-receipt/`,
  "cancel-order": (id) => `/order/${id}/cancel-order/`,
  "show-review": (id) => `/food/${id}/reviews-of-food/`,
  "review" : "/review/",
};

export const authAPI = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default axios.create({
  baseURL: BASE_URL,
});
