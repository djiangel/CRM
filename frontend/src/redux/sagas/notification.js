import { put, takeEvery, call, all } from 'redux-saga/effects'
import axiosInstance from '../../api/axiosApi';
import store from '../store';
import { notification } from 'antd';


export function* workerLoadNotifications(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'notifications' })
        const [notifications, counter, workflowcounter] = yield all([
            call(() => axiosInstance.get(`/notifications/`)),
            call(() => axiosInstance.get(`/notifications/counter/`)),
            call(() => axiosInstance.get(`/notifications/workflowcounter/`)),
        ])

        yield all([
            put({ type: "STORE_NOTIFICATION_DATA", payload: notifications.data, fetch: 'notifications' }),
            put({ type: "STORE_COUNTER_DATA", payload: counter.data }),
            put({ type: "STORE_WORKFLOW_COUNTER_DATA", payload: workflowcounter.data }),
        ])
        yield put({ type: 'HIDE_LOADER', loading: 'notifications' })
    }
    catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}

export function* workerLoadNextNotifications(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'notifications' })
        const extra_notifications = yield call(() => axiosInstance.get(`/notifications/getnext20notifications/?page=${action.page}`))
        yield put({ type: "STORE_EXTRA_NOTIFICATION_DATA", payload: extra_notifications.data, fetch: 'notifications' })
        yield put({ type: 'HIDE_LOADER', loading: 'notifications' })
    }
    catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}

export function* workerReadNotification(action) {
    yield put({ type: 'SHOW_LOADER_COMPONENT', loading: 'notifications' })
    try {
        yield call(() => axiosInstance.get(`/notifications/${action.notification_id}`))
        yield all([
            put({ type: "READ_NOTIFICATION_DATA", payload: action.notification_id }),
            put({ type: "DECREASE_COUNTER" }),
        ])
    }
    catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }

    yield put({ type: 'HIDE_LOADER_COMPONENT', loading: 'notifications' })
}

export function* workerReadAllNotification(action) {
    yield put({ type: 'SHOW_LOADER_COMPONENT', loading: 'notifications' })
    try {
        yield call(() => axiosInstance.post(`/notifications/readall/`, store.getState().notifications))
        const counter = yield call(() => axiosInstance.get(`/notifications/counter/`))
        yield all([
            put({ type: "READ_ALL_NOTIFICATIONS_DATA" }),
            put({ type: "STORE_COUNTER_DATA", payload: counter.data }),
        ])
        yield put({ type: "CREATE_MESSAGE", message: 'You have cleared all visible notifications' })
    }
    catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER_COMPONENT', loading: 'notifications' })
}

export function* workerLoadNewNotification(action) {
    yield put({ type: 'SHOW_LOADER_COMPONENT', loading: 'notifications' })
    try {
        yield all([
            put({ type: "UPDATE_NOTIFICATION_DATA", payload: action.data.data }),
            put({ type: "INCREASE_COUNTER" }),
        ])
        const openNotification = (placement, extra, title) => {
            notification.info({
                message: extra,
                description:
                    title,
                placement,
            });
        };
        openNotification('bottomRight', action.data.data.extra, action.data.data.title)
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    }
    catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }

    yield put({ type: 'HIDE_LOADER_COMPONENT', loading: 'notifications' })
}

