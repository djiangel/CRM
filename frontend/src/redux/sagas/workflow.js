
import { put, takeEvery, call, all, takeLatest } from 'redux-saga/effects'
import axiosInstance from '../../api/axiosApi';
import store from '../store';
import { default_class, done_class, cancelled_class, selected_class } from './classCSS'

// -----------------Workflow Class------------------------------------------------- //
export function* workerWorkflowClassList(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'workflowclassesall' })
    try {
        const data = yield call(() => axiosInstance.get(`/workflow/list/`))
        yield put({ type: "STORE_WORKFLOW_DATA", payload: data.data, fetch: 'workflowclasses' })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'workflowclassesall' })
}

export function* workerWorkflowClassDetail(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'workflowclass' })
    try {
        yield put({ type: 'CLEAR_CLASS_STATES' })
        const [transitions, workflow, states] = yield all([
            call(() => axiosInstance.get(`/workflow/transition-meta/list/${action.id}/`)),
            call(() => axiosInstance.get(`/workflow/get/${action.id}/`)),
            call(() => axiosInstance.get(`/workflow/state/list/${action.id}/`)),
        ])
        yield all([
            put({ type: "STORE_WORKFLOW_DATA", payload: transitions.data, fetch: 'workflowclass', label: 'transitions' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: workflow.data, fetch: 'workflowclass', label: 'workflow' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: states.data, fetch: 'workflowclass', label: 'states' }),
        ])
    } catch (error) {
        const errordata = {
            status: [404, 403, 500].includes(error.response.status) ? error.response.status : 'warning',
            message: error.response.data
        }
        yield put({ type: "STORE_WORKFLOW_DATA", payload: errordata, fetch: 'workflowclass', label: 'error' })
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'workflowclass' })
}

export function* workerSelectWorkflowClassTransition(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'workflowclassillustration' })
    try {
        const State = []
        store.getState().workflow.workflowclass.states.forEach(function (store_state) {
            State[store_state.id] = default_class
        })
        const [transition_approvals, transition_approval_hooks] = yield all([
            call(() => axiosInstance.get(`/transition-meta/transition-approval-meta/list/${action.id.id}/`)),
            call(() => axiosInstance.get(`/transition-meta/transition-hook/list/${action.id.id}/`)),
        ])
        yield all([
            put({ type: "STORE_WORKFLOW_DATA", payload: null, fetch: 'workflowclass', label: 'selected_state' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: State, fetch: 'workflowclass', label: 'state_class_mapping' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: transition_approvals.data, fetch: 'workflowclass', label: 'transition_approvals' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: action.id, fetch: 'workflowclass', label: 'selected_transition' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: transition_approval_hooks.data, fetch: 'workflowclass', label: 'transition_approval_hooks' }),
        ])
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'workflowclassillustration' })
}


export function* workerSelectWorkflowClassState(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'workflowclass' })
    try {
        const State = {}
        store.getState().workflow.workflowclass.states.forEach(function (store_state) {
            if (store_state.id === action.id.id) {
                State[store_state.id] = selected_class
            } else {
                State[store_state.id] = default_class
            }
        });
        yield all([
            put({ type: "STORE_WORKFLOW_DATA", payload: null, fetch: 'workflowclass', label: 'selected_transition' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: action.id, fetch: 'workflowclass', label: 'selected_state' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: State, fetch: 'workflowclass', label: 'state_class_mapping' }),
        ])
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'workflowclass' })
}


// -----------------Workflow Objects------------------------------------------------- //

// This code loads the transition approvals and hooks when a transition is selected //
export function* workerSelectWorkflowObjectTransition(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'workflowobject_select' })
    try {
        const [transition_approvals, transition_approval_hooks] = yield all([
            call(() => axiosInstance.get(`/transition/transition-approval/list/${action.id.id}/`)),
            call(() => axiosInstance.get(`/transition/transition-hook/list/${action.id.id}/`)),
        ])
        yield all([
            put({ type: "STORE_WORKFLOW_DATA", payload: transition_approvals.data, fetch: 'workflowobject', label: 'transition_approvals' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: action.id, fetch: 'workflowobject', label: 'selected_transition' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: transition_approval_hooks.data, fetch: 'workflowobject', label: 'transition_approval_hooks' }),
        ])
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'workflowobject_select' })
}

