import { updateObject } from "../utility";


const initialState = {
    tickets: {
        active: [],
        inactive: [],
        approval: [],
        unassigned: [],
        permissions: [],
    },
    ticket: {},
};


const storeData = (state, action) => {
    switch (action.fetch) {
        case 'tickets': return (updateObject(state, {
            tickets: {
                ...state.tickets,
                [action.label]: action.payload
            }
        }));
        case 'ticket': return (updateObject(state, { ticket: action.payload }));
    }
}


const storeUpdate = (state, action) => {
    switch (action.fetch) {
        case 'UPDATE_TICKET_LIST': return updateObject(state, {
            tickets: [...state.tickets, action.payload],
        })
        case 'UPDATE_TICKET_DETAILS': return updateObject(state, {
            ticket: action.payload
        });
    }
}


const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'STORE_TICKET_DATA': return storeData(state, action);
        case 'STORE_TICKET_UPDATE': return storeUpdate(state, action);
        default:
            return state;
    }
}

export default reducer;
