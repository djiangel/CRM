import { put, takeEvery, call, all, takeLatest } from 'redux-saga/effects'
import axiosInstance from '../../api/axiosApi';
import moment from 'moment';
import store from '../store';

export function* workerAdminSettings(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'adminsettings' })
        const data = yield call(() => axiosInstance.get(`/actual-state/`))
        yield put({ type: "STORE_DATA", payload: data.data, fetch: 'actual_state' })
        yield put({ type: 'HIDE_LOADER', loading: 'adminsettings' })
    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error });
        yield put({ type: 'HIDE_LOADER', loading: 'adminsettings' })
    }
}

export function* workerSalesProjectDetail(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'salesproject' })
        const data = yield call(() => axiosInstance.get(`/sales-project/${action.id}/`))
        yield put({ type: "STORE_DATA", payload: data.data, fetch: 'project' })
        yield put({ type: 'HIDE_LOADER', loading: 'salesproject' })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        const errordata = {
            error: {
                status: [404, 403, 500].includes(error.response.status) ? error.response.status : 'warning',
                message: error.response.data
            }
        }
        yield put({ type: "STORE_DATA", payload: errordata, fetch: 'project' })
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
        yield put({ type: 'HIDE_LOADER', loading: 'salesproject' })
    }
}

export function* workerSalesProjectList(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'salesprojectall' })
        const [activeProjects, approvals, inactiveProjects] = yield all([
            call(() => axiosInstance.get('/sales-project/')),
            call(() => axiosInstance.get(`/sales-project/getapprovals/`)),
            call(() => axiosInstance.get(`/sales-project/getinactiveprojects/`)),
        ])
        yield all([
            put({ type: "STORE_DATA", payload: activeProjects.data, fetch: 'projects', label: 'active' }),
            put({ type: "STORE_DATA", payload: approvals.data, fetch: 'projects', label: 'approval' }),
            put({ type: "STORE_DATA", payload: inactiveProjects.data.projects, fetch: 'projects', label: 'inactive' }),
            put({ type: "STORE_DATA", payload: inactiveProjects.data.permissions, fetch: 'projects', label: 'permissions' })
        ])
        yield put({ type: 'HIDE_LOADER', loading: 'salesprojectall' })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

export function* workerCustomerList(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'customerall' })
        const [activeCustomers, approvals, inactiveCustomers] = yield all([
            call(() => axiosInstance.get('/customer-information/')),
            call(() => axiosInstance.get('/customer-information/getapprovals/')),
            call(() => axiosInstance.get('/customer-information/getinactivecustomers/')),
        ])
        const [registeredCustomers, closedCustomers] = inactiveCustomers.data.customers.reduce(
            (arr, o) => (arr[+(o.sap_code === null)].push(o), arr),
            [[], []]);

        yield all([
            put({ type: "STORE_DATA", payload: activeCustomers.data, fetch: 'customers', label: 'active' }),
            put({ type: "STORE_DATA", payload: closedCustomers, fetch: 'customers', label: 'inactive' }),
            put({ type: "STORE_DATA", payload: approvals.data, fetch: 'customers', label: 'approval' }),
            put({ type: "STORE_DATA", payload: inactiveCustomers.data.permissions, fetch: 'customers', label: 'permissions' }),
            put({ type: "STORE_DATA", payload: registeredCustomers, fetch: 'customers', label: 'registered' })
        ])

        yield put({ type: 'HIDE_LOADER', loading: 'customerall' })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
        yield put({ type: 'HIDE_LOADER', loading: 'customerall' })
    }
}

export function* workerCustomerDetail(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'customer' })
        const data = yield call(() => axiosInstance.get(`/customer-information/${action.id}/`))
        yield put({ type: "STORE_DATA", payload: data.data, fetch: 'customer' })
        yield put({ type: 'HIDE_LOADER', loading: 'customer' })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        const errordata = {
            error: {
                status: [404, 403, 500].includes(error.response.status) ? error.response.status : 'warning',
                message: error.response.data
            }
        }
        yield put({ type: "STORE_DATA", payload: errordata, fetch: 'customer' })
        yield put({ type: 'HIDE_LOADER', loading: 'customer' })
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