// TODO exclude user
export function* workerTypeCreateNotification(action) {
    try {
        const title = {
            'Sales Project': `A New Sales Project [ID : ${action.id}] has been ${action.action} .`,
            'Ticket': `[Project ID : ${action.id}.] A new Ticket has been ${action.action}`,
            'Customer': `A Customer [ID : ${action.id}] has been ${action.action} . `,
            'Vendor': `A New Vendor [ID : ${action.id} ] has been ${action.action} .`,
            'Requirements': `[${action.subject} ID : ${action.url_id} / Requirement ID : ${action.id}] has been ${action.action}.`,
            'Forecast': `[${action.subject} ID : ${action.url_id} / Forecast ID : ${action.id}] has been ${action.action}.`,
            'Project Item': `[${action.subject} ID : ${action.url_id} / Project Item ID : ${action.id}] has been ${action.action}.`,
            'Quotations': `[${action.subject} ID : ${action.id} / Quotation ID : ${action.url_id}] has been ${action.action}.`,
            'Notations': `[Project ID : ${action.id}] A notation has been ${action.action}.`,
            'Approval': `[Workflow ID : ${action.id}] An approval has been ${action.action}.`,
            'Automation': `[Workflow ID : ${action.id}] An Automation has been ${action.action}.`,
            'Approvals': `[Workflow ID : ${action.id}] Approvals have been ${action.action}.`,
            'Transition': `[Workflow ID : ${action.id}] A new Transition have been ${action.action}.`,
            'Users': `[Project ID : ${action.id}.] Users : ${action.users} has been ${action.action}.`,
            'Quotations(Multi)': `[${action.subject} ID : ${action.id} / Quotation ID : <${action.url_id}>] has/have been ${action.action}.`,
            'Quotations/Items': `[${action.subject} ID : ${action.id} / Quotation ID : ${action.url_id}] ${action.action}.`,
            'Project/Customer': `[Project ID : ${action.id}] Customer has been changed to ${action.action}.`,
            'Budget Block': `[${action.subject} : ${action.url_id}  / Budget Block ID : ${action.url_id}] Budget Block has been ${action.action}.`,
        }[action.extra]

        const object_url = {
            'Sales Project': `/project/detail/${action.id}`,
            'Requirements': `/project/detail/${action.url_id}`,
            'Forecast': `/project/detail/${action.url_id}`,
            'Project Item': `/project/detail/${action.url_id}`,
            'Quotations': `/quotation/detail/${action.url_id}`,
            'Notations': `/project/detail/${action.id}`,
            'Ticket': `/ticket/detail/${action.id}`,
            'Customer': `/customer/detail/${action.id}`,
            'Vendor': `/vendor/detail/${action.id}`,
            'Approval': `/workflows/view/${action.id}`,
            'Approvals': `/workflows/view/${action.id}`,
            'Automation': `/workflows/view/${action.id}`,
            'Transition': `/workflows/view/${action.id}`,
            'Users': `/project/detail/${action.id}`,
            'Quotations(Multi)': `/project/detail/${action.id}`,
            'Quotations/Items': `/project/detail/${action.id}`,
            'Project/Customer': `/project/detail/${action.id}`,
            'Budget Block': `/project/detail/${action.url_id}`,
        }[action.extra]
        const targets = action.targets.map(target => {
            if (target !== store.getState().auth.userprofile) {
                return target
            }
        })
        yield call(() => axiosInstance.post(`/notifications/typecreate/`,
            {
                targets: targets,
                extra: action.extra,
                object_url: object_url,
                title: title,
                action: action.action
            }))
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}

const walk = (node1, node2) => {
    // different types, return false
    if (typeof node1 !== typeof node2) return false
    if (node1 && node2 && typeof node1 === 'object') {
        const keys = Object.keys(node1)
        // if type object, check same number of keys and walk on node1, node2
        return keys.length === Object.keys(node2).length &&
            keys.every(k => walk(node1[k], node2[k]))
    }
    // not object and types are same, return if node1 is equal to node2
    return node1 === node2
}

// TODO exclude user and special case scenarios
export function* workerTypeUpdateNotification(action) {
    try {
        const data1 = action.original
        const data2 = action.final
        const difference = Object.keys(data1).filter((key) => !walk(data1[key], data2[key]))

        const title = `[${action.subject ? action.subject : ''}${action.extra} ID : ${action.id}] fields: <${difference}> has been updated`
        const object_url = {
            'Sales Project': `/project/detail/${action.id}`,
            'Quotations': `/quotation/detail/${action.id}`,
            'Requirements': `/project/detail/${action.url_id}`,
            'Notations': `/project/detail/${action.id}`,
            'Ticket': `/ticket/detail/${action.id}`,
            'Customer': `/customer/detail/${action.id}`,
            'Vendor': `/vendor/detail/${action.id}`,
            'Project Item': `/project/detail/${action.url_id}`,
            'Forecast': `/project/detail/${action.url_id}`,
        }[action.extra]
        const targets = action.targets.map(target => {
            if (target !== store.getState().auth.userprofile) {
                return target
            }
        })
        yield call(() => axiosInstance.post(`/notifications/typecreate/`,
            {
                targets: targets,
                extra: action.extra,
                object_url: object_url,
                title: title,
                action: 'updated'
            }))
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}





export function* watchLoadNotifications() {
    yield takeEvery('LOAD_NOTIFICATION', workerLoadNotifications)
}

export function* watchLoadNextNotifications() {
    yield takeEvery('LOAD_NEXT_NOTIFICATION', workerLoadNextNotifications)
}


export function* watchReadNotification() {
    yield takeEvery('READ_NOTIFICATION', workerReadNotification)
}

export function* watchReadAllNotification() {
    yield takeEvery('READ_ALL_NOTIFICATIONS', workerReadAllNotification)
}

export function* watchLoadNewNotification() {
    yield takeEvery('LOAD_NEW_NOTIFICATION', workerLoadNewNotification)
}

export function* watchTypeCreateNotification() {
    yield takeEvery('CREATE_NOTIFICATION', workerTypeCreateNotification)
}


export function* watchTypeUpdateNotification() {
    yield takeEvery('UPDATE_NOTIFICATION', workerTypeUpdateNotification)
}





export default function* notificationSaga() {
    yield all([
        watchLoadNotifications(),
        watchReadNotification(),
        watchReadAllNotification(),
        watchLoadNewNotification(),
        watchTypeCreateNotification(),
        watchTypeUpdateNotification(),
        watchLoadNextNotifications(),
    ])
}