import { updateObject } from "../utility";

const initialState = {
    size: null,
    datatable: null,
    height: 0
};

const mediaQuery = (state, action) => {
    if (action.lg) {
        return (updateObject(state, { size: 'lg' }))
    }
    else if (action.md) {
        return (updateObject(state, { size: 'md' }))
    }
    else if (action.sm) {
        return (updateObject(state, { size: 'sm' }))
    }
    else {
        return (updateObject(state, { size: 'xs' }))
    }
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'MEDIA_QUERY': return mediaQuery(state, action);
        case 'DATATABLE': return updateObject(state, { datatable: action.datatable });
        case 'SCREEN_HEIGHT': return updateObject(state, { height: action.height });
        default:
            return state;
    }
}

export default reducer;
