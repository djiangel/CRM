import { put, takeEvery, call, all } from 'redux-saga/effects'
import axiosInstance from '../../api/axiosApi';


export function* workerUserProfileDetail(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'userprofile' })
    try {
        const data = yield call(() => axiosInstance.get(`/userprofile/${action.id}`))
        yield put({ type: "STORE_USER_DATA", payload: data.data, fetch: 'userprofile' })
    } catch (error) {

        const errordata = {
            error: {
                status: [404, 403, 500].includes(error.response.status) ? error.response.status : 'warning',
                message: error.response.data
            }
        }
        console.log(errordata)
        yield put({ type: "STORE_USER_DATA", payload: errordata, fetch: 'userprofile' })
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'userprofile' })
}


export function* workerUpdateUserProfile(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'userprofile' })
    try {
        const data = yield call(() => axiosInstance.patch(`/user-profile/${action.id}/`, action.data))
        console.log(data.data);
        yield put({ type: "STORE_USER_DATA", payload: data.data, fetch: 'userprofile' })
        yield put({ type: "CREATE_MESSAGE", message: 'Profile Settings changed successfully' })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'userprofile' })
}


export function* workerUserProfileList(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'userprofile' })
    try {
        const data = yield call(() => axiosInstance.get(`/userprofile`))
        yield put({ type: "STORE_USER_DATA", payload: data.data, fetch: 'userprofiles' })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'userprofile' })
}


export function* watchUserProfileDetail() {
    yield takeEvery('LOAD_USERPROFILE_DETAIL', workerUserProfileDetail)
}

export function* watchUserProfileList() {
    yield takeEvery('LOAD_USERPROFILE_LIST', workerUserProfileList)
}
export function* watchUpdateUserProfile() {
    yield takeEvery('UPDATE_USERPROFILE', workerUpdateUserProfile)
}

export default function* userprofileSaga() {
    yield all([
        watchUserProfileDetail(),
        watchUserProfileList(),
        watchUpdateUserProfile(),
    ])
}