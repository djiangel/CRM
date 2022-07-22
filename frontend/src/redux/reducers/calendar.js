import { updateObject } from '../utility';

const initialState = {
    project_tasks: [],
    personal_tasks: [],
    customer_tasks: [],
    vendor_tasks: [],
    form: {
        users: [],
        projects: [],
        customers: [],
        vendors: [],
    },
}

const storeData = (state, action) => {
    switch (action.fetch) {
        case 'STORE_PROJECT_TASKS': return updateObject(state, {
            project_tasks: action.payload,
        });
        case 'STORE_PERSONAL_TASKS': return updateObject(state, {
            personal_tasks: action.payload,
        });
        case 'STORE_CUSTOMER_TASKS': return updateObject(state, {
            customer_tasks: action.payload,
        });
        case 'STORE_VENDOR_TASKS': return updateObject(state, {
            vendor_tasks: action.payload,
        });
    }
}

const updateData = (state, action) => {
    switch (action.fetch) {
        case 'UPDATE_PROJECT_TASKS': return updateObject(state, {
            project_tasks: [...state.project_tasks, action.payload],
        });
        case 'UPDATE_PERSONAL_TASKS': return updateObject(state, {
            personal_tasks: [...state.personal_tasks, action.payload],
        });
    }
}


const storeFormData = (state, action) => {
    return updateObject(state,
        {
            form: {
                users: action.users,
                projects: action.projects,
                customers: action.customers,
                vendors: action.vendors
            }
        });
}


const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'STORE_CALENDAR_DATA': return storeData(state, action);
        case 'UPDATE_CALENDAR_DATA': return updateData(state, action);
        case 'STORE_CALENDAR_FORM_DATA': return storeFormData(state, action);
        default:
            return state;
    }
}

export default reducer;