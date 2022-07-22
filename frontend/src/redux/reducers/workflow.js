import { updateObject } from "../utility";

const initialState = {
    workflowclasses: [],
    workflowclass: {},
    workflowobject:{},
    statelist:[],
    automationlist:[],
};

const loadWorkflowClass = (state, action) => {
    return updateObject(state, {
        workflowclass: { ...state.workflowclass, [action.label]: action.payload }
    })
}

const loadWorkflowObject = (state, action) => {

    return updateObject(state, {
        workflowobject: { ...state.workflowobject, [action.label]: action.payload }
    })
}


// For Create function (CLASS)
const appendWorkflowClass = (state, action) => {
    return updateObject(state, {
        workflowclass: { ...state.workflowclass, [action.label]: state.workflowclass[action.label].concat(action.payload) }
    })
}


// For DELETE function (CLASS)
const removeWorkflowClass = (state, action) => {
    return updateObject(state, {
        workflowclass: { ...state.workflowclass,  [action.label]: state.workflowclass[action.label].filter((item) => item.id !== action.payload) }
    })
}


const clearClassStates = (state, action) => {
    return updateObject(state, {
        workflowclass: {},
    })
}

const clearObjectStates = (state, action) => {
    return updateObject(state, {
        workflowobject: {},
    })
}


const appendStatelist = (state, action) => {
    return updateObject(state, {
        statelist: [...state.statelist , action.payload],
    })
}

const removeStatelist = (state, action) => {
    return updateObject(state, {
        statelist: state.statelist.filter((item) => item.id !== action.payload),
    })
}

const appendAutomationlist = (state, action) => {
    return updateObject(state, {
        automationlist: [...state.automationlist , action.payload],
    })
}

const removeAutomationlist = (state, action) => {
    return updateObject(state, {
        automationlist: state.automationlist.filter((item) => item.id !== action.payload),
    })
}


// Helpers
const storeData = (state, action) => {
    switch (action.fetch) {
        case 'workflowclasses': return (updateObject(state, { workflowclasses: action.payload }));
        case 'workflowclass': return loadWorkflowClass(state, action)
        case 'workflowobject': return loadWorkflowObject(state, action)
        case 'statelist': return (updateObject(state, { statelist: action.payload }))
        case 'automationlist': return (updateObject(state, { automationlist: action.payload }))
    }
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'STORE_WORKFLOW_DATA': return storeData(state, action);
        case 'UPDATE_WORKFLOW_DATA': return appendWorkflowClass(state, action);
        case 'REMOVE_WORKFLOW_DATA': return removeWorkflowClass(state, action);
        case 'CLEAR_CLASS_STATES': return clearClassStates(state, action);
        case 'CLEAR_OBJECT_STATES': return clearObjectStates(state, action);

        case 'UPDATE_AUTOMATION_LIST': return appendAutomationlist(state, action);
        case 'REMOVE_AUTOMATION_LIST': return removeAutomationlist(state, action);

        case 'UPDATE_STATE_LIST': return appendStatelist(state, action);
        case 'REMOVE_STATE_LIST': return removeStatelist(state, action);

        default:
            return state;
    }
}

export default reducer;