export function* workerVendorList(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'vendorall' })
        const [activeVendors, approvals, inactiveVendors] = yield all([
            call(() => axiosInstance.get(`/vendor-information/`)),
            call(() => axiosInstance.get(`/vendor-information/getvendorapprovals/`)),
            call(() => axiosInstance.get('/vendor-information/getinactivevendors/')),
        ])
        const [registeredVendors, closedVendors] = inactiveVendors.data.vendor.reduce(
            (arr, o) => (arr[+(o.sap_code === null)].push(o), arr),
            [[], []]);
        yield all([
            put({ type: "STORE_DATA", payload: activeVendors.data, fetch: 'vendors', label: 'active' }),
            put({ type: "STORE_DATA", payload: closedVendors, fetch: 'vendors', label: 'inactive' }),
            put({ type: "STORE_DATA", payload: approvals.data, fetch: 'vendors', label: 'approval' }),
            put({ type: "STORE_DATA", payload: inactiveVendors.data.permissions, fetch: 'vendors', label: 'permissions' }),
            put({ type: "STORE_DATA", payload: registeredVendors, fetch: 'vendors', label: 'registered' })
        ])
        yield put({ type: 'HIDE_LOADER', loading: 'vendorall' })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
        yield put({ type: 'HIDE_LOADER', loading: 'vendorall' })
    }
}

export function* workerSourceList(action) {
    const data = yield call(() => axiosInstance.get(`/lead-source/`))
    yield put({ type: "STORE_DATA", payload: data.data, fetch: 'sources' })
    if (action.message) {
        yield put({ type: "CREATE_MESSAGE", message: action.message })
    }
}

export function* workerVendorDetail(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'vendor' })
        const data = yield call(() => axiosInstance.get(`/vendor-information/${action.id}/`))
        yield put({ type: "STORE_DATA", payload: data.data, fetch: 'vendor' })
        yield put({ type: 'HIDE_LOADER', loading: 'vendor' })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        const errordata = {
            error: {
                status: [404, 403, 500].includes(error.response.status) ? error.response.status : 'warning',
                message: error.response.data
            }
        }
        yield put({ type: "STORE_DATA", payload: errordata, fetch: 'vendor' })
        yield put({ type: 'HIDE_LOADER', loading: 'vendor' })
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

export function* workerItemList(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'itemall' })
        const data = yield call(() => axiosInstance.get(`/item/`))
        yield all([
            put({ type: "STORE_DATA", payload: data.data.items, fetch: 'items', label: 'items' }),
            put({ type: "STORE_DATA", payload: data.data.permissions, fetch: 'items', label: 'permissions' })
        ])
        yield put({ type: 'HIDE_LOADER', loading: 'itemall' })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

export function* workerItemDetail(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'item' })
        const data = yield call(() => axiosInstance.get(`/item/${action.id}/detailpage/`))
        yield put({ type: "STORE_DATA", payload: data.data, fetch: 'item' })
        yield put({ type: 'HIDE_LOADER', loading: 'item' })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        const errordata = {
            error: {
                status: [404, 403, 500].includes(error.response.status) ? error.response.status : 'warning',
                message: error.response.data
            }
        }
        yield put({ type: "STORE_DATA", payload: errordata, fetch: 'item' })
        yield put({ type: 'HIDE_LOADER', loading: 'item' })
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

export function* workerBlockList(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'blockall' })
        const [activeBlocks, approvals, inactiveBlocks] = yield all([
            axiosInstance.get(`/budget-block/`),
            axiosInstance.get(`/budget-block/getapprovals/`),
            axiosInstance.get(`/budget-block/getinactiveblock/`)
        ])
        yield all([
            put({ type: "STORE_DATA", payload: activeBlocks.data, fetch: 'blocks', label: 'active' }),
            put({ type: "STORE_DATA", payload: approvals.data, fetch: 'blocks', label: 'approval' }),
            put({ type: "STORE_DATA", payload: inactiveBlocks.data.block, fetch: 'blocks', label: 'inactive' }),
            put({ type: "STORE_DATA", payload: inactiveBlocks.data.permissions, fetch: 'blocks', label: 'permissions' })
        ])
        yield put({ type: 'HIDE_LOADER', loading: 'blockall' })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

