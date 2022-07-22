import { updateObject } from "../utility";

const initialState = {
    project: {
        visible: false,
        layout: {
            lg: [
                { i: 'card', x: 0, y: 0, w: 6, h: 8, minH: 8, },
                { i: 'calendar', x: 0, y: 8, w: 6, h: 25 },
                { i: 'forecast', x: 6, y: 0, w: 6, h: 18 },
                { i: 'workflow', x: 6, y: 18, w: 3, h: 15 },
                { i: 'activities', x: 9, y: 18, w: 3, h: 15 },
                { i: 'requirements', x: 0, y: 33, w: 6, h: 36 },
                { i: 'blocks', x: 0, y: 69, w: 6, h: 36 },
                { i: 'quotations', x: 6, y: 69, w: 6, h: 36 },
                { i: 'notations', x: 6, y: 33, w: 6, h: 36 },
                { i: 'tickets', x: 0, y: 105, w: 12, h: 36 },
            ],
            md: [
                { i: 'card', x: 0, y: 0, w: 5, h: 8, minH: 8, },
                { i: 'calendar', x: 0, y: 8, w: 5, h: 25 },
                { i: 'forecast', x: 5, y: 0, w: 5, h: 18 },
                { i: 'workflow', x: 5, y: 18, w: 2, h: 15 },
                { i: 'activities', x: 7, y: 18, w: 3, h: 15 },
                { i: 'requirements', x: 0, y: 33, w: 5, h: 36 },
                { i: 'blocks', x: 0, y: 69, w: 5, h: 36 },
                { i: 'quotations', x: 5, y: 69, w: 5, h: 36 },
                { i: 'notations', x: 5, y: 33, w: 5, h: 36 },
                { i: 'tickets', x: 0, y: 105, w: 10, h: 36 },
            ],
            sm: [
                { i: 'card', x: 0, y: 0, w: 4, h: 8, minH: 8, },
                { i: 'calendar', x: 0, y: 8, w: 4, h: 25 },
                { i: 'forecast', x: 2, y: 33, w: 4, h: 18 },
                { i: 'workflow', x: 0, y: 33, w: 2, h: 18 },
                { i: 'activities', x: 4, y: 0, w: 2, h: 33 },
                { i: 'requirements', x: 0, y: 51, w: 3, h: 36 },
                { i: 'blocks', x: 0, y: 87, w: 3, h: 36 },
                { i: 'quotations', x: 3, y: 87, w: 3, h: 36 },
                { i: 'notations', x: 3, y: 51, w: 3, h: 36 },
                { i: 'tickets', x: 0, y: 123, w: 6, h: 36 },
            ],
        },
        pre_layout: {
            lg: [],
            md: [],
            sm: []
        },
        toolbox: {
            lg: [],
            md: [],
            sm: []
        },
        pre_toolbox: {
            lg: [],
            md: [],
            sm: []
        },
        breakpoint: 'lg'
    },
    customer: {
        visible: false,
        layout: {
            lg: [
                { i: 'details', x: 0, y: 0, w: 6, h: 11, minH: 11, },
                { i: 'calendar', x: 0, y: 11, w: 6, h: 22 },
                { i: 'workflow', x: 6, y: 12, w: 3, h: 21 },
                { i: 'active-projects', x: 6, y: 0, w: 3, h: 6 },
                { i: 'completed-projects', x: 9, y: 0, w: 3, h: 6 },
                { i: 'revenue-count', x: 6, y: 6, w: 3, h: 6 },
                { i: 'revenue-percent', x: 9, y: 6, w: 3, h: 6 },
                { i: 'activities', x: 9, y: 12, w: 3, h: 21 },
                { i: 'pocs', x: 0, y: 33, w: 6, h: 36 },
                { i: 'projects', x: 6, y: 33, w: 6, h: 36 },
                { i: 'spot-orders', x: 0, y: 69, w: 6, h: 36 },
                { i: 'project-based', x: 6, y: 69, w: 6, h: 36 },
                { i: 'tickets', x: 0, y: 105, w: 12, h: 36 },
            ],
            md: [
                { i: 'details', x: 0, y: 0, w: 5, h: 11, minH: 11, },
                { i: 'calendar', x: 0, y: 11, w: 5, h: 22 },
                { i: 'workflow', x: 5, y: 12, w: 2, h: 21 },
                { i: 'active-projects', x: 5, y: 0, w: 2, h: 6 },
                { i: 'completed-projects', x: 5, y: 6, w: 2, h: 6 },
                { i: 'revenue-count', x: 7, y: 0, w: 3, h: 6 },
                { i: 'revenue-percent', x: 7, y: 6, w: 3, h: 6 },
                { i: 'activities', x: 7, y: 12, w: 3, h: 21 },
                { i: 'pocs', x: 0, y: 33, w: 5, h: 36 },
                { i: 'projects', x: 5, y: 33, w: 5, h: 36 },
                { i: 'spot-orders', x: 0, y: 69, w: 5, h: 36 },
                { i: 'project-based', x: 5, y: 69, w: 5, h: 36 },
                { i: 'tickets', x: 0, y: 105, w: 10, h: 36 },
            ],
            sm: [
                { i: 'details', x: 0, y: 0, w: 4, h: 11, minH: 11, },
                { i: 'calendar', x: 0, y: 11, w: 4, h: 22 },
                { i: 'workflow', x: 4, y: 24, w: 2, h: 9 },
                { i: 'active-projects', x: 4, y: 0, w: 2, h: 6 },
                { i: 'completed-projects', x: 4, y: 6, w: 2, h: 6 },
                { i: 'revenue-count', x: 4, y: 12, w: 2, h: 6 },
                { i: 'revenue-percent', x: 4, y: 18, w: 2, h: 6 },
                { i: 'activities', x: 3, y: 33, w: 3, h: 36 },
                { i: 'pocs', x: 0, y: 33, w: 3, h: 36 },
                { i: 'projects', x: 0, y: 105, w: 3, h: 36 },
                { i: 'spot-orders', x: 0, y: 69, w: 3, h: 36 },
                { i: 'project-based', x: 3, y: 69, w: 3, h: 36 },
                { i: 'tickets', x: 3, y: 105, w: 3, h: 36 },
            ],
        },
        pre_layout: {
            lg: [],
            md: [],
            sm: []
        },
        toolbox: {
            lg: [],
            md: [],
            sm: []
        },
        pre_toolbox: {
            lg: [],
            md: [],
            sm: []
        },
        breakpoint: 'lg'

    },
    vendor: {
        visible: false,
        layout: {
            lg: [
                { i: 'details', x: 0, y: 0, w: 6, h: 11, minH: 11, },
                { i: 'workflow', x: 6, y: 0, w: 3, h: 11 },
                { i: 'activities', x: 9, y: 0, w: 3, h: 11 },
                { i: 'pocs', x: 0, y: 11, w: 4, h: 22 },
                { i: 'blocks', x: 4, y: 11, w: 4, h: 22 },
                { i: 'calendar', x: 8, y: 11, w: 4, h: 22 },
            ],
            md: [
                { i: 'details', x: 0, y: 0, w: 5, h: 11, minH: 11, },
                { i: 'workflow', x: 5, y: 0, w: 2, h: 11 },
                { i: 'activities', x: 7, y: 0, w: 3, h: 11 },
                { i: 'pocs', x: 0, y: 11, w: 3, h: 22 },
                { i: 'blocks', x: 3, y: 11, w: 3, h: 22 },
                { i: 'calendar', x: 6, y: 11, w: 4, h: 22 },
            ],
            sm: [
                { i: 'details', x: 0, y: 0, w: 3, h: 11, minH: 11, },
                { i: 'workflow', x: 3, y: 0, w: 1, h: 11 },
                { i: 'activities', x: 4, y: 0, w: 2, h: 11 },
                { i: 'pocs', x: 0, y: 11, w: 2, h: 22 },
                { i: 'blocks', x: 2, y: 11, w: 2, h: 22 },
                { i: 'calendar', x: 4, y: 11, w: 2, h: 22 },
            ],
        },
        pre_layout: {
            lg: [],
            md: [],
            sm: []
        },
        toolbox: {
            lg: [],
            md: [],
            sm: []
        },
        pre_toolbox: {
            lg: [],
            md: [],
            sm: []
        },
        breakpoint: 'lg'

    }
};

