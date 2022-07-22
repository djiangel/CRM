import { put, takeEvery, call, all } from 'redux-saga/effects'
import axiosInstance from '../../api/axiosApi';

export function* workerPersonalCalendar(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'personal_calendar' })
    try {
        const data = yield call(() => axiosInstance.get(`/tasks/`))
        yield put({ type: "STORE_CALENDAR_DATA", payload: data.data, fetch: "STORE_PERSONAL_TASKS" })
    }
    catch (error) {
        yield put({ type: 'HIDE_LOADER', loading: 'personal_calendar' })
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'personal_calendar' })
}

export function* workerProjectCalendar(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'personal_calendar' })
    try {
        const data = yield call(() => axiosInstance.get(`/tasks/?project=${action.project_id}`,))
        yield put({ type: "STORE_CALENDAR_DATA", payload: data.data, fetch: "STORE_PROJECT_TASKS" })
    }
    catch (error) {
        yield put({ type: 'HIDE_LOADER', loading: 'personal_calendar' })
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'personal_calendar' })
}

export function* workerCustomerCalendar(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'customer_calendar' })
    try {
        const data = yield call(() => axiosInstance.get(`/tasks/?customer=${action.customer_id}`,))
        yield put({ type: "STORE_CALENDAR_DATA", payload: data.data, fetch: "STORE_CUSTOMER_TASKS" })
    }
    catch (error) {
        yield put({ type: 'HIDE_LOADER', loading: 'customer_calendar' })
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'customer_calendar' })
}



export function* workerVendorCalendar(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'vendor_calendar' })
    try {
        const data = yield call(() => axiosInstance.get(`/tasks/?vendor=${action.vendor_id}`,))
        yield put({ type: "STORE_CALENDAR_DATA", payload: data.data, fetch: "STORE_VENDOR_TASKS" })
    }
    catch (error) {
        yield put({ type: 'HIDE_LOADER', loading: 'vendor_calendar' })
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'vendor_calendar' })
}



export function* workerCalendarFormData(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'personal_calendar_form_data' })
    try {
        const formdata = yield call(() => axiosInstance.get(`/tasks/getformdata`))
        const data = formdata.data
        const users = data.users.map(user => ({ 'id': user.id, 'display': user.username }))
        const projects = data.projects.map(project => ({ 'id': project.sales_project_id, 'display': project.sales_project_name }))
        const customers = data.customers.map(customer => ({ 'id': customer.customer_id, 'display': customer.customer_name }))
        const vendors = data.vendors.map(vendor => ({ 'id': vendor.vendor_id, 'display': vendor.vendor_name }))
        yield put({ type: "STORE_CALENDAR_FORM_DATA", users: users, projects: projects, customers: customers, vendors: vendors })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'personal_calendar_form_data' })
}


export function* workerCalendarComponents(action) {
    try {
        yield put({ type: 'SHOW_LOADER_COMPONENT', loading: action.loading })
        yield put({ type: "UPDATE_CALENDAR_DATA", payload: action.data, fetch: action.fetch })
        yield put({ type: 'HIDE_LOADER_COMPONENT', loading: action.loading })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}




export function* watchPersonalCalendar() {
    yield takeEvery('PERSONAL_CALENDAR_LIST', workerPersonalCalendar)
}

export function* watchCalendarFormData() {
    yield takeEvery('CALENDAR_LIST_FORM_DATA', workerCalendarFormData)
}

export function* watchProjectCalendar() {
    yield takeEvery('PROJECT_CALENDAR_LIST', workerProjectCalendar)
}
export function* watchCustomerCalendar() {
    yield takeEvery('CUSTOMER_CALENDAR_LIST', workerCustomerCalendar)
}

export function* watchVendorCalendar() {
    yield takeEvery('VENDOR_CALENDAR_LIST', workerVendorCalendar)
}

export function* watchCalendarComponents() {
    yield takeEvery('CALENDAR_COMPONENTS', workerCalendarComponents)
}




export default function* calendarSaga() {
    yield all([
        watchPersonalCalendar(),
        watchCalendarFormData(),
        watchProjectCalendar(),
        watchVendorCalendar(),
        watchCustomerCalendar(),
        watchCalendarComponents(),
    ])
}