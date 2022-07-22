import axios from 'axios';
import jwt_decode from "jwt-decode"
import { put, takeEvery, call, all } from 'redux-saga/effects'
import axiosInstance from '../../api/axiosApi';
import { GmailController } from '../../api/gmail_controller.js';


const baseURL = process.env.REACT_APP_API_URL

export function* workerLogin(action) {
    const gmailController = new GmailController();
    yield put({ type: 'SHOW_LOADER', loading: 'authentication' })
    try {
        if (action.company) {
            localStorage.setItem('client', action.company);
            console.log(action.company)
            console.log(localStorage.getItem('client'));
        }

        yield call(() => axios.defaults.headers['client'] = localStorage.getItem('client'));
        const data = yield call(() => axios.post(`${baseURL}token/`, {
            username: action.username,
            password: action.password,
        }))
        const access_token = data.data.access;
        const refresh_token = data.data.refresh;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        yield call(() => axiosInstance.defaults.headers['Authorization'] = "JWT " + localStorage.getItem('access_token'));
        const groups = yield call(() => axiosInstance.get('group/get/'))
        yield put({
            type: "LOGIN_SUCCESS", payload: [access_token, refresh_token, groups.data,
                jwt_decode(access_token).username, jwt_decode(access_token).userprofile,
                jwt_decode(access_token).profile_picture, jwt_decode(access_token).email_service]
        })
        yield call(() => gmailController.loadScript("https://apis.google.com/js/client.js").then(response => {
            gmailController.authorizeUser()
        }))
        yield put({ type: "CHANGE_ISSIGNEDIN" })
    }
    catch (error) {
        yield put({ type: "LOGIN_FAIL" })
        if (error) { yield put({ type: "AUTH_ERRORS", error: error.response }) }
        else { yield put({ type: "AUTH_ERRORS", error: error }) }

    }
    yield put({ type: 'HIDE_LOADER', loading: 'authentication' })
}


export function* workerLogout(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'authentication' })
    try {
        const r_token = localStorage.getItem('refresh_token');
        yield call(() => axios.post(`${baseURL}blacklist/`, {
            "refresh_token": r_token
        }))
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('client');
        yield call(() => axiosInstance.defaults.headers['client'] = null);
        yield call(() => axiosInstance.defaults.headers['Authorization'] = null);
        yield call(() => axios.defaults.headers['client'] = null);
        yield put({ type: "LOGOUT_SUCCESS" })
    }
    catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'authentication' })
}


export function* workerCheckAuth(action) {
    const gmailController = new GmailController();
    yield put({ type: 'SHOW_LOADER', loading: 'authentication' })
    try {
        const r_token = localStorage.getItem('refresh_token');
        const a_token = localStorage.getItem('access_token');
        if (r_token === null) {
            console.log('Welcome to the login page')
        } else {
            console.log('hehe')
            const tokenParts = JSON.parse(atob(r_token.split('.')[1]));
            const now = Math.ceil(Date.now() / 1000);
            if (tokenParts < now) {
                yield put({ type: 'LOGOUT' })
            } else {
                const groups = yield call(() => axiosInstance.get('group/get/'))
                yield put({
                    type: "LOGIN_SUCCESS", payload: [a_token, r_token, groups.data,
                        jwt_decode(a_token).username, jwt_decode(a_token).userprofile,
                        jwt_decode(a_token).profile_picture, jwt_decode(a_token).email_service]
                })
                yield call(() => gmailController.loadScript("https://apis.google.com/js/client.js").then(response => {
                    gmailController.authorizeUser().then((response) => {
                        if (response === "unblock popup") {
                        }
                    })
                }))
                yield put({ type: "CHANGE_ISSIGNEDIN" })
            }
        }
    }
    catch (error) {
        if (error.response) { yield put({ type: "GET_ERRORS", error: error.response }) }
        else { yield put({ type: "GET_ERRORS", error: error }) }
    }
    yield put({ type: 'HIDE_LOADER', loading: 'authentication' })
}


export function* workerSignUp(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'authentication' })

    try {
        console.log(axiosInstance.defaults.headers['client'])
        const data = yield call(() => axiosInstance.post('/sign-up/', {
            username: action.username,
            password: action.password
        }))
        yield put({ type: 'HIDE_LOADER', loading: 'authentication' })
        yield put({ type: "CREATE_MESSAGE", message: "You have successfully created a new user" })
    }
    catch (error) {
        yield put({ type: 'HIDE_LOADER', loading: 'authentication' })
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}


export function* workerChangePassword(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'authentication' })
    console.log(action.old);
    console.log(action.new);
    try {
        console.log(axiosInstance.defaults.headers['client'])
        const data = yield call(() => axiosInstance.put('/token/changepassword/', {
            old_password: action.old,
            new_password: action.new
        }))
        console.log(data.data)
        yield put({ type: "LOGIN", username: data.data.data[0], password: data.data.data[1] })
        yield put({ type: 'HIDE_LOADER', loading: 'authentication' })
        yield put({ type: "CREATE_MESSAGE", message: "You have successfully changed your password" })
    }
    catch (error) {
        yield put({ type: 'HIDE_LOADER', loading: 'authentication' })
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}



export function* watchLogin() {
    yield takeEvery('LOGIN', workerLogin)
}

export function* watchLogout() {
    yield takeEvery('LOGOUT', workerLogout)
}

export function* watchCheckAuth() {
    yield takeEvery('CHECK_AUTH', workerCheckAuth)
}

export function* watchSignUp() {
    yield takeEvery('SIGN_UP', workerSignUp)
}

export function* watchChangePassword() {
    yield takeEvery('CHANGE_PASSWORD', workerChangePassword)
}



export default function* authenticationSaga() {
    yield all([
        watchLogin(),
        watchLogout(),
        watchCheckAuth(),
        watchChangePassword(),
        watchSignUp(),
    ])
}