const changeLayout = (state, action) => {
    if (action.page === 'project') {
        return (updateObject(state, { project: { ...state.project, visible: action.visible } }))
    }
    else if (action.page === 'customer') {
        return (updateObject(state, { customer: { ...state.customer, visible: action.visible } }))
    }
    else if (action.page === 'vendor') {
        return (updateObject(state, { vendor: { ...state.vendor, visible: action.visible } }))
    }
}

const onChangeLayout = (state, action) => {
    return (updateObject(state, { [action.page]: { ...state[action.page], pre_layout: action.layout } }))
}

const exitLayout = (state, action) => {
    return (updateObject(state, { [action.page]: { ...state[action.page], pre_layout: state[action.page].layout, visible: false } }))
}


const storeLayout = (state, action) => {
    return (updateObject(state, {
        project: {
            ...state.project,
            layout: {
                ...state.layout, lg: action.project.lg ? action.project.lg : state.project.layout.lg,
                md: action.project.md ? action.project.md : state.project.layout.md,
                sm: action.project.sm ? action.project.sm : state.project.layout.sm,
            }, pre_layout: {
                ...state.pre_layout, lg: action.project.lg ? action.project.lg : state.project.layout.lg,
                md: action.project.md ? action.project.md : state.project.layout.md,
                sm: action.project.sm ? action.project.sm : state.project.layout.sm,
            }
        },
        customer: {
            ...state.customer,
            layout: {
                ...state.layout, lg: action.customer.lg ? action.customer.lg : state.customer.layout.lg,
                md: action.customer.md ? action.customer.md : state.customer.layout.md,
                sm: action.customer.sm ? action.customer.sm : state.customer.layout.sm,
            }, pre_layout: {
                ...state.pre_layout, lg: action.customer.lg ? action.customer.lg : state.customer.layout.lg,
                md: action.customer.md ? action.customer.md : state.customer.layout.md,
                sm: action.customer.sm ? action.customer.sm : state.customer.layout.sm,
            }
        },
        vendor: {
            ...state.vendor,
            layout: {
                ...state.layout, lg: action.vendor.lg ? action.vendor.lg : state.vendor.layout.lg,
                md: action.vendor.md ? action.vendor.md : state.vendor.layout.md,
                sm: action.vendor.sm ? action.vendor.sm : state.vendor.layout.sm,
            }, pre_layout: {
                ...state.pre_layout, lg: action.vendor.lg ? action.vendor.lg : state.vendor.layout.lg,
                md: action.vendor.md ? action.vendor.md : state.vendor.layout.md,
                sm: action.vendor.sm ? action.vendor.sm : state.vendor.layout.sm,
            }
        }
    }))
}