export function* workerBlockDetail(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'block' })
        const data = yield call(() => axiosInstance.get(`/budget-block/${action.id}/`))
        yield put({ type: "STORE_DATA", payload: data.data, fetch: 'block' })
        yield put({ type: 'HIDE_LOADER', loading: 'block' })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        const errordata = {
            error: {
                status: [404, 403, 500].includes(error.response.status) ? error.response.status : 'warning',
                message: error.response.data
            }
        }
        yield put({ type: "STORE_DATA", payload: errordata, fetch: 'block' })
        yield put({ type: 'HIDE_LOADER', loading: 'block' })
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

export function* workerQuotationList(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'quotationall' })
        const [activeQuotations, approvals, inactiveQuotations] = yield all([
            axiosInstance.get(`/quotation/`),
            axiosInstance.get(`/quotation/getapprovals/`),
            axiosInstance.get(`/quotation/getinactivequotations/`)
        ])
        yield all([
            put({ type: "STORE_DATA", payload: activeQuotations.data, fetch: 'quotations', label: 'active' }),
            put({ type: "STORE_DATA", payload: approvals.data, fetch: 'quotations', label: 'approval' }),
            put({ type: "STORE_DATA", payload: inactiveQuotations.data.quotations, fetch: 'quotations', label: 'inactive' }),
            put({ type: "STORE_DATA", payload: inactiveQuotations.data.permissions, fetch: 'quotations', label: 'permissions' })
        ])
        yield put({ type: 'HIDE_LOADER', loading: 'quotationall' })
    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error });
        yield put({ type: 'HIDE_LOADER', loading: 'quotationall' })
    }
}

export function* workerQuotationDetail(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'quotation' })
        const data = yield call(() => axiosInstance.get(`/quotation/${action.id}/`))
        yield put({ type: "STORE_DATA", payload: data.data, fetch: 'quotation' })
        yield put({ type: 'HIDE_LOADER', loading: 'quotation' })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        const errordata = {
            error: {
                status: [404, 403, 500].includes(error.response.status) ? error.response.status : 'warning',
                message: error.response.data
            }
        }
        yield put({ type: "STORE_DATA", payload: errordata, fetch: 'quotation' })
        yield put({ type: 'HIDE_LOADER', loading: 'quotation' })
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

export function* workerQuotationUpdate(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'quotation' })
        yield put({ type: "STORE_UPDATES", payload: action.data, fetch: 'quotation_update' })
        yield put({ type: 'HIDE_LOADER', loading: 'quotation' })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

