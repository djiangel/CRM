import { put, takeEvery, call, all } from 'redux-saga/effects'
import axiosInstance from '../../api/axiosApi';

export function* workerTicketList(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'ticketall' })
    try {
        const [activeTickets, approvals, inactiveTickets] = yield all([
            call(() => axiosInstance.get(`/ticket/`)),
            call(() => axiosInstance.get(`/ticket/getapprovals/`)),
            call(() => axiosInstance.get(`/ticket/getinactivetickets/`)),
        ])
        console.log('hey')
        const [assignedTickets, unassignedTickets] = activeTickets.data.reduce(
            (arr, o) => (arr[+(o.assigned_to === null)].push(o), arr),
            [[], []]);
        yield all([
            put({ type: "STORE_TICKET_DATA", payload: assignedTickets, fetch: 'tickets', label: 'active' }),
            put({ type: "STORE_TICKET_DATA", payload: unassignedTickets, fetch: 'tickets', label: 'unassigned' }),
            put({ type: "STORE_TICKET_DATA", payload: approvals.data, fetch: 'tickets', label: 'approval' }),
            put({ type: "STORE_TICKET_DATA", payload: inactiveTickets.data.tickets, fetch: 'tickets', label: 'inactive' }),
            put({ type: "STORE_TICKET_DATA", payload: inactiveTickets.data.permissions, fetch: 'tickets', label: 'permissions' }),
        ])
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
        yield put({ type: 'HIDE_LOADER', loading: 'ticketall' })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'ticketall' })
}

export function* workerTicketDetail(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'ticket' })
    try {
        const data = yield call(() => axiosInstance.get(`/ticket/${action.id}/`))
        yield put({ type: "STORE_TICKET_DATA", payload: data.data, fetch: 'ticket' })
    } catch (error) {
        const errordata = {
            error: {
                status: [404, 403, 500].includes(error.response.status) ? error.response.status : 'warning',
                message: error.response.data
            }
        }
        yield put({ type: "STORE_TICKET_DATA", payload: errordata, fetch: 'ticket' })
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'ticket' })
}


export function* workerTicketComponents(action) {
    try {
        yield put({ type: 'SHOW_LOADER_COMPONENT', loading: action.loading })
        yield put({ type: "STORE_TICKET_UPDATE", payload: action.data, fetch: action.fetch })
        yield put({ type: 'HIDE_LOADER_COMPONENT', loading: action.loading })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}





export function* watchTicketlist() {
    yield takeEvery('TICKET_LIST', workerTicketList)
}


export function* watchTicketDetail() {
    yield takeEvery('TICKET_DETAIL', workerTicketDetail)
}

export function* watchTicketComponents() {
    yield takeEvery('TICKET_COMPONENTS', workerTicketComponents)
}




export default function* ticketSaga() {
    yield all([
        watchTicketlist(),
        watchTicketComponents(),
        watchTicketDetail(),

    ])
}