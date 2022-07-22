import { updateObject } from '../utility';

const initialState = {
    isAuthenticated: false,
    access_token: null,
    refresh_token: null,
    group: {},
    username: null,
    userprofile: null,
    profile_picture: null,
    active: null,
    email_service: null,
    auth_status: null,

}

const authSuccess = (state, action) => {
    return updateObject(state, {
        access_token: action.payload[0],
        refresh_token: action.payload[1],
        isAuthenticated: true,
        group: action.payload[2],
        username: action.payload[3],
        userprofile: action.payload[4],
        profile_picture: action.payload[5],
        active: true,
        email_service: action.payload[6],
        auth_status: true,
    });
}

const authLogout = (state, action) => {
    return updateObject(state, {
        access_token: null,
        refresh_token: null,
        isAuthenticated: false,
        group: {},
        username: null,
        userprofile: null,
        profile_picture: null,
        active: null,
        email_service: null,
        auth_status: null,
    });
}

const authInactive = (state, action) => {
    return updateObject(state, {
        ...state.auth, active: null
    });
}


const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS': return authSuccess(state, action);
        case 'LOGOUT_SUCCESS': return authLogout(state, action);
        case 'AUTH_INACTIVE': return authInactive(state, action);
        case 'AUTH_ERRORS': return updateObject(state, { ...state.auth, auth_status: false })
        default:
            return state;
    }
}

export default reducer;