// This code loads the transitions and states for the detail page //
export function* workerWorkflowObjectDetail(action) {
    try {
        yield put({ type: 'SHOW_LOADER', loading: 'workflowobject' })
        const [transitions, states, current_state, current_iteration] = yield all([
            call(() => axiosInstance.get(`/workflow-object/transition/list/${action.workflow_id}/${action.workflow_object_id}/`)),
            call(() => axiosInstance.get(`/workflow-object/state/list/${action.workflow_id}/${action.workflow_object_id}/`)),
            call(() => axiosInstance.get(`/workflow-object/current-state/${action.workflow_id}/${action.workflow_object_id}/`)),
            call(() => axiosInstance.get(`/workflow-object/current-iteration/${action.workflow_id}/${action.workflow_object_id}/`)),
        ])

        const newTransitions = transitions.data.map(transition => ({
            id: transition.id,
            workflow: transition.workflow,
            meta: transition.meta,
            object_id: transition.object_id,
            iteration: transition.iteration,
            is_cancelled: transition.is_cancelled,
            is_done: transition.is_done,
            source_state_id: transition.source_state,
            destination_state_id: transition.destination_state,
            source_state: `${transition.iteration - 1}-${transition.source_state}`,
            destination_state: `${transition.iteration}-${transition.destination_state}`,
        }));
        const newStateMap = {}

        newTransitions.forEach(transition => {
            if (transition.is_done) {
                newStateMap[transition.source_state] = done_class
                newStateMap[transition.destination_state] = selected_class
            } else if (transition.is_cancelled) {
                newStateMap[transition.destination_state] = cancelled_class
            } else {
                newStateMap[transition.destination_state] = default_class
            }
        });

        const newState = states.data.map(item => ({
            ...item.state,
            id: `${item.iteration}-${item.state.id}`,
        }));


        yield all([
            put({ type: 'CLEAR_OBJECT_STATES' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: action.workflow_id, fetch: 'workflowobject', label: 'workflow_id' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: newTransitions, fetch: 'workflowobject', label: 'transitions' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: newStateMap, fetch: 'workflowobject', label: 'state_class_mapping' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: newState, fetch: 'workflowobject', label: 'states' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: action.workflow_object_id, fetch: 'workflowobject', label: 'object_identifier' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: current_state.data, fetch: 'workflowobject', label: 'current_state' }),
            put({ type: "STORE_WORKFLOW_DATA", payload: current_iteration.data, fetch: 'workflowobject', label: 'current_iteration' })
        ])
    } catch (error) {
        console.log(error)
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'workflowobject' })
}

// CRUD FUNCTIONALITIES HERE (WORKFLOW CLASS ONLY)

