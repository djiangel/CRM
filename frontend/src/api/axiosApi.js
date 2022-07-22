import axios from 'axios'
import store from '../redux/store';
import jwt_decode from "jwt-decode"

const baseURL = process.env.REACT_APP_API_URL

const axiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 15000,
    headers: {
        'Authorization': localStorage.getItem('access_token') ? "JWT " + localStorage.getItem('access_token') : null,
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'client': localStorage.getItem('client')
    }
}
);
// Intercepts all request via axios , to set the token headers , and if there is an error , it will check what error it is and 
// If the error is because the access token is expired , it will refresh , if something is wrong with the refresh token , it will
// log the user out.
var errdata = [
    {
        "customized": "Your session has ended , please reverify your credentials",
    }];


axiosInstance.interceptors.response.use(
    response => {
        if (!localStorage.getItem('refresh_token')) {
            window.location.reload()
            return Promise.reject("user is not logged in");
        } else {
            return response
        }
    }, async error => {
        const originalRequest = error.config;
        // Prevent infinite loops
        if (error.response.status === 401 && originalRequest.url === '/token/refresh/') {
            store.dispatch({ type: "LOGOUT" });
            return Promise.reject(error);
        }

        if (error.response.data.code === "token_not_valid" &&
            error.response.status === 401 &&
            error.response.statusText === "Unauthorized") {
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                const tokenParts = JSON.parse(atob(refreshToken.split('.')[1]));

                // exp date in token is expressed in seconds, while now() returns milliseconds:
                const now = Math.ceil(Date.now() / 1000);

                if (tokenParts.exp > now) {
                    try {
                        const response = await axiosInstance
                            .post('/token/refresh/', { refresh: refreshToken });
                        localStorage.setItem('access_token', response.data.access);
                        localStorage.setItem('refresh_token', response.data.refresh);
                        axiosInstance.defaults.headers['Authorization'] = "JWT " + response.data.access;
                        originalRequest.headers['Authorization'] = "JWT " + response.data.access;
                        axiosInstance.defaults.headers['client'] = localStorage.getItem('client');
                        originalRequest.headers['client'] = localStorage.getItem('client');
                        axiosInstance.get('group/get/').then(groups => {
                            store.dispatch({
                                type: "LOGIN_SUCCESS", payload: [response.data.access, refreshToken, groups.data,
                                jwt_decode(response.data.access).username,
                                jwt_decode(response.data.access).userprofile,
                                jwt_decode(response.data.access).profile_picture,
                                jwt_decode(response.data.access).email_service]
                            });
                        })
                        return axiosInstance(originalRequest);
                    }
                    catch (err) {
                        store.dispatch({ type: "GET_ERRORS", error: err.response.data })
                    }
                } else {
                    store.dispatch({ type: "LOGOUT" });
                }
            }
        }
        store.dispatch({ type: "GET_ERRORS", error: error.response.data })
        return Promise.reject(error);
    }
);


export default axiosInstance;
