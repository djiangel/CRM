import { updateObject } from "../utility";
const initialState = {
    error: [],
    message: [],
};


const createMessage = (state, action) => {
    return updateObject(state, {
        message: [...state.message ,action.message],
    });
}

const returnErrors = (state, action) => {
    return updateObject(state, {
        error: [...state.error, action.error],
    });
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'CREATE_MESSAGE': return createMessage(state, action);
        case 'GET_ERRORS': return returnErrors(state, action);
        default:
            return state;
    }
}

export default reducer;