// Creates Transition Approvals 
export function* workerCreateTransitionApproval(action) {
    try {
        const data = yield call(() => axiosInstance.post(`/transition-approval-meta/create/`, action.data))
        yield put({ type: "UPDATE_WORKFLOW_DATA", payload: data.data.data, label: 'transition_approvals' })

        yield put({ type: "CREATE_NOTIFICATION", id: action.data.workflow, targets: ['all'], extra: 'Approval', action: 'created' })

        yield put({ type: "CREATE_MESSAGE", message: "Successfully created Transition Approval" })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}

// Creates Transitions TODO
export function* workerCreateTransition(action) {
    try {
        const data = yield call(() => axiosInstance.post('/transition-meta/create/', action.data))
        yield put({ type: "WORKFLOWCLASS_DETAIL", id: action.data.workflow })
        yield put({ type: "CREATE_NOTIFICATION", id: action.data.workflow, targets: ['all'], extra: 'Transition', action: 'created' })
        yield put({ type: "CREATE_MESSAGE", message: "Successfully created Transition" })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }

}

// Deletes Transition Approvals
export function* workerDeleteTransitionApproval(action) {
    try {
        yield call(() => axiosInstance.delete(`/transition-approval-meta/delete/${action.id}/`))
        yield put({ type: "REMOVE_WORKFLOW_DATA", payload: action.id, label: 'transition_approvals' })
        const newapprovals = store.getState().workflow.workflowclass.transition_approvals.map((approval, index) => {
            approval.priority = index;
            return approval;
        });
        yield put({ type: "REORDER_TRANSITION_APPROVALS", newApprovals: newapprovals })
        yield put({ type: "CREATE_MESSAGE", message: "Successfully deleted Transition Approval" })
        yield put({ type: "CREATE_NOTIFICATION", id: store.getState().workflow.workflowclass.workflow.id, targets: ['all'], extra: 'Approval', action: 'deleted' })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}

// Creates Transition Hooks
export function* workerCreateTransitionHook(action) {
    try {
        const data = yield call(() => axiosInstance.post(`/transition-hook/create/`, action.data))
        yield put({ type: "UPDATE_WORKFLOW_DATA", payload: data.data.data, label: 'transition_approval_hooks' })
        yield put({ type: "CREATE_MESSAGE", message: "Successfully created Automation" })
        yield put({ type: "CREATE_NOTIFICATION", id: store.getState().workflow.workflowclass.workflow.id, targets: ['all'], extra: 'Automation', action: 'created' })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}

// Deletes Transition Hooks(TO DO)
export function* workerDeleteTransitionHook(action) {
    try {
        yield call(() => axiosInstance.delete(`/transition-hook/delete/${action.id}/`))
        yield put({ type: "REMOVE_WORKFLOW_DATA", payload: action.id, label: 'transition_approval_hooks' })
        yield put({ type: "CREATE_MESSAGE", message: "Successfully deleted Automation" })
        yield put({ type: "CREATE_NOTIFICATION", id: store.getState().workflow.workflowclass.workflow.id, targets: ['all'], extra: 'Automation', action: 'deleted' })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}

// Gets All States
export function* workerStatelist(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'statelist' })
    try {
        const data = yield call(() => axiosInstance.get('/state/list/'))
        yield put({ type: "STORE_WORKFLOW_DATA", payload: data.data, fetch: "statelist" })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'statelist' })
}

// Deletes States
export function* workerDeleteStates(action) {
    try {
        yield call(() => axiosInstance.delete(`state/delete/${action.id}/`))
        yield put({ type: "REMOVE_STATE_LIST", payload: action.id, fetch: "statelist", label: 'statelist' })
        yield put({ type: "CREATE_MESSAGE", message: "Successfully deleted State" })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}

// Create States
export function* workerCreateStates(action) {
    try {
        const data = yield call(() => axiosInstance.post(`/state/create/`, action.data))
        yield put({ type: "UPDATE_STATE_LIST", payload: data.data, fetch: "statelist", label: 'statelist' })
        yield put({ type: "CREATE_MESSAGE", message: "Successfully created State" })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}

// Gets All Automation
export function* workerAutomationlist(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'automationlist' })
    try {
        const data = yield call(() => axiosInstance.get('/function/list/'))
        yield put({ type: "STORE_WORKFLOW_DATA", payload: data.data, fetch: "automationlist" })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'automationlist' })

}

