import axios from "axios";

const BASE_URL = 'https://chalf333.pythonanywhere.com/';

export const endpoints= {
    'register' : '/user/',
    'login' : '/o/token/',
    'current-user': '/user/current-user/',
    'store-create':'/store/',
    'current-store': (id) => `/store/${id}/`,
    'curent-store-food': (id) => `/store/${id}/foods/`,
    'current-user-address': '/user/current-user/address/',
    'change-address': (id) => `/address/${id}/`,
}

export const authAPI = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

export default axios.create({
    baseURL: BASE_URL
});