// updating store with newly added data without making new full api call
export function* workerComponents(action) {
    try {
        yield put({ type: 'SHOW_LOADER_COMPONENT', loading: action.loading })
        yield put({ type: "STORE_UPDATES", payload: action.data, fetch: action.fetch })
        yield put({ type: 'HIDE_LOADER_COMPONENT', loading: action.loading })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

// analytics

export function* workerRangeAnalytics(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: action.loading, modal: action.modal })
        let range; let data; let start = action.start || null; let end = action.end || null; let metric = action.metric || null; let nature; let priority; let source;
        let department = store.getState().api.analytics.department

        if (action.range) {
            yield put({ type: "STORE_DATA", payload: metric, fetch: action.loading, inner: 'metric' })
            console.log('hihhi')
            range = action.loading === 'conversion' ? yield call(() => axiosInstance.get(`/date-range/?metric=${metric}&model=customerinformation&field=created_date`)) :
                action.loading === 'actual_revenue' ? yield call(() => axiosInstance.get(`/date-range/?metric=${metric}&model=salesproject&field=completed_date`)) :
                    action.loading === 'source' ? yield call(() => axiosInstance.get(`/date-range/?metric=${metric}&model=customerinformation&field=created_date`)) :
                        action.loading === 'project_conversion' ? yield call(() => axiosInstance.get(`/date-range/?metric=${metric}&model=salesproject&field=creation_date`)) :
                            action.loading === 'ticket_conversion' ? yield call(() => axiosInstance.get(`/date-range/?metric=${metric}&model=ticket&field=date_created`)) :
                                null
            yield put({ type: "STORE_DATA", payload: range.data, fetch: action.loading, inner: 'range' })
            end = range.data.length ? range.data[range.data.length - 1].end : 0
            start = range.data.length > 3 ?
                metric === 'month' ? moment(range.data[range.data.length - 1].start).subtract(2, 'months').format("YYYY-MM-DD") :
                    metric === 'quarter' ? moment(range.data[range.data.length - 1].start).subtract(6, 'months').format("YYYY-MM-DD") :
                        moment(range.data[range.data.length - 1].start).subtract(2, 'years').format("YYYY-MM-DD") :
                range.data.length !== 0 ? range.data[0].start : 0
        }

        start = start === null ? store.getState().api.analytics.conversion.start : start
        end = end === null ? store.getState().api.analytics.conversion.end : end
        metric = metric === null ? store.getState().api.analytics.conversion.metric : metric

        yield put({ type: "STORE_DATA", payload: start, fetch: action.loading, inner: 'start' })
        yield put({ type: "STORE_DATA", payload: end, fetch: action.loading, inner: 'end' })

        if (action.nature) {
            yield put({ type: "STORE_DATA", payload: action.nature, fetch: action.loading, inner: 'nature' })
        }
        if (action.source) {
            yield put({ type: "STORE_DATA", payload: action.source, fetch: action.loading, inner: 'source' })
        }
        if (action.priority) {
            yield put({ type: "STORE_DATA", payload: action.priority, fetch: action.loading, inner: 'priority' })
        }

        if (action.loading === 'ticket_conversion') {
            nature = store.getState().api.analytics.ticket_conversion.nature
            priority = store.getState().api.analytics.ticket_conversion.priority
            source = store.getState().api.analytics.ticket_conversion.source
        }

        if (start !== 0 && end !== 0) {
            data = action.loading === 'conversion' ? yield call(() => axiosInstance.get(`/customer-converted/?group=${action.group}&metric=${metric}&start=${start}&end=${end}&select=${department}`)) :
                action.loading === 'actual_revenue' ? yield call(() => axiosInstance.get(`/actual-revenue/?metric=${metric}&start=${start}&end=${end}&select=${department}`)) :
                    action.loading === 'source' ? yield call(() => axiosInstance.get(`/customer-source/?group=${action.group}&metric=${metric}&start=${start}&end=${end}&select=${department}`)) :
                        action.loading === 'project_conversion' ? yield call(() => axiosInstance.get(`/project-converted/?group=${action.group}&metric=${metric}&start=${start}&end=${end}&select=${department}`)) :
                            action.loading === 'ticket_conversion' ? yield call(() => axiosInstance.get(`/ticket-converted/?group=${action.group}&metric=${metric}&start=${start}&end=${end}&select=${department}&priority=${priority}&nature=${nature}&source=${source}`)) :
                                null
            yield put({ type: "STORE_DATA", payload: data.data, fetch: action.loading, inner: 'data' })
        }
        yield put({ type: 'HIDE_LOADER', loading: action.loading, modal: action.modal })
        if (action.message) {
            yield put({ type: "CREATE_MESSAGE", message: action.message })
        }
    } catch (error) {
        console.log(error)
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

export function* workerBasicAnalytics(action) {
    try {
        let data;
        let department = store.getState().api.analytics.department
        if (action.loading === 'KPI') { yield put({ type: 'SHOW_LOADER', loading: action.loading }) }
        data = action.loading === 'client' ? yield call(() => axiosInstance.get(`/customer-conversion/?group=${action.group}&select=${department}`)) :
            action.loading === 'KPI' ? yield call(() => axiosInstance.get(`/kpi/?group=${action.group}&select=${department}`)) :
                action.loading === 'country' ? yield call(() => axiosInstance.get(`/customer-country/?group=${action.group}&select=${department}`)) :
                    action.loading === 'estimated_revenue' ? yield call(() => axiosInstance.get(`/estimated-revenue/?select=${department}`)) : null
        if (data) {
            yield put({ type: "STORE_DATA", payload: data.data, fetch: action.loading })
        }
        if (action.loading === 'KPI') { yield put({ type: 'HIDE_LOADER', loading: action.loading }) }

    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

export function* workerDepartment(action) {
    try {
        const data = yield call(() => axiosInstance.get(`/sales-department/`))
        yield put({ type: "STORE_DATA", payload: data.data, fetch: 'department' })

    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}


export function* workerAnalytics(action) {
    try {
        let group = action.group
        if (!action.department) yield workerDepartment();
        let department = action.department ? action.department : store.getState().api.department[0].department_id;
        yield put({ type: "STORE_DATA", payload: department, fetch: 'department_analytics' })
        yield put({ type: 'SHOW_LOADER', loading: action.loading });
        yield all([
            workerBasicAnalytics({ loading: 'client', group: group }),
            workerBasicAnalytics({ loading: 'KPI', group: group }),
            workerBasicAnalytics({ loading: 'country', group: group }),
            workerBasicAnalytics({ loading: 'estimated_revenue', group: group }),
            workerRangeAnalytics({ loading: 'conversion', group: group, metric: 'month', range: true }),
            workerRangeAnalytics({ loading: 'actual_revenue', group: group, metric: 'month', range: true }),
            workerRangeAnalytics({ loading: 'source', group: group, metric: 'month', range: true }),
            workerRangeAnalytics({ loading: 'project_conversion', group: group, metric: 'month', range: true }),
            workerRangeAnalytics({ loading: 'ticket_conversion', group: group, metric: 'month', range: true, priority: 'important', nature: 'complain', source: 'email' })
        ])
        yield put({ type: 'HIDE_LOADER', loading: action.loading })
    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

export function* workerSaveLayout(action) {
    try {
        let layout = {};
        if (action.page === 'project') {
            layout['project_layout'] = JSON.stringify(store.getState().layout.project.pre_layout)
            layout['project_toolbox'] = JSON.stringify(store.getState().layout.project.pre_toolbox)
            yield put({ type: "STORE_LAYOUT", page: 'project', project: store.getState().layout.project.pre_layout, customer: store.getState().layout.customer.layout, vendor: store.getState().layout.vendor.layout })
            yield put({ type: "STORE_TOOLBOX", project: store.getState().layout.project.pre_toolbox, customer: store.getState().layout.customer.toolbox, vendor: store.getState().layout.vendor.toolbox })
            yield put({ type: "CHANGE_LAYOUT", page: 'project', visible: false })
        }
        else if (action.page === 'customer') {
            layout['customer_layout'] = JSON.stringify(store.getState().layout.customer.pre_layout)
            layout['customer_toolbox'] = JSON.stringify(store.getState().layout.customer.pre_toolbox)
            yield put({ type: "STORE_LAYOUT", page: 'customer', customer: store.getState().layout.customer.pre_layout, project: store.getState().layout.project.layout, vendor: store.getState().layout.vendor.layout })
            yield put({ type: "STORE_TOOLBOX", customer: store.getState().layout.customer.pre_toolbox, project: store.getState().layout.project.toolbox, vendor: store.getState().layout.vendor.toolbox })
            yield put({ type: "CHANGE_LAYOUT", page: 'customer', visible: false })
        }
        else if (action.page === 'vendor') {
            layout['vendor_layout'] = JSON.stringify(store.getState().layout.vendor.pre_layout)
            layout['vendor_toolbox'] = JSON.stringify(store.getState().layout.vendor.pre_toolbox)
            yield put({ type: "STORE_LAYOUT", page: 'vendor', vendor: store.getState().layout.vendor.pre_layout, project: store.getState().layout.project.layout, customer: store.getState().layout.customer.layout })
            yield put({ type: "STORE_TOOLBOX", vendor: store.getState().layout.vendor.pre_toolbox, customer: store.getState().layout.customer.toolbox, project: store.getState().layout.project.toolbox })
            yield put({ type: "CHANGE_LAYOUT", page: 'vendor', visible: false })
        }
        const data = yield call(() => axiosInstance.patch(`/userprofile/savelayout/`, layout))
        yield put({ type: "CREATE_MESSAGE", message: 'Successfully changed layout' })
    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

export function* workerLoadLayout(action) {
    try {
        const data = yield call(() => axiosInstance.get(`/userprofile/getlayout`))
        let project_layout = data.data['project_layout'] ? JSON.parse(data.data['project_layout']) : store.getState().layout.project.layout
        let customer_layout = data.data['customer_layout'] ? JSON.parse(data.data['customer_layout']) : store.getState().layout.customer.layout
        let vendor_layout = data.data['vendor_layout'] ? JSON.parse(data.data['vendor_layout']) : store.getState().layout.vendor.layout
        let project_toolbox = data.data['project_toolbox'] ? JSON.parse(data.data['project_toolbox']) : store.getState().layout.project.toolbox
        let customer_toolbox = data.data['customer_toolbox'] ? JSON.parse(data.data['customer_toolbox']) : store.getState().layout.customer.toolbox
        let vendor_toolbox = data.data['vendor_toolbox'] ? JSON.parse(data.data['vendor_toolbox']) : store.getState().layout.vendor.toolbox
        yield put({ type: "STORE_LAYOUT", project: project_layout, customer: customer_layout, vendor: vendor_layout })
        yield put({ type: "STORE_TOOLBOX", project: project_toolbox, customer: customer_toolbox, vendor: vendor_toolbox })

    } catch (error) {
        if (error.response) yield put({ type: "GET_ERRORS", error: error.response.data })
        else yield put({ type: "GET_ERRORS", error: error })
    }
}

export function* watchRangeAnalytics() {
    yield takeEvery('RANGE_ANALYTICS', workerRangeAnalytics)
}

export function* watchBasicAnalytics() {
    yield takeEvery('BASIC_ANALYTICS', workerBasicAnalytics)
}

export function* watchAnalytics() {
    yield takeLatest('ANALYTICS', workerAnalytics)
}

export function* watchDepartment() {
    yield takeLatest('SALES_DEPARTMENT', workerDepartment)
}

export function* watchSalesProjectDetail() {
    yield takeEvery('SALES_PROJECT_DETAIL', workerSalesProjectDetail)
}

export function* watchSalesProjectList() {
    yield takeEvery('SALES_PROJECT_LIST', workerSalesProjectList)
}

export function* watchCustomerList() {
    yield takeEvery('CUSTOMER_LIST', workerCustomerList)
}

export function* watchCustomerDetail() {
    yield takeEvery('CUSTOMER_DETAIL', workerCustomerDetail)
}

export function* watchVendorList() {
    yield takeEvery('VENDOR_LIST', workerVendorList)
}

export function* watchVendorDetail() {
    yield takeEvery('VENDOR_DETAIL', workerVendorDetail)
}

export function* watchSourceList() {
    yield takeLatest('LEAD_SOURCE', workerSourceList)
}

export function* watchItemList() {
    yield takeEvery('ITEM_LIST', workerItemList)
}

export function* watchItemDetail() {
    yield takeEvery('ITEM_DETAIL', workerItemDetail)
}

export function* watchBlockList() {
    yield takeEvery('BLOCK_LIST', workerBlockList)
}

export function* watchBlockDetail() {
    yield takeEvery('BLOCK_DETAIL', workerBlockDetail)
}

export function* watchComponents() {
    yield takeEvery('COMPONENTS', workerComponents)
}

export function* watchQuotationList() {
    yield takeEvery('QUOTATION_LIST', workerQuotationList)
}

export function* watchQuotationDetail() {
    yield takeEvery('QUOTATION_DETAIL', workerQuotationDetail)
}

export function* watchQuotationUpdate() {
    yield takeEvery('QUOTATION_UPDATE', workerQuotationUpdate)
}

export function* watchAdminSettings() {
    yield takeEvery('ADMIN_SETTINGS', workerAdminSettings)
}

export function* watchSaveLayout() {
    yield takeEvery('SAVE_LAYOUT', workerSaveLayout)
}

export function* watchLoadLayout() {
    yield takeEvery('LOAD_LAYOUT', workerLoadLayout)
}


export default function* rootSaga() {
    yield all([
        watchSalesProjectDetail(),
        watchSalesProjectList(),
        watchCustomerList(),
        watchVendorList(),
        watchCustomerDetail(),
        watchVendorDetail(),
        watchSourceList(),
        watchRangeAnalytics(),
        watchBasicAnalytics(),
        watchAnalytics(),
        watchDepartment(),
        watchItemList(),
        watchItemDetail(),
        watchQuotationList(),
        watchQuotationDetail(),
        watchQuotationUpdate(),
        watchBlockList(),
        watchBlockDetail(),
        watchAdminSettings(),
        watchComponents(),
        watchSaveLayout(),
        watchLoadLayout(),
    ])
}