// Creates Automation
export function* workerCreateAutomation(action) {
    try {
        const data = yield call(() => axiosInstance.post('/function/create/', action.data))
        yield put({ type: "UPDATE_AUTOMATION_LIST", payload: data.data, fetch: "automationlist" })
        yield put({ type: "CREATE_MESSAGE", message: "Successfully created new Function" })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}


// Deletes Automation 
// export function* workerDeleteAutomation(action) {
//     try{
//     const data = yield call(() => axiosInstance.delete(`/transition-hook/delete/${action.id}/`))
//     yield put({ type: "REMOVE_AUTOMATION_LIST", payload: data.data, fetch: "automationlist"})
//     yield put({ type: "CREATE_MESSAGE", message: "Successfully deleted Automation" })
//     }catch(error){
//         yield put({ type: "GET_ERRORS",  error: error.response.data })
//     }
// }


// BUSINESS FUNCTIONALITIES HERE (WORKFLOW OBJECTS ONLY)
// Reorders the transitions (TODO , Check the index )
export function* workerReorderTransitions(action) {
    yield put({ type: 'SHOW_LOADER', loading: 'workflowobject' })
    try {
        yield call(() => axiosInstance.post(`/transition-approval-meta/re-prioritize/`,
            action.newApprovals.map(new_aproval => ({ transition_approval_meta_id: new_aproval.id, priority: new_aproval.priority }))))
        yield put({ type: "STORE_WORKFLOW_DATA", payload: action.newApprovals, fetch: 'workflowclass', label: 'transition_approvals' })
        yield put({ type: "CREATE_MESSAGE", message: "Successfully reordered Transition Approvals" })
        yield put({ type: "CREATE_NOTIFICATION", id: store.getState().workflow.workflowclass.workflow.id, targets: ['all'], extra: 'Approvals', action: 'reordered' })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
    yield put({ type: 'HIDE_LOADER', loading: 'workflowobject' })
}


export function* workerApproveTransitionApproval(action) {
    try {
        yield call(() => axiosInstance.post(`/approve/${action.workflow_id}/${action.workflow_object_id}/${action.next_state_id}/${action.transition_id}`))
        yield put({ type: "WORKFLOWOBJECT_DETAIL", workflow_id: action.workflow_id, workflow_object_id: action.workflow_object_id })
        yield put({ type: "CREATE_MESSAGE", message: "Approval is successful" })
    } catch (error) {
        yield put({ type: "GET_ERRORS", error: error.response.data })
    }
}



// for workflow Class
export function* watchWorkflowClasslist() {
    yield takeEvery('WORKFLOWCLASS_LIST', workerWorkflowClassList)
}

export function* watchWorkflowClassDetail() {
    yield takeEvery('WORKFLOWCLASS_DETAIL', workerWorkflowClassDetail)
}

export function* watchSelectWorkflowClassTransition() {
    yield takeEvery('SELECT_WORKFLOWCLASS_TRANSITION', workerSelectWorkflowClassTransition)
}

export function* watchSelectWorkflowClassState() {
    yield takeEvery('SELECT_WORKFLOWCLASS_STATE', workerSelectWorkflowClassState)
}

// for workflow objects
export function* watchSelectWorkflowObjectDetail() {
    yield takeLatest('WORKFLOWOBJECT_DETAIL', workerWorkflowObjectDetail)
}

export function* watchSelectWorkflowObjectTransition() {
    yield takeEvery('SELECT_WORKFLOWOBJECT_TRANSITION', workerSelectWorkflowObjectTransition)
}

// -------------------FOR CRUD FUNCTIONALITIES------------------------------//

// For Class Detail Page
export function* watchCreateTransitionApproval() {
    yield takeEvery('CREATE_TRANSITION_APPROVAL', workerCreateTransitionApproval)
}

export function* watchCreateTransition() {
    yield takeEvery('CREATE_TRANSITION', workerCreateTransition)
}

export function* watchDeleteTransitionApproval() {
    yield takeEvery('DELETE_TRANSITION_APPROVAL', workerDeleteTransitionApproval)
}

export function* watchCreateTransitionHook() {
    yield takeEvery('CREATE_TRANSITION_APPROVAL_HOOK', workerCreateTransitionHook)
}

export function* watchDeleteTransitionHook() {
    yield takeEvery('DELETE_TRANSITION_APPROVAL_HOOK', workerDeleteTransitionHook)
}

// FOR State List page
export function* watchStateList() {
    yield takeEvery('STATE_lIST', workerStatelist)
}

export function* watchDeleteStates() {
    yield takeEvery('DELETE_STATE', workerDeleteStates)
}

export function* watchCreateStates() {
    yield takeEvery('CREATE_STATE', workerCreateStates)
}

// FOR Automation List page
export function* watchAutomationlist() {
    yield takeEvery('AUTOMATION_LIST', workerAutomationlist)
}

export function* watchCreateAutomation() {
    yield takeEvery('CREATE_AUTOMATION', workerCreateAutomation)
}


// FOR BUSINESS FUNCTIONALITIES(OBJECTS ONLY)
export function* watchReorderTransitions() {
    yield takeEvery('REORDER_TRANSITION_APPROVALS', workerReorderTransitions)
}


export function* watchApproveTransitionApproval() {
    yield takeEvery('APPROVE_TRANSITION_APPROVAL', workerApproveTransitionApproval)
}



export default function* rootSaga() {
    yield all([
        watchWorkflowClasslist(),
        watchWorkflowClassDetail(),
        watchSelectWorkflowClassTransition(),
        watchSelectWorkflowClassState(),
        watchSelectWorkflowObjectDetail(),
        watchSelectWorkflowObjectTransition(),
        watchCreateTransitionApproval(),
        watchDeleteTransitionApproval(),
        watchCreateTransitionHook(),
        watchDeleteTransitionHook(),
        watchCreateTransition(),
        watchReorderTransitions(),
        watchStateList(),
        watchDeleteStates(),
        watchCreateStates(),
        watchAutomationlist(),
        watchCreateAutomation(),
        watchApproveTransitionApproval(),
    ])
}