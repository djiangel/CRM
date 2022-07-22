import { updateObject } from "../utility";


const initialState = {
    userprofile: {},
    userprofiles: [],
};


const storeData = (state, action) => {
    switch (action.fetch) {
        case 'userprofile': return (updateObject(state, { userprofile: action.payload }));
        case 'userprofiles': return (updateObject(state, { userprofiles: action.payload }));
    }
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'STORE_USER_DATA': return storeData(state, action);
        default:
            return state;
    }
}

export default reducer;
