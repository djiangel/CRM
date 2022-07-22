import { updateObject } from "../utility";


const initialState = {
    notifications: [],
    counter: null,
    workflow_counter: {
        project_counter: 0,
        quotation_counter: 0,
        ticket_counter: 0,
        customer_counter: 0,
        vendor_counter: 0
    },
};

const storeNotificationData = (state, action) => {
    return updateObject(state, {
        notifications: action.payload,
    });
}

const updateNotificationData = (state, action) => {
    return updateObject(state, {
        notifications: [action.payload, ...state.notifications]
    });
}

const storeExtraNotificationData = (state, action) => {
    return updateObject(state, {
        notifications: state.notifications.concat(action.payload)
    });
}

const storeCounterData = (state, action) => {
    return updateObject(state, {
        counter: action.payload,
    });
}

const storeWorkflowCounterData = (state, action) => {
    return updateObject(state, {
        workflow_counter: {
            project_counter: action.payload.project_count,
            customer_counter: action.payload.customer_count,
            vendor_counter: action.payload.vendor_count,
            ticket_counter: action.payload.ticket_count,
            quotation_counter: action.payload.quotation_count,
        },
    })
}

const readNotificationData = (state, action) => {
    return updateObject(state, {
        notifications: state.notifications.map(d => {
            if (d['id'] === action.payload) {
                return {
                    ...d,
                    read: true
                }
            } else return { ...d }
        })
    });
}

const readAllNotificationData = (state, action) => {
    return updateObject(state, {
        notifications: state.notifications.map(d => {
            return {
                ...d,
                read: true
            }
        }
        )
    });
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'STORE_NOTIFICATION_DATA': return storeNotificationData(state, action);
        case 'STORE_EXTRA_NOTIFICATION_DATA': return storeExtraNotificationData(state, action);
        case 'UPDATE_NOTIFICATION_DATA': return updateNotificationData(state, action);
        case 'READ_NOTIFICATION_DATA': return readNotificationData(state, action);
        case 'READ_ALL_NOTIFICATIONS_DATA': return readAllNotificationData(state, action);
        case 'STORE_COUNTER_DATA': return storeCounterData(state, action);
        case 'STORE_WORKFLOW_COUNTER_DATA': return storeWorkflowCounterData(state, action);
        case 'DECREASE_COUNTER': return updateObject(state, {
            counter: state.counter - 1,
        });
        case 'INCREASE_COUNTER': return updateObject(state, {
            counter: state.counter + 1,
        });


        default:
            return state;
    }
}

export default reducer;