const onChangeItem = (state, action) => {
    if (action.action === 'remove') {
        return (updateObject(state, {
            [action.page]: {
                ...state[action.page], pre_toolbox: { ...state[action.page].pre_toolbox, [state[action.page].breakpoint]: [...state[action.page].pre_toolbox[state[action.page].breakpoint], action.item] },
                pre_layout: { ...state[action.page].pre_layout, [state[action.page].breakpoint]: state[action.page].pre_layout[state[action.page].breakpoint].filter(item => item.i !== action.item.i) }
            }
        }))
    }
    else {
        return (updateObject(state, {
            [action.page]: {
                ...state[action.page], pre_toolbox: { ...state[action.page].pre_toolbox, [state[action.page].breakpoint]: state[action.page].pre_toolbox[state[action.page].breakpoint].filter(tool => tool.i !== action.item.i) },
                pre_layout: { ...state[action.page].pre_layout, [state[action.page].breakpoint]: [...state[action.page].pre_layout[state[action.page].breakpoint], action.item] }
            }
        }))
    }
}

const storeToolbox = (state, action) => {
    return (updateObject(state, {
        project: {
            ...state.project,
            toolbox: {
                ...state.toolbox, lg: action.project.lg ? action.project.lg : state.project.toolbox.lg,
                md: action.project.md ? action.project.md : state.project.toolbox.md,
                sm: action.project.sm ? action.project.sm : state.project.toolbox.sm,
            }, pre_toolbox: {
                ...state.pre_toolbox, lg: action.project.lg ? action.project.lg : state.project.toolbox.lg,
                md: action.project.md ? action.project.md : state.project.toolbox.md,
                sm: action.project.sm ? action.project.sm : state.project.toolbox.sm,
            }
        },
        customer: {
            ...state.customer,
            toolbox: {
                ...state.toolbox, lg: action.customer.lg ? action.customer.lg : state.customer.toolbox.lg,
                md: action.customer.md ? action.customer.md : state.customer.toolbox.md,
                sm: action.customer.sm ? action.customer.sm : state.customer.toolbox.sm,
            }, pre_toolbox: {
                ...state.pre_toolbox, lg: action.customer.lg ? action.customer.lg : state.customer.toolbox.lg,
                md: action.customer.md ? action.customer.md : state.customer.toolbox.md,
                sm: action.customer.sm ? action.customer.sm : state.customer.toolbox.sm,
            }
        },
        vendor: {
            ...state.vendor,
            toolbox: {
                ...state.toolbox, lg: action.vendor.lg ? action.vendor.lg : state.vendor.toolbox.lg,
                md: action.vendor.md ? action.vendor.md : state.vendor.toolbox.md,
                sm: action.vendor.sm ? action.vendor.sm : state.vendor.toolbox.sm,
            }, pre_toolbox: {
                ...state.pre_toolbox, lg: action.vendor.lg ? action.vendor.lg : state.vendor.toolbox.lg,
                md: action.vendor.md ? action.vendor.md : state.vendor.toolbox.md,
                sm: action.vendor.sm ? action.vendor.sm : state.vendor.toolbox.sm,
            }
        }
    }))
}


const onChangeBreakpoint = (state, action) => {
    return (updateObject(state, {
        [action.page]: { ...state[action.page], breakpoint: action.breakpoint }
    }))
}


const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'CHANGE_LAYOUT': return changeLayout(state, action);
        case 'LAYOUT_ONCHANGE': return onChangeLayout(state, action);
        case 'STORE_LAYOUT': return storeLayout(state, action);
        case 'ITEM_ONCHANGE': return onChangeItem(state, action);
        case 'STORE_TOOLBOX': return storeToolbox(state, action);
        case 'BREAKPOINT_ONCHANGE': return onChangeBreakpoint(state, action);
        case 'EXIT_LAYOUT': return exitLayout(state, action);
        default:
            return state;
    }
}

export default reducer;
