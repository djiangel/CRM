import { updateObject } from "../utility";

const initialState = {
    loading: {},
    loadingComponent: null
};


const showLoader = (state, action) => {
    return updateObject(state, {
        loading: { ...state.loading, [action.loading]: true }
    })
}

const hideLoader = (state, action) => {
    return updateObject(state, {
        loading: { ...state.loading, [action.loading]: false }
    })
}

const showLoaderComponent = (state, action) => {
    return updateObject(state, {
        loadingComponent: action.loading
    })
}

const hideLoaderComponent = (state, action) => {
    return updateObject(state, {
        loadingComponent: null
    })
}


const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SHOW_LOADER': return showLoader(state, action);
        case 'HIDE_LOADER': return hideLoader(state, action);
        case 'SHOW_LOADER_COMPONENT': return showLoaderComponent(state, action);
        case 'HIDE_LOADER_COMPONENT': return hideLoaderComponent(state, action);
        default:
            return state;
    }
}

export default reducer;